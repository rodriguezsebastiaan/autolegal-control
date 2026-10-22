import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { VehicleForm } from "@/components/vehicle-form";

export default async function NewVehiclePage() {
  const user = await requireUser();
  const [categories, owners, companies] = await Promise.all([
    db.vehicleCategory.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { name: "asc" } }),
    db.owner.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { displayName: "asc" } }),
    db.transportCompany.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { businessName: "asc" } }),
  ]);
  return <><PageHeader eyebrow="Flota" title="Registrar vehículo" description="Crea la ficha principal y vincula su propietario y empresa actuales." /><VehicleForm categories={categories.map((x) => ({ id: x.id, name: x.name }))} owners={owners.map((x) => ({ id: x.id, name: x.displayName }))} companies={companies.map((x) => ({ id: x.id, name: x.businessName }))} /></>;
}
