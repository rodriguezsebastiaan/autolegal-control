"use server";

import type { RoleCode } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { documentSchema } from "@/lib/validations";
import type { FormState } from "./vehicles";

const editors: RoleCode[] = ["ADMIN", "SUPERVISOR", "DOCUMENT_MANAGER"];
const toDate = (value?: string) => value ? new Date(`${value}T00:00:00.000Z`) : undefined;

export async function createDocumentAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole(editors);
  const parsed = documentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revisa la información documental.", fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  const [vehicle, type, responsible] = await Promise.all([
    db.vehicle.findFirst({ where: { id: data.vehicleId, organizationId: user.organizationId } }),
    db.documentType.findFirst({ where: { id: data.documentTypeId, organizationId: user.organizationId, active: true } }),
    data.responsibleUserId ? db.user.findFirst({ where: { id: data.responsibleUserId, organizationId: user.organizationId, active: true } }) : null,
  ]);
  if (!vehicle || !type) return { error: "El vehículo o el tipo documental no están disponibles." };
  if (data.responsibleUserId && !responsible) return { error: "El responsable seleccionado no está disponible." };
  if (type.hasExpiration && !data.expiresAt) return { error: `El documento ${type.name} requiere fecha de vencimiento.`, fieldErrors: { expiresAt: ["Fecha obligatoria para este tipo documental"] } };

  const verifiedAt = data.verificationStatus === "VERIFIED" ? new Date() : undefined;
  const document = await db.$transaction(async (tx) => {
    const created = await tx.document.create({ data: {
      organizationId: user.organizationId, vehicleId: vehicle.id, documentTypeId: type.id,
      responsibleUserId: responsible?.id, number: data.number, issuer: data.issuer,
      issuedAt: toDate(data.issuedAt), validFrom: toDate(data.validFrom), expiresAt: toDate(data.expiresAt),
      verificationStatus: data.verificationStatus, verifiedAt, notes: data.notes,
    } });
    await tx.documentVersion.create({ data: {
      documentId: created.id, version: 1, number: created.number, issuer: created.issuer,
      issuedAt: created.issuedAt, validFrom: created.validFrom, expiresAt: created.expiresAt,
      verificationStatus: created.verificationStatus, notes: created.notes, createdById: user.id,
    } });
    return created;
  });
  await audit({ organizationId: user.organizationId, userId: user.id, action: "DOCUMENT_CREATED", entityType: "Document", entityId: document.id, metadata: { vehicleId: vehicle.id, type: type.code } });
  revalidatePath("/documentos"); revalidatePath(`/vehiculos/${vehicle.id}`); revalidatePath("/dashboard");
  redirect(`/vehiculos/${vehicle.id}?documento=creado`);
}
