import { describe, expect, it } from "vitest";
import { parseCivilDate } from "./dates";
import { formatDate } from "./utils";

describe("presentación de fechas civiles", () => {
  it.each([
    ["2026-10-22", "22/10/2026"],
    ["2026-12-31", "31/12/2026"],
    ["2027-01-01", "01/01/2027"],
    ["2028-02-29", "29/02/2028"],
  ])("no desplaza %s al mostrarla en Colombia", (stored, expected) => {
    expect(formatDate(parseCivilDate(stored))).toBe(expected);
  });
});
