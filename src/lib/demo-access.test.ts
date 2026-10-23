import { describe, expect, it } from "vitest";
import { isLocalDemoEnabled, LOCAL_DEMO_FLAG } from "./demo-access";

describe("aislamiento del modo de demostración", () => {
  it("solo se habilita en desarrollo con la bandera explícita", () => {
    expect(isLocalDemoEnabled({ nodeEnv: "development", flag: LOCAL_DEMO_FLAG })).toBe(true);
    expect(isLocalDemoEnabled({ nodeEnv: "development" })).toBe(false);
  });

  it.each(["production", "test"])("permanece bloqueado en %s aunque exista la bandera", (nodeEnv) => {
    expect(isLocalDemoEnabled({ nodeEnv, flag: LOCAL_DEMO_FLAG })).toBe(false);
  });
});
