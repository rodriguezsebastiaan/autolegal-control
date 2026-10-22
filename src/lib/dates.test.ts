import { describe, expect, it } from "vitest";
import { addCivilDays, dateKey, daysUntil, documentValidity, formatCivilDate, isCivilDate, parseCivilDate } from "./dates";

describe("cálculo de vencimientos", () => {
  it.each([60, 30, 20, 17, 10, 5, 3, 1, 0])("calcula exactamente %i días", (days) => {
    const expiration = new Date(Date.UTC(2026, 2, 1 + days));
    expect(daysUntil(expiration, "2026-03-01")).toBe(days);
  });

  it("atraviesa correctamente un cambio de mes", () => {
    expect(daysUntil("2026-04-02", "2026-03-30")).toBe(3);
  });

  it("incluye el 29 de febrero en años bisiestos", () => {
    expect(daysUntil("2028-03-01", "2028-02-28")).toBe(2);
  });

  it.each([
    ["2026-10-22", "22/10/2026"],
    ["2026-12-31", "31/12/2026"],
    ["2027-01-01", "01/01/2027"],
    ["2028-02-29", "29/02/2028"],
  ])("conserva la fecha civil %s al mostrarla en Colombia", (stored, displayed) => {
    const prismaDate = parseCivilDate(stored);
    expect(prismaDate?.toISOString()).toBe(`${stored}T00:00:00.000Z`);
    expect(dateKey(prismaDate!)).toBe(stored);
    expect(formatCivilDate(prismaDate)).toBe(displayed);
  });

  it("rechaza fechas civiles inexistentes", () => {
    expect(isCivilDate("2027-02-29")).toBe(false);
    expect(isCivilDate("2026-13-01")).toBe(false);
    expect(() => parseCivilDate("2026-02-30")).toThrow(RangeError);
  });

  it.each([
    ["2026-01-31", 1, "2026-02-01"],
    ["2026-12-31", 1, "2027-01-01"],
    ["2028-02-28", 1, "2028-02-29"],
    ["2028-02-29", 1, "2028-03-01"],
  ])("suma días civiles entre meses y años: %s + %i", (start, amount, expected) => {
    expect(dateKey(addCivilDays(start, amount))).toBe(expected);
  });

  it("marca vencido sin mezclarlo con el estado del trámite", () => {
    expect(documentValidity({ expiresAt: "2026-01-01", verificationStatus: "VERIFIED", today: "2026-01-02" })).toEqual({ status: "VENCIDO", daysRemaining: -1 });
  });

  it("prioriza la verificación administrativa", () => {
    expect(documentValidity({ expiresAt: "2026-12-31", verificationStatus: "PENDING", today: "2026-01-01" }).status).toBe("PENDIENTE_VERIFICACION");
  });
});
