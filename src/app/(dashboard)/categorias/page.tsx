import { Power } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createCategoryAction, toggleCategoryAction } from "@/app/actions/catalogs";
import { PageHeader, StatusBadge } from "@/components/ui";

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await db.vehicleCategory.findMany({ where: { organizationId: user.organizationId }, include: { _count: { select: { vehicles: { where: { organizationId: user.organizationId } }, requirements: { where: { organizationId: user.organizationId } } } } }, orderBy: { name: "asc" } });
  return <><PageHeader eyebrow="Configuración" title="Categorías internas" description="Clasificaciones administrables de Autolegal, independientes de la modalidad jurídica de transporte." />
    <section className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]"><form action={createCategoryAction} className="card h-fit p-5"><h2 className="mb-4 font-bold">Agregar categoría</h2><div className="space-y-4"><div><label className="label">Nombre</label><input className="field" name="name" required minLength={2}/></div><div><label className="label">Descripción</label><textarea className="field min-h-24" name="description"/></div><button className="btn-primary w-full">Crear categoría</button></div></form>
    <div className="card overflow-hidden"><div className="table-shell"><table className="data-table"><thead><tr><th>Categoría</th><th>Vehículos</th><th>Reglas</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{categories.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><br/><span className="text-xs text-slate-500">{item.description || "Sin descripción"}</span></td><td>{item._count.vehicles}</td><td>{item._count.requirements}</td><td><StatusBadge status={item.active ? "ACTIVE" : "INACTIVE"} label={item.active ? "Activa" : "Inactiva"}/></td><td><form action={toggleCategoryAction.bind(null, item.id)}><button aria-label="Cambiar estado" className="rounded-lg border border-slate-200 p-2 text-slate-600"><Power size={15}/></button></form></td></tr>)}</tbody></table></div></div></section>
  </>;
}
