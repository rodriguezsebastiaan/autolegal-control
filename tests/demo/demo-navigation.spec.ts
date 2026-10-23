import { expect, test } from "@playwright/test";

const routes = [
  ["/demo", "Resumen ejecutivo"],
  ["/demo/vehiculos", "Vehículos"],
  ["/demo/vehiculos/DMO101", "DMO-101"],
  ["/demo/categorias", "Seis categorías vehiculares"],
  ["/demo/documentos", "Documentos y vencimientos"],
  ["/demo/alertas", "Centro de alertas"],
  ["/demo/renovaciones", "Renovaciones"],
  ["/demo/propietarios", "Propietarios"],
  ["/demo/empresas", "Empresas transportadoras"],
  ["/demo/conductores", "Conductores"],
  ["/demo/reportes", "Reportes"],
  ["/demo/configuracion", "Configuración"],
] as const;

test("todos los módulos DEMO son navegables y están identificados", async ({ page }) => {
  for (const [route, heading] of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText("Datos DEMO:")).toBeVisible();
    await expect(page.getByText("Solo lectura", { exact: true })).toBeVisible();
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

test("las acciones que requerirían persistencia permanecen deshabilitadas", async ({ page }) => {
  await page.goto("/demo/reportes", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /no disponible/i })).toHaveCount(4);
  for (const button of await page.getByRole("button", { name: /no disponible/i }).all()) await expect(button).toBeDisabled();
  await page.goto("/demo/configuracion", { waitUntil: "domcontentloaded" });
  for (const checkbox of await page.getByRole("checkbox").all()) await expect(checkbox).toBeDisabled();
});
