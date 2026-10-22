import { describe, expect, it } from "vitest";
import { matchingAdvanceDays } from "./alerts";

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
