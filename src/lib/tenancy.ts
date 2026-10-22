export type TenantRecord = {
  id: string;
  organizationId: string;
  active?: boolean;
};

export function tenantRecordWhere(organizationId: string, id: string) {
  return { id, organizationId } as const;
}

export function isTenantRecord<T extends TenantRecord>(
  record: T | null | undefined,
  organizationId: string,
  id: string,
  requireActive = false,
): record is T {
  return Boolean(
    record &&
    record.id === id &&
    record.organizationId === organizationId &&
    (!requireActive || record.active === true),
  );
}

export function validateVehicleReferences(input: {
  organizationId: string;
  categoryId: string;
  ownerId?: string;
  companyId?: string;
  category: TenantRecord | null;
  owner: TenantRecord | null;
  company: TenantRecord | null;
}) {
  if (!isTenantRecord(input.category, input.organizationId, input.categoryId, true)) {
    return "La categoría seleccionada no está disponible.";
  }
  if (input.ownerId && !isTenantRecord(input.owner, input.organizationId, input.ownerId, true)) {
    return "El propietario seleccionado no está disponible.";
  }
  if (input.companyId && !isTenantRecord(input.company, input.organizationId, input.companyId, true)) {
    return "La empresa seleccionada no está disponible.";
  }
  return null;
}
