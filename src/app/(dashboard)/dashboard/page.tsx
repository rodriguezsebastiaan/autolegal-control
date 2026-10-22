import { AlertTriangle, CarFront, CircleCheckBig, Clock3, FileWarning, RefreshCcw } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { documentValidity, validityLabels } from "@/lib/dates";
import { formatDate, formatPlate } from "@/lib/utils";
import { CategoryChart, DocumentChart } from "@/components/dashboard-charts";
import { EmptyState, MetricCard, PageHeader, StatusBadge } from "@/components/ui";

export default async function DashboardPage() {
  const user = await requireUser();
  const organizationId = user.organizationId;
  const [vehicles, documents, renewals, alerts, categories] = await Promise.all([
    db.vehicle.findMany({ where: { organizationId }, select: { id: true, status: true } }),
    db.document.findMany({ where: { organizationId }, select: { expiresAt: true, verificationStatus: true } }),
    db.renewalTask.groupBy({ by: ["status"], where: { organizationId }, _count: true }),
    db.alertEvent.findMany({ where: { organizationId, status: "OPEN", document: { organizationId }, alertRule: { organizationId } }, orderBy: { triggerDate: "desc" }, take: 8, include: { document: { include: { documentType: true, vehicle: { include: { owners: { where: { isCurrent: true, owner: { organizationId } }, take: 1, include: { owner: true } } } } } }, responsible: true } }),
    db.vehicleCategory.findMany({ where: { organizationId }, include: { _count: { select: { vehicles: { where: { organizationId } } } } }, orderBy: { name: "asc" } }),
  ]);
  const states = documents.map((doc) => documentValidity(doc));
  const count = (status: string) => states.filter((item) => item.status === status).length;
  const renewalCount = (status: string) => renewals.find((item) => item.status === status)?._count || 0;
  const documentData = ["VIGENTE", "PROXIMO_A_VENCER", "URGENTE", "VENCIDO", "PENDIENTE_VERIFICACION"].map((status) => ({ name: validityLabels[status as keyof typeof validityLabels], value: count(status) })).filter((item) => item.value > 0);

  return <>
    <PageHeader eyebrow="Centro de control" title="Resumen ejecutivo" description="Indicadores calculados con la información vigente de la organización." />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Vehículos registrados" value={vehicles.length} icon={CarFront} hint={`${vehicles.filter((v) => v.status === "ACTIVE").length} activos`} />
      <MetricCard label="Documentos vigentes" value={count("VIGENTE")} icon={CircleCheckBig} tone="blue" />
      <MetricCard label="Próximos / urgentes" value={count("PROXIMO_A_VENCER") + count("URGENTE")} icon={Clock3} tone="amber" hint="Ventana de 30 días" />
      <MetricCard label="Documentos vencidos" value={count("VENCIDO")} icon={FileWarning} tone="red" />
    </section>
    <section className="mt-6 grid gap-5 xl:grid-cols-2">
      <article className="card p-5"><div className="mb-2"><h2 className="font-bold text-slate-900">Flota por categoría</h2><p className="text-xs text-slate-500">Distribución actual de los vehículos</p></div><CategoryChart data={categories.map((c) => ({ name: c.name, value: c._count.vehicles }))} /></article>
      <article className="card p-5"><div className="mb-2 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Estado documental</h2><p className="text-xs text-slate-500">Vigencia y validación administrativa</p></div><div className="text-right"><p className="text-2xl font-bold">{documents.length}</p><p className="text-xs text-slate-500">documentos</p></div></div>{documentData.length ? <DocumentChart data={documentData} /> : <EmptyState title="Sin documentos" description="Los indicadores aparecerán al registrar el primer documento." />}</article>
    </section>
    <section className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_0.5fr]">
      <article className="card overflow-hidden"><div className="flex items-center justify-between px-5 py-4"><div><h2 className="font-bold">Alertas prioritarias</h2><p className="text-xs text-slate-500">Eventos internos abiertos</p></div><AlertTriangle className="text-amber-600" size={20} /></div>{alerts.length ? <div className="table-shell"><table className="data-table"><thead><tr><th>Placa</th><th>Documento</th><th>Propietario</th><th>Vence</th><th>Responsable</th></tr></thead><tbody>{alerts.map((alert) => <tr key={alert.id}><td className="font-extrabold text-slate-900">{alert.document.vehicle ? formatPlate(alert.document.vehicle.plate) : "—"}</td><td>{alert.document.documentType.name}</td><td>{alert.document.vehicle?.owners[0]?.owner.displayName || "Sin asignar"}</td><td>{formatDate(alert.document.expiresAt)}</td><td>{alert.responsible?.name || "Por asignar"}</td></tr>)}</tbody></table></div> : <EmptyState title="Sin alertas abiertas" description="El motor registrará aquí los eventos que coincidan con las anticipaciones configuradas." />}</article>
      <article className="card p-5"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2 text-blue-700"><RefreshCcw size={19} /></span><div><h2 className="font-bold">Renovaciones</h2><p className="text-xs text-slate-500">Flujo administrativo</p></div></div><div className="space-y-3"><div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>En trámite</span><strong>{renewalCount("IN_PROGRESS")}</strong></div><div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>Pendientes</span><strong>{renewalCount("PENDING")}</strong></div><div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>Completadas</span><strong>{renewalCount("COMPLETED")}</strong></div><div className="pt-2"><StatusBadge status={user.organization.mode} label={user.organization.mode === "DEMO" ? "Entorno de demostración" : "Entorno operativo"} /></div></div></article>
    </section>
  </>;
}
