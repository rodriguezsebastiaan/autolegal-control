import type { RoleCode, VerificationStatus } from "@prisma/client";

export const documentReviewerRoles: RoleCode[] = ["ADMIN", "SUPERVISOR"];

export function documentReviewError(input: {
  actor: { id: string; organizationId: string; role: { code: RoleCode } };
  document: { id: string; organizationId: string };
  version: { documentId: string; createdById: string | null; verificationStatus: VerificationStatus };
}) {
  if (input.document.organizationId !== input.actor.organizationId) {
    return "El documento no pertenece a tu organización.";
  }
  if (input.version.documentId !== input.document.id || input.version.verificationStatus !== "PENDING") {
    return "La versión ya fue revisada o no está disponible.";
  }
  if (!documentReviewerRoles.includes(input.actor.role.code)) {
    return "No tienes permisos para revisar documentos.";
  }
  if (!input.version.createdById) {
    return "La versión no tiene un creador identificable y requiere regularización administrativa.";
  }
  if (input.version.createdById === input.actor.id) {
    return "No puedes revisar un documento que registraste o actualizaste.";
  }
  return null;
}
