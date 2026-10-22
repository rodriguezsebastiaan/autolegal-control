import { describe, expect, it } from "vitest";
import { isTenantRecord, tenantRecordWhere, validateVehicleReferences } from "./tenancy";

describe("aislamiento multiempresa", () => {
  const organizationA = "org-a";
  const organizationB = "org-b";
  const categoryA = { id: "category-a", organizationId: organizationA, active: true };

  it("incluye siempre organización e id en el filtro de una mutación", () => {
    expect(tenantRecordWhere(organizationA, "vehicle-a")).toEqual({ id: "vehicle-a", organizationId: organizationA });
  });

  it("un usuario de A no puede autorizar un vehículo de B", () => {
    expect(isTenantRecord({ id: "vehicle-b", organizationId: organizationB }, organizationA, "vehicle-b")).toBe(false);
  });

  it.each([
    ["categoría", { category: { id: "category-b", organizationId: organizationB, active: true }, owner: null, company: null }],
    ["propietario", { category: categoryA, owner: { id: "owner-b", organizationId: organizationB, active: true }, company: null }],
    ["empresa", { category: categoryA, owner: null, company: { id: "company-b", organizationId: organizationB, active: true } }],
  ])("rechaza una referencia de %s perteneciente a B", (_, references) => {
    const error = validateVehicleReferences({
      organizationId: organizationA,
      categoryId: references.category.id,
      ownerId: references.owner?.id,
      companyId: references.company?.id,
      ...references,
    });
    expect(error).toMatch(/no está disponible/i);
  });

  it("acepta únicamente referencias activas de la misma organización", () => {
    expect(validateVehicleReferences({
      organizationId: organizationA,
      categoryId: categoryA.id,
      ownerId: "owner-a",
      companyId: "company-a",
      category: categoryA,
      owner: { id: "owner-a", organizationId: organizationA, active: true },
      company: { id: "company-a", organizationId: organizationA, active: true },
    })).toBeNull();
  });
});
