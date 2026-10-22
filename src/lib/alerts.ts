import { Prisma, VerificationStatus } from "@prisma/client";
import { db } from "./db";
import { bogotaToday, dateKey, daysUntil, parseCivilDate } from "./dates";

export function matchingAdvanceDays(expiration: Date | string, advanceDays: number[], today = bogotaToday()) {
  const remaining = daysUntil(expiration, today);
  return advanceDays.includes(remaining) ? remaining : null;
}

export async function evaluateAlerts(today = bogotaToday()) {
  const documents = await db.document.findMany({
    where: {
      expiresAt: { not: null },
      verificationStatus: VerificationStatus.VERIFIED,
      documentType: { active: true },
    },
    include: {
      documentType: { include: { alertRules: { where: { active: true } } } },
      vehicle: { include: { affiliations: { where: { isCurrent: true }, take: 1 } } },
    },
  });

  let created = 0;
  for (const document of documents) {
    if (
      !document.expiresAt ||
      !document.vehicle ||
      document.vehicle.organizationId !== document.organizationId ||
      document.documentType.organizationId !== document.organizationId
    ) continue;
    const companyId = document.vehicle.affiliations[0]?.companyId;
    const applicableRules = document.documentType.alertRules.filter(
      (rule) => rule.organizationId === document.organizationId && (!rule.vehicleId || rule.vehicleId === document.vehicleId) && (!rule.companyId || rule.companyId === companyId),
    );

    for (const rule of applicableRules) {
      if (matchingAdvanceDays(document.expiresAt, [rule.advanceDays], today) === null) continue;
      const result = await db.$transaction(async (tx) => {
        const event = await tx.alertEvent.upsert({
          where: {
            documentId_alertRuleId_triggerDate: {
              documentId: document.id,
              alertRuleId: rule.id,
              triggerDate: parseCivilDate(today)!,
            },
          },
          update: {},
          create: {
            organizationId: document.organizationId,
            documentId: document.id,
            alertRuleId: rule.id,
            responsibleUserId: document.responsibleUserId,
            triggerDate: parseCivilDate(today)!,
          },
        });
        if (rule.channel === "EMAIL") {
          await tx.notificationDelivery.upsert({
            where: {
              alertEventId_recipient_channel_attempt: {
                alertEventId: event.id,
                recipient: "integracion-pendiente",
                channel: "EMAIL",
                attempt: 1,
              },
            },
            update: {},
            create: {
              alertEventId: event.id,
              recipient: "integracion-pendiente",
              channel: "EMAIL",
              status: process.env.EXTERNAL_EMAIL_ENABLED === "true" ? "PENDING" : "DISABLED",
              errorMessage: process.env.EXTERNAL_EMAIL_ENABLED === "true" ? null : "Integración de correo desactivada",
            },
          });
        }
        return event;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      if (dateKey(result.createdAt) === today) created += 1;
    }
  }
  return { evaluated: documents.length, created, date: today };
}
