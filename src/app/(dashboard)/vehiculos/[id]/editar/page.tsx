import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateKey } from "@/lib/dates";
import { PageHeader } from "@/components/ui";
import { VehicleForm } from "@/components/vehicle-form";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const { id } = await params;
  const [vehicle, categories, owners, companies] = await Promise.all([
    db.vehicle.findFirst({ where: { id, organizationId: user.organizationId }, include: { owners: { where: { isCurrent: true }, take: 1 }, affiliations: { where: { isCurrent: true }, take: 1 } } }),
    db.vehicleCategory.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { name: "asc" } }),
    db.owner.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { displayName: "asc" } }),
    db.transportCompany.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { businessName: "asc" } }),
  ]);
  if (!vehicle) notFound();
  const defaults = {
    plate: vehicle.plate,
    internalNumber: vehicle.internalNumber,
    categoryId: vehicle.categoryId,
    vehicleClass: vehicle.vehicleClass,
    brand: vehicle.brand,
    line: vehicle.line,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    vin: vehicle.vin,
    chassisNumber: vehicle.chassisNumber,
    engineNumber: vehicle.engineNumber,
    fuelType: vehicle.fuelType,
    passengerCapacity: vehicle.passengerCapacity,
    registrationDate: vehicle.registrationDate ? dateKey(vehicle.registrationDate) : "",
    transitAuthority: vehicle.transitAuthority,
    serviceType: vehicle.serviceType,
    transportModality: vehicle.transportModality,
    operationRadius: vehicle.operationRadius,
    responsibleName: vehicle.responsibleName,
    notes: vehicle.notes,
    ownerId: vehicle.owners[0]?.ownerId,
    companyId: vehicle.affiliations[0]?.companyId,
  };
  return <><PageHeader eyebrow="Flota" title={`Editar ${vehicle.plate}`} description="Los cambios de propietario y empresa conservan el historial anterior." /><VehicleForm vehicleId={vehicle.id} defaults={defaults} categories={categories.map((x) => ({ id: x.id, name: x.name }))} owners={owners.map((x) => ({ id: x.id, name: x.displayName }))} companies={companies.map((x) => ({ id: x.id, name: x.businessName }))} /></>;
}
