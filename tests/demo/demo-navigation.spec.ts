import { expect, test } from "@playwright/test";

const routes = [
  ["/demo", "Resumen ejecutivo"],
  ["/demo/vehiculos", "Vehículos"],
  ["/demo/vehiculos/DMO101", "DMO-101"],
  ["/demo/categorias", "Cinco categorías vehiculares"],
  ["/demo/categorias/DEMO-TX", "Taxis"],
  ["/demo/documentos", "Documentos y vencimientos"],
  ["/demo/alertas", "Centro de alertas"],
  ["/demo/renovaciones", "Renovaciones"],
  ["/demo/propietarios", "Propietarios"],
  ["/demo/conductores", "Conductores"],
  ["/demo/reportes", "Reportes"],
  ["/demo/configuracion", "Configuración"],
] as const;

test("todos los módulos DEMO son navegables y están identificados", async ({ page }) => {
  for (const [route, heading] of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText("Datos DEMO:")).toBeVisible();
    await expect(page.getByText("Modo DEMO local", { exact: true })).toBeVisible();
  }
});

test("la navegación móvil permite recorrer los módulos", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "demo-mobile", "Validación exclusiva del viewport móvil");
  await page.goto("/demo");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("navigation", { name: "Módulos de demostración" })).toBeVisible();
  await page.getByRole("link", { name: "Vehículos" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Vehículos" })).toBeVisible();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(horizontalOverflow).toBe(false);
});

test("los reportes y la configuración real permanecen protegidos", async ({ page }) => {
  await page.goto("/demo/reportes", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /exportación disponible/i })).toHaveCount(4);
  for (const button of await page.getByRole("button", { name: /exportación disponible/i }).all()) await expect(button).toBeDisabled();
  await page.goto("/demo/configuracion", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Configuración protegida")).toBeVisible();
});

test("registra un vehículo y su primer documento solo en la DEMO", async ({ page }) => {
  await page.goto("/demo/vehiculos", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-demo-hydrated="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Registrar vehículo" }).click();
  const dialog = page.getByRole("dialog", { name: "Registrar vehículo" });
  await dialog.locator('[name="plate"]').fill("TST777");
  await dialog.locator('[name="internalNumber"]').fill("DEMO-TEST-77");
  await dialog.locator('[name="categoryCode"]').selectOption("DEMO-TX");
  await dialog.locator('[name="service"]').fill("Taxi DEMO");
  await dialog.locator('[name="brand"]').fill("Marca DEMO");
  await dialog.locator('[name="line"]').fill("Línea DEMO");
  await dialog.locator('[name="color"]').fill("Amarillo");
  await dialog.locator('[name="ownerId"]').selectOption("demo-owner-05");
  await dialog.locator('[name="documentNumber"]').fill("SOAT-DEMO-777");
  await dialog.locator('[name="issuer"]').fill("Aseguradora DEMO");
  await dialog.locator('[name="issuedAt"]').fill("2026-10-23");
  await dialog.locator('[name="expiresAt"]').fill("2027-10-23");
  await page.getByRole("button", { name: "Guardar registro DEMO" }).click();
  const row = page.getByRole("row").filter({ hasText: "TST-777" });
  await expect(row).toContainText("Marca DEMO");
  await row.getByRole("link", { name: "Abrir ficha" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "TST-777" })).toBeVisible();
  await expect(page.getByText("SOAT-DEMO-777")).toBeVisible();
  await expect(page.getByText("Pendiente", { exact: true })).toBeVisible();
});

test("muestra exactamente cinco categorías y permite abrir su flota", async ({ page }) => {
  await page.goto("/demo/categorias", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /Ver y administrar flota/ })).toHaveCount(5);
  await expect(page.getByText("Buses intermunicipales")).toHaveCount(0);
  await page.getByRole("link", { name: /Taxis/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Taxis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar vehículo" })).toBeVisible();
});
