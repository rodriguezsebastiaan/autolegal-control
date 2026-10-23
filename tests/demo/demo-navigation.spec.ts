import { expect, test } from "@playwright/test";

const routes = [
  ["/panel", "Resumen ejecutivo"],
  ["/panel/vehiculos", "Vehículos"],
  ["/panel/vehiculos/ABC123", "ABC-123"],
  ["/panel/categorias", "Cinco categorías vehiculares"],
  ["/panel/categorias/TX", "Taxis"],
  ["/panel/documentos", "Documentos y vencimientos"],
  ["/panel/alertas", "Centro de alertas"],
  ["/panel/renovaciones", "Renovaciones"],
  ["/panel/propietarios", "Propietarios"],
  ["/panel/conductores", "Conductores"],
  ["/panel/reportes", "Reportes"],
  ["/panel/configuracion", "Configuración"],
] as const;

test("todos los módulos del panel son navegables y están identificados", async ({ page }) => {
  for (const [route, heading] of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator("header").getByText("Entorno local", { exact: true })).toBeVisible();
  }
});

test("la navegación móvil permite recorrer los módulos", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "demo-mobile", "Validación exclusiva del viewport móvil");
  await page.goto("/panel");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
  await page.getByRole("link", { name: "Vehículos" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Vehículos" })).toBeVisible();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(horizontalOverflow).toBe(false);
});

test("los reportes y la configuración real permanecen protegidos", async ({ page }) => {
  await page.goto("/panel/reportes", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /exportación disponible/i })).toHaveCount(4);
  for (const button of await page.getByRole("button", { name: /exportación disponible/i }).all()) await expect(button).toBeDisabled();
  await page.goto("/panel/configuracion", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Configuración protegida")).toBeVisible();
});

test("registra un vehículo y su primer documento en el entorno local", async ({ page }) => {
  await page.goto("/panel/vehiculos", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-demo-hydrated="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Registrar vehículo" }).click();
  const dialog = page.getByRole("dialog", { name: "Registrar vehículo" });
  await dialog.locator('[name="plate"]').fill("TST777");
  await dialog.locator('[name="internalNumber"]').fill("TX-077");
  await dialog.locator('[name="categoryCode"]').selectOption("TX");
  await dialog.locator('[name="service"]').fill("Taxi individual");
  await dialog.locator('[name="brand"]').fill("Renault");
  await dialog.locator('[name="line"]').fill("Logan");
  await dialog.locator('[name="color"]').fill("Amarillo");
  await dialog.locator('[name="ownerId"]').selectOption("demo-owner-05");
  await dialog.locator('[name="documentNumber"]').fill("SOAT-777001");
  await dialog.locator('[name="issuer"]').fill("Aseguradora Nacional");
  await dialog.locator('[name="issuedAt"]').fill("2026-10-23");
  await dialog.locator('[name="expiresAt"]').fill("2027-10-23");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  const row = page.getByRole("row").filter({ hasText: "TST-777" });
  await expect(row).toContainText("Renault");
  await row.getByRole("link", { name: "Abrir ficha" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "TST-777" })).toBeVisible();
  await expect(page.getByText("SOAT-777001")).toBeVisible();
  await expect(page.getByText("Pendiente", { exact: true })).toBeVisible();
});

test("muestra exactamente cinco categorías y permite abrir su flota", async ({ page }) => {
  await page.goto("/panel/categorias", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /Ver y administrar flota/ })).toHaveCount(5);
  await expect(page.getByText("Buses intermunicipales")).toHaveCount(0);
  await page.getByRole("link", { name: /Taxis/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Taxis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar vehículo" })).toBeVisible();
});

test("recalcula la vigencia cuando cambia la fecha de análisis", async ({ page }) => {
  await page.goto("/panel/alertas", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-demo-hydrated="true"]')).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: "SOAT-830194" });
  await expect(row).toContainText("Vigente");
  const cutoffField = page.getByLabel("Fecha de análisis");
  const currentCutoff = await cutoffField.inputValue();
  const expiredCutoff = new Date(`${currentCutoff}T12:00:00Z`);
  expiredCutoff.setUTCDate(expiredCutoff.getUTCDate() + 61);
  const expiredCutoffKey = expiredCutoff.toISOString().slice(0, 10);
  await cutoffField.fill(expiredCutoffKey);
  await expect(row).toContainText("Vencido");
  await expect(page.getByText(/Vigencias calculadas con fecha de corte/)).toBeVisible();
});

