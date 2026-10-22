import { describe, expect, it, vi } from "vitest";
import { findLoginCandidate, type LoginCandidate } from "./credential-auth";

describe("selección segura de identidad", () => {
  const users: Record<string, LoginCandidate> = {
    "org-a:persona@ejemplo.com": { id: "user-a", organizationId: "org-a", passwordHash: "hash-a", active: true },
    "org-b:persona@ejemplo.com": { id: "user-b", organizationId: "org-b", passwordHash: "hash-b", active: true },
  };
  const repository = {
    organization: {
      findUnique: vi.fn(async ({ where }: { where: { loginCode: string } }) =>
        ({ "empresa-a": { id: "org-a" }, "empresa-b": { id: "org-b" } } as Record<string, { id: string }>)[where.loginCode] ?? null),
    },
    user: {
      findUnique: vi.fn(async ({ where }: { where: { organizationId_email: { organizationId: string; email: string } } }) => {
        const key = `${where.organizationId_email.organizationId}:${where.organizationId_email.email}`;
        return users[key] ?? null;
      }),
    },
  };

  it("distingue dos cuentas con el mismo correo mediante el código de organización", async () => {
    await expect(findLoginCandidate(repository, "empresa-a", "persona@ejemplo.com")).resolves.toMatchObject({ id: "user-a" });
    await expect(findLoginCandidate(repository, "empresa-b", "persona@ejemplo.com")).resolves.toMatchObject({ id: "user-b" });
  });

  it("no selecciona una organización arbitraria si el código no existe", async () => {
    await expect(findLoginCandidate(repository, "desconocida", "persona@ejemplo.com")).resolves.toBeNull();
  });

  it("rechaza defensivamente un usuario devuelto desde otro tenant", async () => {
    const compromised = {
      ...repository,
      user: { findUnique: vi.fn(async () => users["org-b:persona@ejemplo.com"]) },
    };
    await expect(findLoginCandidate(compromised, "empresa-a", "persona@ejemplo.com")).resolves.toBeNull();
  });
});
