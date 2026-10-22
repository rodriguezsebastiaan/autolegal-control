import Link from "next/link";
import { BellRing, MailWarning } from "lucide-react";
import { reviewAlertAction } from "@/app/actions/catalogs";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { documentValidity, validityLabels } from "@/lib/dates";
import { formatDate, formatPlate } from "@/lib/utils";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export default async function AlertsPage() {
  const user = await requireUser();
  const [alerts, rules] = await Promise.all([
    db.alertEvent.findMany({ where: { organizationId: user.organizationId }, orderBy: [{ status: "asc" }, { triggerDate: "desc" }], include: { document: { include: { vehicle: true, documentType: true } }, responsible: true, deliveries: true, alertRule: true } }),
    db.alertRule.findMany({ where: { organizationId: user.organizationId, active: true }, include: { documentType: true }, orderBy: [{ documentType: { name: "asc" } }, { advanceDays: "desc" }] }),
  ]);
  return <><PageHeader eyebrow="Automatización" title="Centro de alertas" description="Eventos internos reales generados por las reglas de anticipación. Los canales externos permanecen desactivados." />
    <div className="mb-5 grid gap-4 md:grid-cols-3"><div className="card flex items-center gap-4 p-4"><BellRing className="text-amber-600"/><div><p className="text-2xl font-bold">{alerts.filter((x) => x.status === "OPEN").length}</p><p className="text-xs text-slate-500">Alertas abiertas</p></div></div><div className="card flex items-center gap-4 p-4"><MailWarning className="text-slate-500"/><div><p className="text-sm font-bold">Integración pendiente</p><p className="text-xs text-slate-500">Correo externo desactivado</p></div></div><div className="card p-4"><p className="text-2xl font-bold">{rules.length}</p><p className="text-xs text-slate-500">Reglas activas</p></div></div>
    <section className="card overflow-hidden">{alerts.length ? <div className="table-shell"><table className="data-table"><thead><tr><th>Vehículo</th><th>Documento</th><th>Vencimiento</th><th>Vigencia</th><th>Anticipación</th><th>Responsable</th><th>Gestión</th></tr></thead><tbody>{alerts.map((alert) => { const validity = documentValidity(alert.document); return <tr key={alert.id}><td><Link className="font-extrabold text-teal-700" href={`/vehiculos/${alert.document.vehicleId}`}>{alert.document.vehicle ? formatPlate(alert.document.vehicle.plate) : "—"}</Link></td><td>{alert.document.documentType.name}</td><td>{formatDate(alert.document.expiresAt)}</td><td><StatusBadge status={validity.status} label={validityLabels[validity.status]}/></td><td>{alert.alertRule.advanceDays} días</td><td>{alert.responsible?.name || "Por asignar"}</td><td>{alert.status === "OPEN" ? <form action={reviewAlertAction.bind(null, alert.id)}><button className="btn-secondary py-1.5 text-xs">Marcar revisada</button></form> : <StatusBadge status={alert.status} label={alert.status === "REVIEWED" ? "Revisada" : alert.status}/>}</td></tr>; })}</tbody></table></div> : <EmptyState title="Todavía no hay eventos" description="Ejecuta npm run alerts:run después de cargar documentos verificados con fechas coincidentes." />}</section>
    <section className="card mt-5 p-5"><h2 className="font-bold">Reglas configuradas</h2><p className="mb-4 mt-1 text-xs text-slate-500">La configuración inicial se crea por tipo documental y puede ampliarse sin alterar el historial de eventos.</p><div className="flex flex-wrap gap-2">{rules.map((rule) => <span key={rule.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold">{rule.documentType.name}: {rule.advanceDays} días · {rule.channel === "INTERNAL" ? "Interna" : "Correo"}</span>)}</div></section>
  </>;
}
