import { expect, test } from "@playwright/test";

test("la pantalla de acceso no expone registro público", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
  await expect(page.getByLabel("Código de organización")).toBeVisible();
  await expect(page.getByLabel("Correo institucional")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar al sistema" })).toBeVisible();
  await expect(page.getByText("No hay registro público")).toBeVisible();
});
