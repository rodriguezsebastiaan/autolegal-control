import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatPlate } from "@/lib/utils";
import { DocumentForm } from "@/components/document-form";
import { PageHeader } from "@/components/ui";

export default async function NewDocumentPage({ searchParams }: { searchParams: Promise<{ vehicleId?: string }> }) {
  const user = await requireUser(); const params = await searchParams;
  const [vehicles, types, users] = await Promise.all([
    db.vehicle.findMany({ where: { organizationId: user.organizationId, status: { not: "INACTIVE" } }, orderBy: { plate: "asc" } }),
    db.documentType.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { name: "asc" } }),
  ]);
  return <><PageHeader eyebrow="Control documental" title="Registrar documento" description="Las alertas solo se activan para fechas verificadas." /><DocumentForm vehicleId={params.vehicleId} vehicles={vehicles.map((x) => ({ id: x.id, name: formatPlate(x.plate), detail: `${x.brand} ${x.line}` }))} types={types.map((x) => ({ id: x.id, name: x.name, hasExpiration: x.hasExpiration }))} users={users.map((x) => ({ id: x.id, name: x.name }))} /></>;
}
