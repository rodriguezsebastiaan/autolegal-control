"use server";

import { Prisma, type RoleCode } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCivilDate } from "@/lib/dates";
import { documentReviewError, documentReviewerRoles } from "@/lib/document-workflow";
import { isTenantRecord, tenantRecordWhere } from "@/lib/tenancy";
import { documentRejectionSchema, documentSchema, documentVersionSchema } from "@/lib/validations";
import type { FormState } from "./vehicles";

const editors: RoleCode[] = ["ADMIN", "SUPERVISOR", "DOCUMENT_MANAGER"];
export type ReviewState = FormState;

function friendlyDocumentError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Ya existe una actualización pendiente para este documento. Recárgalo antes de continuar.";
  }
  if (error instanceof Error && error.message === "DOCUMENT_REVIEW_CONFLICT") {
    return "La versión ya fue revisada por otra persona. Recarga la página.";
  }
  return "No fue posible completar la operación documental.";
}

function refreshDocumentPaths(documentId: string, vehicleId?: string | null) {
  revalidatePath("/documentos");
  revalidatePath(`/documentos/${documentId}`);
  if (vehicleId) revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/dashboard");
  revalidatePath("/alertas");
}

export async function createDocumentAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole(editors);
  const parsed = documentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revisa la información documental.", fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  const [vehicle, type, responsible] = await Promise.all([
    db.vehicle.findFirst({ where: { ...tenantRecordWhere(user.organizationId, data.vehicleId), status: { not: "INACTIVE" } } }),
    db.documentType.findFirst({ where: { ...tenantRecordWhere(user.organizationId, data.documentTypeId), active: true } }),
    data.responsibleUserId ? db.user.findFirst({ where: { ...tenantRecordWhere(user.organizationId, data.responsibleUserId), active: true } }) : null,
  ]);
  if (!isTenantRecord(vehicle, user.organizationId, data.vehicleId) || !isTenantRecord(type, user.organizationId, data.documentTypeId, true)) return { error: "El vehículo o el tipo documental no están disponibles." };
  if (data.responsibleUserId && !isTenantRecord(responsible, user.organizationId, data.responsibleUserId, true)) return { error: "El responsable seleccionado no está disponible." };
  if (type.hasExpiration && !data.expiresAt) return { error: `El documento ${type.name} requiere fecha de vencimiento.`, fieldErrors: { expiresAt: ["Fecha obligatoria para este tipo documental"] } };

  const document = await db.$transaction(async (tx) => {
    const created = await tx.document.create({ data: {
      organizationId: user.organizationId, vehicleId: vehicle.id, documentTypeId: type.id,
      responsibleUserId: responsible?.id, createdById: user.id, number: data.number, issuer: data.issuer,
      issuedAt: parseCivilDate(data.issuedAt), validFrom: parseCivilDate(data.validFrom), expiresAt: parseCivilDate(data.expiresAt),
      verificationStatus: "PENDING", verifiedAt: null, verifiedById: null, notes: data.notes,
    } });
    const version = await tx.documentVersion.create({ data: {
      documentId: created.id, version: 1, number: created.number, issuer: created.issuer,
      issuedAt: created.issuedAt, validFrom: created.validFrom, expiresAt: created.expiresAt,
      responsibleUserId: created.responsibleUserId, verificationStatus: "PENDING", notes: created.notes, createdById: user.id,
    } });
    await tx.auditLog.create({ data: {
      organizationId: user.organizationId, userId: user.id, action: "DOCUMENT_CREATED_PENDING_REVIEW",
      entityType: "Document", entityId: created.id,
      metadata: { vehicleId: vehicle.id, documentType: type.code, versionId: version.id, version: 1 },
    } });
    return created;
  });

  refreshDocumentPaths(document.id, vehicle.id);
  redirect(`/documentos/${document.id}?creado=1`);
}

