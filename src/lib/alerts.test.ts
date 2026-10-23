import { describe, expect, it } from "vitest";
import { matchingAdvanceDays, planAlertEvaluation, resolveAlertRecoveryDays } from "./alerts";

describe("reglas de anticipación", () => {
  const rules = [60, 30, 20, 17, 10, 5, 3, 1, 0];
  it.each(rules)("activa la regla de %i días una sola vez por fecha lógica", (days) => {
    const expiration = new Date(Date.UTC(2026, 5, 1 + days));
    expect(matchingAdvanceDays(expiration, rules, "2026-06-01")).toBe(days);
  });
  it("no activa anticipaciones no configuradas", () => {
    expect(matchingAdvanceDays("2026-06-08", rules, "2026-06-01")).toBeNull();
  });
});

describe("recuperación de ejecuciones omitidas", () => {
  it.each([1, 3, 7])("recupera una alerta con %i día(s) de atraso dentro de la política predeterminada", (daysLate) => {
    const day = String(5 + daysLate).padStart(2, "0");
    expect(planAlertEvaluation("2026-06-10", 5, `2026-06-${day}`)).toEqual({
      scheduledDate: "2026-06-05",
      daysLate,
      outcome: "RECOVERED",
    });
  });

  it("omite 15 días de atraso con la ventana predeterminada para evitar inundaciones", () => {
    expect(planAlertEvaluation("2026-06-10", 5, "2026-06-20")).toMatchObject({ daysLate: 15, outcome: "OMITTED" });
  });

  it("permite recuperar 15 días cuando la política se amplía explícitamente", () => {
    expect(planAlertEvaluation("2026-06-10", 5, "2026-06-20", 15)).toMatchObject({ daysLate: 15, outcome: "RECOVERED" });
  });

  it("genera en la fecha lógica exacta y conserva esa clave en reejecuciones", () => {
    expect(planAlertEvaluation("2026-06-10", 5, "2026-06-05")).toEqual({ scheduledDate: "2026-06-05", daysLate: 0, outcome: "DUE" });
    expect(planAlertEvaluation("2026-06-10", 5, "2026-06-07").scheduledDate).toBe("2026-06-05");
  });

  it("calcula correctamente al cruzar mes y año", () => {
    expect(planAlertEvaluation("2027-01-03", 5, "2026-12-30")).toEqual({ scheduledDate: "2026-12-29", daysLate: 1, outcome: "RECOVERED" });
  });

  it("respeta el 29 de febrero en año bisiesto", () => {
    expect(planAlertEvaluation("2028-03-01", 1, "2028-03-01")).toEqual({ scheduledDate: "2028-02-29", daysLate: 1, outcome: "RECOVERED" });
  });

  it("valida el rango de la política configurable", () => {
    expect(resolveAlertRecoveryDays("0")).toBe(0);
    expect(resolveAlertRecoveryDays("30")).toBe(30);
    expect(() => resolveAlertRecoveryDays("31")).toThrow(/entre 0 y 30/i);
    expect(() => resolveAlertRecoveryDays("1.5")).toThrow(/entero/i);
  });
});
