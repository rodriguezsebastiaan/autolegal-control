"use server";

import { Prisma, RoleCode } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { vehicleSchema } from "@/lib/validations";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]> };
const editors: RoleCode[] = ["ADMIN", "SUPERVISOR", "DOCUMENT_MANAGER"];
const toDate = (value?: string) => value ? new Date(`${value}T00:00:00.000Z`) : undefined;
const optionalNumber = (value: number | "" | undefined) => value === "" ? undefined : value;

function friendlyPrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return "Ya existe un registro con uno de los datos únicos ingresados.";
  return "No fue posible guardar el vehículo. Intenta de nuevo.";
}

export async function createVehicleAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole(editors);
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revisa los campos señalados.", fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  const [category, owner, company, duplicate] = await Promise.all([
    db.vehicleCategory.findFirst({ where: { id: data.categoryId, organizationId: user.organizationId, active: true } }),
    data.ownerId ? db.owner.findFirst({ where: { id: data.ownerId, organizationId: user.organizationId, active: true } }) : null,
    data.companyId ? db.transportCompany.findFirst({ where: { id: data.companyId, organizationId: user.organizationId, active: true } }) : null,
    db.vehicle.findFirst({ where: { organizationId: user.organizationId, plate: data.plate, status: { not: "INACTIVE" } } }),
  ]);
  if (!category) return { error: "La categoría seleccionada no está disponible." };
  if (data.ownerId && !owner) return { error: "El propietario seleccionado no está disponible." };
  if (data.companyId && !company) return { error: "La empresa seleccionada no está disponible." };
  if (duplicate) return { error: `Ya existe un vehículo activo con la placa ${data.plate}.` };

  let vehicleId: string;
  try {
    const vehicle = await db.$transaction(async (tx) => {
      const created = await tx.vehicle.create({ data: {
        organizationId: user.organizationId, categoryId: data.categoryId, plate: data.plate,
        internalNumber: data.internalNumber, vehicleClass: data.vehicleClass, brand: data.brand, line: data.line,
        model: data.model, year: optionalNumber(data.year), color: data.color, vin: data.vin,
        chassisNumber: data.chassisNumber, engineNumber: data.engineNumber, fuelType: data.fuelType,
        passengerCapacity: optionalNumber(data.passengerCapacity), registrationDate: toDate(data.registrationDate),
        transitAuthority: data.transitAuthority, serviceType: data.serviceType, transportModality: data.transportModality,
        operationRadius: data.operationRadius, responsibleName: data.responsibleName, notes: data.notes,
      } });
      if (owner) await tx.vehicleOwner.create({ data: { vehicleId: created.id, ownerId: owner.id, startsAt: new Date() } });
      if (company) await tx.vehicleAffiliation.create({ data: { vehicleId: created.id, companyId: company.id, startsAt: new Date() } });
      return created;
    });
    vehicleId = vehicle.id;
    await audit({ organizationId: user.organizationId, userId: user.id, action: "VEHICLE_CREATED", entityType: "Vehicle", entityId: vehicle.id, metadata: { plate: vehicle.plate } });
  } catch (error) { return { error: friendlyPrismaError(error) }; }
  revalidatePath("/vehiculos");
  revalidatePath("/dashboard");
  redirect(`/vehiculos/${vehicleId}?creado=1`);
}

export async function updateVehicleAction(vehicleId: string, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole(editors);
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revisa los campos señalados.", fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  const existing = await db.vehicle.findFirst({ where: { id: vehicleId, organizationId: user.organizationId } });
  if (!existing) return { error: "El vehículo no existe o no pertenece a tu organización." };
  const duplicate = await db.vehicle.findFirst({ where: { organizationId: user.organizationId, plate: data.plate, status: { not: "INACTIVE" }, id: { not: vehicleId } } });
  if (duplicate) return { error: `Ya existe otro vehículo activo con la placa ${data.plate}.` };
  try {
    await db.$transaction(async (tx) => {
      await tx.vehicle.update({ where: { id: vehicleId }, data: {
        categoryId: data.categoryId, plate: data.plate, internalNumber: data.internalNumber, vehicleClass: data.vehicleClass,
        brand: data.brand, line: data.line, model: data.model, year: optionalNumber(data.year), color: data.color,
        vin: data.vin, chassisNumber: data.chassisNumber, engineNumber: data.engineNumber, fuelType: data.fuelType,
        passengerCapacity: optionalNumber(data.passengerCapacity), registrationDate: toDate(data.registrationDate),
        transitAuthority: data.transitAuthority, serviceType: data.serviceType, transportModality: data.transportModality,
        operationRadius: data.operationRadius, responsibleName: data.responsibleName, notes: data.notes,
      } });
      const currentOwner = await tx.vehicleOwner.findFirst({ where: { vehicleId, isCurrent: true } });
      if (data.ownerId !== currentOwner?.ownerId) {
        await tx.vehicleOwner.updateMany({ where: { vehicleId, isCurrent: true }, data: { isCurrent: false, endsAt: new Date() } });
        if (data.ownerId) await tx.vehicleOwner.create({ data: { vehicleId, ownerId: data.ownerId, startsAt: new Date() } });
      }
      const currentCompany = await tx.vehicleAffiliation.findFirst({ where: { vehicleId, isCurrent: true } });
      if (data.companyId !== currentCompany?.companyId) {
        await tx.vehicleAffiliation.updateMany({ where: { vehicleId, isCurrent: true }, data: { isCurrent: false, endsAt: new Date() } });
        if (data.companyId) await tx.vehicleAffiliation.create({ data: { vehicleId, companyId: data.companyId, startsAt: new Date() } });
      }
    });
  } catch (error) { return { error: friendlyPrismaError(error) }; }
  await audit({ organizationId: user.organizationId, userId: user.id, action: "VEHICLE_UPDATED", entityType: "Vehicle", entityId: vehicleId, metadata: { plate: data.plate } });
  revalidatePath(`/vehiculos/${vehicleId}`); revalidatePath("/vehiculos");
  redirect(`/vehiculos/${vehicleId}?actualizado=1`);
}

export async function deactivateVehicleAction(vehicleId: string) {
  const user = await requireRole(["ADMIN", "SUPERVISOR"]);
  const result = await db.vehicle.updateMany({ where: { id: vehicleId, organizationId: user.organizationId }, data: { status: "INACTIVE" } });
  if (result.count) await audit({ organizationId: user.organizationId, userId: user.id, action: "VEHICLE_DEACTIVATED", entityType: "Vehicle", entityId: vehicleId });
  revalidatePath("/vehiculos"); revalidatePath(`/vehiculos/${vehicleId}`); revalidatePath("/dashboard");
}