export async function updateDocumentAction(documentId: string, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole(editors);
  const parsed = documentVersionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revisa la información documental.", fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  const [document, responsible, pendingVersion] = await Promise.all([
    db.document.findFirst({ where: {
      ...tenantRecordWhere(user.organizationId, documentId),
      documentType: { organizationId: user.organizationId },
      vehicle: { organizationId: user.organizationId },
    }, include: { documentType: true } }),
    data.responsibleUserId ? db.user.findFirst({ where: { ...tenantRecordWhere(user.organizationId, data.responsibleUserId), active: true } }) : null,
    db.documentVersion.findFirst({ where: {
      documentId,
      verificationStatus: "PENDING",
      document: {
        organizationId: user.organizationId,
        documentType: { organizationId: user.organizationId },
        vehicle: { organizationId: user.organizationId },
      },
    }, select: { id: true } }),
  ]);
  if (!document || document.organizationId !== user.organizationId) return { error: "El documento no existe o no pertenece a tu organización." };
  if (data.responsibleUserId && !isTenantRecord(responsible, user.organizationId, data.responsibleUserId, true)) return { error: "El responsable seleccionado no está disponible." };
  if (document.documentType.hasExpiration && !data.expiresAt) return { error: `El documento ${document.documentType.name} requiere fecha de vencimiento.`, fieldErrors: { expiresAt: ["Fecha obligatoria para este tipo documental"] } };
  if (pendingVersion) return { error: "Ya existe una actualización pendiente de revisión." };

  try {
    await db.$transaction(async (tx) => {
      const latest = await tx.documentVersion.findFirst({ where: { documentId }, orderBy: { version: "desc" }, select: { version: true } });
      const nextVersion = (latest?.version ?? 0) + 1;
      const version = await tx.documentVersion.create({ data: {
        documentId, version: nextVersion, number: data.number, issuer: data.issuer,
        issuedAt: parseCivilDate(data.issuedAt), validFrom: parseCivilDate(data.validFrom), expiresAt: parseCivilDate(data.expiresAt),
        responsibleUserId: responsible?.id, verificationStatus: "PENDING", notes: data.notes, createdById: user.id,
      } });
      await tx.auditLog.create({ data: {
        organizationId: user.organizationId, userId: user.id, action: "DOCUMENT_UPDATE_SUBMITTED",
        entityType: "Document", entityId: documentId, metadata: { versionId: version.id, version: nextVersion },
      } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    return { error: friendlyDocumentError(error) };
  }

  refreshDocumentPaths(documentId, document.vehicleId);
  redirect(`/documentos/${documentId}?actualizacion=pendiente`);
}

async function reviewDocumentVersion(versionId: string, decision: "APPROVE" | "REJECT", formData: FormData): Promise<ReviewState> {
  const user = await requireRole(documentReviewerRoles);
  const rejection = decision === "REJECT" ? documentRejectionSchema.safeParse(Object.fromEntries(formData)) : null;
  if (rejection && !rejection.success) return { error: "Registra un motivo de rechazo válido.", fieldErrors: rejection.error.flatten().fieldErrors };

  const version = await db.documentVersion.findFirst({ where: {
    id: versionId,
    document: {
      organizationId: user.organizationId,
      documentType: { organizationId: user.organizationId },
      vehicle: { organizationId: user.organizationId },
    },
  }, include: { document: true } });
  if (!version) return { error: "La versión no existe o no pertenece a tu organización." };
  const permissionError = documentReviewError({ actor: user, document: version.document, version });
  if (permissionError) return { error: permissionError };

  const reviewedAt = new Date();
  const reason = rejection?.success ? rejection.data.reason : null;
  try {
    await db.$transaction(async (tx) => {
      const claimed = await tx.documentVersion.updateMany({
        where: { id: version.id, documentId: version.documentId, verificationStatus: "PENDING" },
        data: { verificationStatus: decision === "APPROVE" ? "VERIFIED" : "REJECTED", reviewedById: user.id, reviewedAt, rejectionReason: reason },
      });
      if (claimed.count !== 1) throw new Error("DOCUMENT_REVIEW_CONFLICT");

      if (decision === "APPROVE") {
        const activated = await tx.document.updateMany({
          where: tenantRecordWhere(user.organizationId, version.documentId),
          data: {
            number: version.number, issuer: version.issuer, issuedAt: version.issuedAt, validFrom: version.validFrom,
            expiresAt: version.expiresAt, responsibleUserId: version.responsibleUserId, fileKey: version.fileKey,
            originalFileName: version.originalFileName, notes: version.notes, verificationStatus: "VERIFIED",
            verifiedAt: reviewedAt, reviewedAt, verifiedById: user.id, rejectionReason: null,
          },
        });
        if (activated.count !== 1) throw new Error("DOCUMENT_REVIEW_CONFLICT");
        await tx.alertEvent.updateMany({
          where: { organizationId: user.organizationId, documentId: version.documentId, status: { in: ["OPEN", "REVIEWED"] } },
          data: { status: "CANCELLED", resolvedAt: reviewedAt },
        });
      } else if (version.document.verificationStatus !== "VERIFIED") {
        await tx.document.updateMany({
          where: tenantRecordWhere(user.organizationId, version.documentId),
          data: { verificationStatus: "REJECTED", reviewedAt, verifiedAt: null, verifiedById: null, rejectionReason: reason },
        });
      }

      await tx.auditLog.create({ data: {
        organizationId: user.organizationId, userId: user.id,
        action: decision === "APPROVE" ? "DOCUMENT_VERSION_APPROVED" : "DOCUMENT_VERSION_REJECTED",
        entityType: "Document", entityId: version.documentId,
        metadata: { versionId: version.id, version: version.version, reason },
      } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    return { error: friendlyDocumentError(error) };
  }

  refreshDocumentPaths(version.documentId, version.document.vehicleId);
  redirect(`/documentos/${version.documentId}?revision=${decision === "APPROVE" ? "aprobada" : "rechazada"}`);
}

export async function approveDocumentVersionAction(versionId: string, _: ReviewState, formData: FormData) {
  return reviewDocumentVersion(versionId, "APPROVE", formData);
}

export async function rejectDocumentVersionAction(versionId: string, _: ReviewState, formData: FormData) {
  return reviewDocumentVersion(versionId, "REJECT", formData);
}
