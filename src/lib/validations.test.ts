import { describe, expect, it } from "vitest";
import { companySchema, documentSchema, driverSchema, loginSchema, ownerSchema, vehicleSchema } from "./validations";

const base = { categoryId: "cm12345678901234567890123", brand: "Kia", line: "Picanto" };
describe("validación de placas", () => {
  it.each(["ABC123", "abc-123", "ABC12D"])("acepta y normaliza %s", (plate) => {
    const result = vehicleSchema.safeParse({ ...base, plate });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.plate).toBe(plate.replace("-", "").toUpperCase());
  });
  it.each(["12ABC3", "AB123", "ABC-12"])("rechaza %s", (plate) => {
    expect(vehicleSchema.safeParse({ ...base, plate }).success).toBe(false);
  });
});

describe("validación de seguridad y fechas", () => {
  it("exige una organización explícita al iniciar sesión", () => {
    expect(loginSchema.safeParse({ email: "persona@ejemplo.com", password: "segura-123" }).success).toBe(false);
    expect(loginSchema.safeParse({ organizationCode: "empresa-a", email: "persona@ejemplo.com", password: "segura-123" }).success).toBe(true);
  });

  it("rechaza fechas inexistentes antes de enviarlas a Prisma", () => {
    expect(vehicleSchema.safeParse({ ...base, plate: "ABC123", registrationDate: "2027-02-29" }).success).toBe(false);
    expect(documentSchema.safeParse({ vehicleId: base.categoryId, documentTypeId: base.categoryId, verificationStatus: "PENDING", issuedAt: "2026-02-30" }).success).toBe(false);
  });

  it.each([
    [ownerSchema, { personType: "NATURAL", identificationType: "CC", identificationNumber: "12345", displayName: "Persona Demo" }],
    [companySchema, { nit: "900123", businessName: "Empresa Demo" }],
    [driverSchema, { identificationType: "CC", identificationNumber: "54321", fullName: "Conductor Demo" }],
  ])("elimina organizationId enviado por el frontend en catálogos", (schema, input) => {
    const parsed = schema.parse({ ...input, organizationId: "org-b" });
    expect(parsed).not.toHaveProperty("organizationId");
  });
});
