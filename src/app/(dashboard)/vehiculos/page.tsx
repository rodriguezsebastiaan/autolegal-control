import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatPlate } from "@/lib/utils";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser(); const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1)); const take = 20;
  const where = { organizationId: user.organizationId, ...(params.q ? { plate: { contains: params.q.replace(/\W/g, "").toUpperCase(), mode: "insensitive" as const } } : {}), ...(params.category ? { categoryId: params.category } : {}), ...(params.status ? { status: params.status as "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "SUSPENDED" } : {}) };
  const [vehicles, total, categories] = await Promise.all([
    db.vehicle.findMany({ where, include: { category: true, owners: { where: { isCurrent: true }, take: 1, include: { owner: true } }, affiliations: { where: { isCurrent: true }, take: 1, include: { company: true } }, _count: { select: { documents: true } } }, orderBy: { plate: "asc" }, skip: (page - 1) * take, take }),
    db.vehicle.count({ where }), db.vehicleCategory.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { name: "asc" } }),
  ]);
  return <><PageHeader eyebrow="Núcleo de información" title="Vehículos" description={`${total} registro${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}.`} action={<Link href="/vehiculos/nuevo" className="btn-primary"><Plus size={17} />Nuevo vehículo</Link>} />
    <form className="card mb-5 grid gap-3 p-4 md:grid-cols-[1fr_220px_180px_auto]"><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="field pl-10" name="q" defaultValue={params.q} placeholder="Buscar por placa" /></div><select className="field" name="category" defaultValue={params.category}><option value="">Todas las categorías</option>{categories.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><select className="field" name="status" defaultValue={params.status}><option value="">Todos los estados</option><option value="ACTIVE">Activo</option><option value="MAINTENANCE">Mantenimiento</option><option value="SUSPENDED">Suspendido</option><option value="INACTIVE">Inactivo</option></select><button className="btn-secondary">Aplicar filtros</button></form>
    <section className="card overflow-hidden">{vehicles.length ? <div className="table-shell"><table className="data-table"><thead><tr><th>Placa</th><th>Categoría</th><th>Vehículo</th><th>Propietario</th><th>Empresa</th><th>Docs.</th><th>Estado</th></tr></thead><tbody>{vehicles.map((vehicle) => <tr key={vehicle.id}><td><Link className="font-extrabold text-teal-700 hover:underline" href={`/vehiculos/${vehicle.id}`}>{formatPlate(vehicle.plate)}</Link></td><td>{vehicle.category.name}</td><td><strong>{vehicle.brand} {vehicle.line}</strong><br/><span className="text-xs text-slate-500">{vehicle.model || "Sin modelo"}</span></td><td>{vehicle.owners[0]?.owner.displayName || "—"}</td><td>{vehicle.affiliations[0]?.company.businessName || "—"}</td><td>{vehicle._count.documents}</td><td><StatusBadge status={vehicle.status} label={vehicle.status === "ACTIVE" ? "Activo" : vehicle.status === "INACTIVE" ? "Inactivo" : vehicle.status === "MAINTENANCE" ? "Mantenimiento" : "Suspendido"} /></td></tr>)}</tbody></table></div> : <EmptyState title="No hay vehículos para mostrar" description="Ajusta los filtros o registra el primer vehículo de la flota." />}</section>
    {total > take && <div className="mt-4 flex justify-end gap-2"><Link className="btn-secondary" aria-disabled={page <= 1} href={`?page=${Math.max(1, page - 1)}`}>Anterior</Link><span className="px-3 py-2 text-sm">Página {page} de {Math.ceil(total / take)}</span><Link className="btn-secondary" href={`?page=${Math.min(Math.ceil(total / take), page + 1)}`}>Siguiente</Link></div>}
  </>;
}
