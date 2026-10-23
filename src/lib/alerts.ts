import { Prisma, VerificationStatus } from "@prisma/client";
import { db } from "./db";
import { addCivilDays, bogotaToday, dateKey, daysUntil, parseCivilDate } from "./dates";

const ALERT_ENGINE_LOCK_KEY = 1_983_041_709;
export const DEFAULT_ALERT_RECOVERY_DAYS = 7;
export const MAX_ALERT_RECOVERY_DAYS = 30;

export type AlertPlan = {
  scheduledDate: string;
  daysLate: number;
  outcome: "FUTURE" | "DUE" | "RECOVERED" | "OMITTED";
};

export function resolveAlertRecoveryDays(value = process.env.ALERT_RECOVERY_DAYS) {
  if (value === undefined || value === "") return DEFAULT_ALERT_RECOVERY_DAYS;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_ALERT_RECOVERY_DAYS) {
    throw new RangeError(`ALERT_RECOVERY_DAYS debe ser un entero entre 0 y ${MAX_ALERT_RECOVERY_DAYS}`);
  }
  return parsed;
}

export function planAlertEvaluation(
  expiration: Date | string,
  advanceDays: number,
  today = bogotaToday(),
  recoveryDays = DEFAULT_ALERT_RECOVERY_DAYS,
): AlertPlan {
  if (!Number.isInteger(advanceDays) || advanceDays < 0) throw new RangeError("La anticipación debe ser un entero no negativo");
  if (!Number.isInteger(recoveryDays) || recoveryDays < 0 || recoveryDays > MAX_ALERT_RECOVERY_DAYS) throw new RangeError("Política de recuperación inválida");
  const scheduledDate = dateKey(addCivilDays(expiration, -advanceDays));
  const remaining = daysUntil(scheduledDate, today);
  const daysLate = remaining === 0 ? 0 : -remaining;
  if (daysLate < 0) return { scheduledDate, daysLate, outcome: "FUTURE" };
  if (daysLate === 0) return { scheduledDate, daysLate, outcome: "DUE" };
  if (daysLate <= recoveryDays) return { scheduledDate, daysLate, outcome: "RECOVERED" };
  return { scheduledDate, daysLate, outcome: "OMITTED" };
}

export function matchingAdvanceDays(expiration: Date | string, advanceDays: number[], today = bogotaToday()) {
  const remaining = daysUntil(expiration, today);
  return advanceDays.includes(remaining) ? remaining : null;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1000) : "Error desconocido del motor de alertas";
}

