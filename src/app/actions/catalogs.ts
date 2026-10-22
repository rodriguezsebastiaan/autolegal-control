"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { categorySchema, companySchema, driverSchema, ownerSchema } from "@/lib/validations";

const date = (value?: string) => value ? new Date(`${value}T00:00:00.000Z`) : undefined;

export async function createCategoryAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "SUPERVISOR"]);
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/categorias?error=datos");
  const category = await db.vehicleCategory.create({ data: { organizationId: user.organizationId, ...parsed.data } });
  await audit({ organizationId: user.organizationId, userId: user.id, action: "CATEGORY_CREATED", entityType: "VehicleCategory", entityId: category.id });
  revalidatePath("/categorias"); redirect("/categorias?creada=1");
}

export async function toggleCategoryAction(id: string) {
  const user = await requireRole(["ADMIN", "SUPERVISOR"]);
  const category = await db.vehicleCategory.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!category) return;
  await db.vehicleCategory.update({ where: { id }, data: { active: !category.active } });
  await audit({ organizationId: user.organizationId, userId: user.id, action: category.active ? "CATEGORY_DEACTIVATED" : "CATEGORY_ACTIVATED", entityType: "VehicleCategory", entityId: id });
  revalidatePath("/categorias");
}

export async function createOwnerAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "SUPERVISOR", "DOCUMENT_MANAGER"]);
  const parsed = ownerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/personas?tab=propietarios&error=datos");
  await db.owner.create({ data: { organizationId: user.organizationId, ...parsed.data, email: parsed.data.email || undefined } });
  revalidatePath("/personas"); redirect("/personas?creado=propietario");
}

export async function createCompanyAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "SUPERVISOR", "DOCUMENT_MANAGER"]);
  const parsed = companySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/personas?tab=empresas&error=datos");
  await db.transportCompany.create({ data: { organizationId: user.organizationId, ...parsed.data, email: parsed.data.email || undefined } });
  revalidatePath("/personas"); redirect("/personas?creado=empresa");
}

export async function createDriverAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "SUPERVISOR", "DOCUMENT_MANAGER"]);
  const parsed = driverSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/personas?tab=conductores&error=datos");
  await db.driver.create({ data: { organizationId: user.organizationId, ...parsed.data, email: parsed.data.email || undefined, licenseExpiresAt: date(parsed.data.licenseExpiresAt) } });
  revalidatePath("/personas"); redirect("/personas?creado=conductor");
}

export async function reviewAlertAction(id: string) {
  const user = await requireRole(["ADMIN", "SUPERVISOR", "DOCUMENT_MANAGER"]);
  await db.alertEvent.updateMany({ where: { id, organizationId: user.organizationId, status: "OPEN" }, data: { status: "REVIEWED", reviewedAt: new Date() } });
  revalidatePath("/alertas"); revalidatePath("/dashboard");
}
