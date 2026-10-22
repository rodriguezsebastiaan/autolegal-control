import { describe, expect, it } from "vitest";
import { daysUntil, documentValidity } from "./dates";

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

  it("marca vencido sin mezclarlo con el estado del trámite", () => {
    expect(documentValidity({ expiresAt: "2026-01-01", verificationStatus: "VERIFIED", today: "2026-01-02" })).toEqual({ status: "VENCIDO", daysRemaining: -1 });
  });

  it("prioriza la verificación administrativa", () => {
    expect(documentValidity({ expiresAt: "2026-12-31", verificationStatus: "PENDING", today: "2026-01-01" }).status).toBe("PENDIENTE_VERIFICACION");
  });
});