test("permite cambiar manualmente el estado operativo de un vehículo", async ({ page }) => {
  await page.goto("/panel/vehiculos/ABC123", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-demo-hydrated="true"]')).toBeVisible();
  await expect(page.getByText("Activo", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cambiar estado" }).click();
  const dialog = page.getByRole("dialog", { name: /Cambiar estado/ });
  await dialog.locator('[name="status"]').selectOption("MAINTENANCE");
  await dialog.locator('[name="note"]').fill("Mantenimiento preventivo programado");
  await dialog.getByRole("button", { name: "Actualizar estado" }).click();
  await expect(page.getByText("Mantenimiento", { exact: true })).toBeVisible();
  await expect(page.getByText("Mantenimiento preventivo programado")).toBeVisible();
  await page.getByRole("button", { name: "Cambiar estado" }).click();
  const secondDialog = page.getByRole("dialog", { name: /Cambiar estado/ });
  await secondDialog.locator('[name="status"]').selectOption("INACTIVE");
  await secondDialog.locator('[name="note"]').fill("Vehículo retirado temporalmente de operación");
  await secondDialog.getByRole("button", { name: "Actualizar estado" }).click();
  await expect(page.getByText("Inactivo", { exact: true })).toBeVisible();
  await page.goto("/panel/alertas");
  await expect(page.getByRole("row").filter({ hasText: "ABC-123" })).toHaveCount(0);
  await page.goto("/panel/vehiculos");
  await page.getByLabel("Estado operativo").selectOption("INACTIVE");
  await expect(page.getByRole("row").filter({ hasText: "ABC-123" })).toBeVisible();
});

test("una renovación aprobada reemplaza la vigencia anterior y reinicia las alertas", async ({ page }) => {
  await page.goto("/panel/renovaciones", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-demo-hydrated="true"]')).toBeVisible();
  const currentRow = page.getByRole("row").filter({ hasText: "RTM-410258" });
  await currentRow.getByRole("button", { name: "Registrar renovación" }).click();
  const renewalDialog = page.getByRole("dialog", { name: /Renovar Revisión técnico-mecánica/ });
  await renewalDialog.locator('[name="number"]').fill("RTM-RENOVADA-001");
  const issuedAt = await renewalDialog.locator('[name="issuedAt"]').inputValue();
  const expiry = new Date(`${issuedAt}T12:00:00Z`);
  expiry.setUTCDate(expiry.getUTCDate() + 365);
  await renewalDialog.locator('[name="expiresAt"]').fill(expiry.toISOString().slice(0, 10));
  await renewalDialog.getByRole("button", { name: "Preparar renovación" }).click();

  const pendingRow = page.getByRole("row").filter({ hasText: "RTM-RENOVADA-001" });
  await expect(pendingRow).toBeVisible();
  await pendingRow.getByRole("button", { name: "Revisar" }).click();
  const reviewDialog = page.getByRole("dialog", { name: /Verificar Revisión técnico-mecánica/ });
  await reviewDialog.getByRole("button", { name: "Aprobar y activar vigencia" }).click();

  await page.goto("/panel/alertas");
  const renewedAlert = page.getByRole("row").filter({ hasText: "RTM-RENOVADA-001" });
  await expect(renewedAlert).toContainText("Vigente");
  await expect(page.getByText("RTM-410258", { exact: true })).toHaveCount(0);
  await page.goto("/panel/documentos");
  const renewedDocument = page.getByRole("row").filter({ hasText: "RTM-RENOVADA-001" });
  await expect(renewedDocument).toContainText("Actual");
  await expect(renewedDocument).toContainText("Verificado");
  const historicalDocument = page.getByRole("row").filter({ hasText: "RTM-410258" });
  await expect(historicalDocument).toContainText("Histórica");
});

test("las barras de filtros mantienen alineación y no desbordan", async ({ page }) => {
  for (const route of ["/panel/vehiculos", "/panel/documentos", "/panel/alertas", "/panel/renovaciones", "/panel/propietarios", "/panel/conductores"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const toolbar = page.getByTestId("filter-bar");
    await expect(toolbar).toBeVisible();
    const layout = await toolbar.evaluate((element) => {
      const controls = [...element.querySelectorAll("input, select")].map((control) => control.getBoundingClientRect());
      const bounds = element.getBoundingClientRect();
      return {
        overflows: element.scrollWidth > element.clientWidth + 1,
        controlsInside: controls.every((control) => control.left >= bounds.left - 1 && control.right <= bounds.right + 1),
        heights: controls.map((control) => Math.round(control.height)),
      };
    });
    expect(layout.overflows, `${route} no debe tener desbordamiento horizontal`).toBe(false);
    expect(layout.controlsInside, `${route} debe contener todos los campos`).toBe(true);
    expect(new Set(layout.heights).size, `${route} debe usar controles de igual altura`).toBeLessThanOrEqual(1);
  }
});