export async function evaluateAlerts(today = bogotaToday(), recoveryDays = resolveAlertRecoveryDays()) {
  const evaluationDate = parseCivilDate(today)!;
  try {
    return await db.$transaction(async (tx) => {
      const lock = await tx.$queryRaw<Array<{ acquired: boolean }>>`
        SELECT pg_try_advisory_xact_lock(${ALERT_ENGINE_LOCK_KEY}) AS acquired
      `;
      if (!lock[0]?.acquired) {
        const run = await tx.alertEvaluationRun.create({ data: {
          evaluationDate, recoveryDays, status: "SKIPPED_CONCURRENT", completedAt: new Date(),
        } });
        return { runId: run.id, date: today, recoveryDays, status: run.status, evaluated: 0, generated: 0, recovered: 0, alreadyExists: 0, omitted: 0, failed: 0 };
      }

      const run = await tx.alertEvaluationRun.create({ data: { evaluationDate, recoveryDays, status: "RUNNING" } });
      const documents = await tx.document.findMany({
        where: {
          expiresAt: { not: null },
          verificationStatus: VerificationStatus.VERIFIED,
          documentType: { active: true },
          vehicle: { status: { not: "INACTIVE" } },
        },
        include: {
          documentType: { include: { alertRules: { where: { active: true } } } },
          vehicle: { include: { affiliations: { where: { isCurrent: true }, take: 1, include: { company: true } } } },
        },
      });

      const counters = { evaluated: documents.length, generated: 0, recovered: 0, alreadyExists: 0, omitted: 0, failed: 0 };
      for (const document of documents) {
        if (
          !document.expiresAt || !document.vehicle ||
          document.vehicle.organizationId !== document.organizationId ||
          document.documentType.organizationId !== document.organizationId
        ) continue;
        const affiliation = document.vehicle.affiliations[0];
        const companyId = affiliation?.company.organizationId === document.organizationId ? affiliation.companyId : undefined;
        const applicableRules = document.documentType.alertRules.filter(
          (rule) => rule.organizationId === document.organizationId && (!rule.vehicleId || rule.vehicleId === document.vehicleId) && (!rule.companyId || rule.companyId === companyId),
        );

        for (const rule of applicableRules) {
          const plan = planAlertEvaluation(document.expiresAt, rule.advanceDays, today, recoveryDays);
          if (plan.outcome === "FUTURE") continue;
          const scheduledDate = parseCivilDate(plan.scheduledDate)!;
          if (plan.outcome === "OMITTED") {
            counters.omitted += 1;
            await tx.alertEvaluationLog.create({ data: {
              runId: run.id, organizationId: document.organizationId, documentId: document.id, alertRuleId: rule.id,
              scheduledDate, outcome: "OMITTED", reason: `Fuera de la ventana de recuperación de ${recoveryDays} días (${plan.daysLate} días de atraso)`,
            } });
            continue;
          }

          await tx.$executeRawUnsafe("SAVEPOINT alert_evaluation_item");
          try {
            const existing = await tx.alertEvent.findUnique({
              where: { documentId_alertRuleId_triggerDate: { documentId: document.id, alertRuleId: rule.id, triggerDate: scheduledDate } },
            });
            if (existing) {
              counters.alreadyExists += 1;
              await tx.alertEvaluationLog.create({ data: {
                runId: run.id, organizationId: document.organizationId, documentId: document.id, alertRuleId: rule.id,
                eventId: existing.id, scheduledDate, outcome: "ALREADY_EXISTS", reason: "Evento idempotente ya registrado para la fecha lógica",
              } });
            } else {
              const event = await tx.alertEvent.create({ data: {
                organizationId: document.organizationId, documentId: document.id, alertRuleId: rule.id,
                responsibleUserId: document.responsibleUserId, triggerDate: scheduledDate,
              } });
              if (rule.channel === "EMAIL") {
                await tx.notificationDelivery.create({ data: {
                  alertEventId: event.id, recipient: "integracion-pendiente", channel: "EMAIL", attempt: 1,
                  status: process.env.EXTERNAL_EMAIL_ENABLED === "true" ? "PENDING" : "DISABLED",
                  errorMessage: process.env.EXTERNAL_EMAIL_ENABLED === "true" ? null : "Integración de correo desactivada",
                } });
              }
              const outcome = plan.outcome === "RECOVERED" ? "RECOVERED" : "GENERATED";
              counters[plan.outcome === "RECOVERED" ? "recovered" : "generated"] += 1;
              await tx.alertEvaluationLog.create({ data: {
                runId: run.id, organizationId: document.organizationId, documentId: document.id, alertRuleId: rule.id,
                eventId: event.id, scheduledDate, outcome,
                reason: plan.outcome === "RECOVERED" ? `Recuperado con ${plan.daysLate} días de atraso` : "Generado en su fecha lógica",
              } });
            }
            await tx.$executeRawUnsafe("RELEASE SAVEPOINT alert_evaluation_item");
          } catch (error) {
            await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT alert_evaluation_item");
            counters.failed += 1;
            await tx.alertEvaluationLog.create({ data: {
              runId: run.id, organizationId: document.organizationId, documentId: document.id, alertRuleId: rule.id,
              scheduledDate, outcome: "FAILED", reason: "Fallo al generar o recuperar el evento", errorMessage: errorMessage(error),
            } });
            await tx.$executeRawUnsafe("RELEASE SAVEPOINT alert_evaluation_item");
          }
        }
      }

      const status = counters.failed > 0 ? "PARTIAL" : "COMPLETED";
      await tx.alertEvaluationRun.update({ where: { id: run.id }, data: { ...counters, status, completedAt: new Date() } });
      return { runId: run.id, date: today, recoveryDays, status, ...counters };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5_000, timeout: 120_000 });
  } catch (error) {
    const failedRun = await db.alertEvaluationRun.create({ data: {
      evaluationDate, recoveryDays, status: "FAILED", failed: 1, errorMessage: errorMessage(error), completedAt: new Date(),
    } });
    return { runId: failedRun.id, date: today, recoveryDays, status: "FAILED" as const, evaluated: 0, generated: 0, recovered: 0, alreadyExists: 0, omitted: 0, failed: 1, error: errorMessage(error) };
  }
}
