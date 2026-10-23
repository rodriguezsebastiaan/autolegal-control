import { describe, expect, it } from "vitest";
import { getDemoAlert } from "./demo-alerts";
import type { DemoDocument } from "./demo-types";

const base: DemoDocument = {
  id: "demo-doc", plate: "DMO101", type: "SOAT", number: "DEMO-1", issuer: "DEMO",
  issuedAt: "2026-01-01", expiresAt: "2026-10-23", verificationStatus: "VERIFIED",
  responsible: "Analista DEMO", processStatus: "NONE",
};

describe("niveles de alerta DEMO", () => {
  it.each([
    ["2026-10-22", "Vencido", -1],
    ["2026-10-23", "Crítico", 0],
    ["2026-10-26", "Crítico", 3],
    ["2026-10-27", "Alta", 4],
    ["2026-11-07", "Alta", 15],
    ["2026-11-08", "Preventiva", 16],
    ["2026-11-22", "Preventiva", 30],
    ["2026-11-23", "Vigente", 31],
  ] as const)("clasifica %s como %s", (expiresAt, level, days) => {
    expect(getDemoAlert({ ...base, expiresAt }, "2026-10-23")).toMatchObject({ level, daysRemaining: days });
  });

  it("mantiene una nueva vigencia pendiente fuera de las alertas operativas", () => {
    expect(getDemoAlert({ ...base, verificationStatus: "PENDING" }, "2026-10-23").level).toBe("Pendiente de revisión");
  });
});
