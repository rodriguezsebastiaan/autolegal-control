import { describe, expect, it } from "vitest";
import { vehicleSchema } from "./validations";

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
