import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { documentValidity, validityLabels } from "@/lib/dates";
import { formatDate, formatPlate } from "@/lib/utils";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser(); const params = await searchParams;
  const documents = await db.document.findMany({ where: { organizationId: user.organizationId, documentType: { organizationId: user.organizationId }, vehicle: { organizationId: user.organizationId }, ...(params.type ? { documentTypeId: params.type } : {}) }, include: { documentType: true, vehicle: true, responsible: true }, orderBy: [{ expiresAt: "asc" }, { createdAt: "desc" }] });
  const types = await db.documentType.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { name: "asc" } });
  return <><PageHeader eyebrow="Expediente central" title="Control documental" description="Vigencias calculadas en zona horaria de Colombia y separadas del estado del trámite." action={<Link href="/documentos/nuevo" className="btn-primary"><Plus size={17}/>Nuevo documento</Link>} />
    <form className="card mb-5 flex flex-wrap gap-3 p-4"><select name="type" className="field max-w-sm" defaultValue={params.type}><option value="">Todos los tipos documentales</option>{types.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><button className="btn-secondary">Filtrar</button></form>
    <section className="card overflow-hidden">{documents.length ? <div className="table-shell"><table className="data-table"><thead><tr><th>Vehículo</th><th>Documento</th><th>Número</th><th>Vencimiento</th><th>Días</th><th>Vigencia</th><th>Trámite</th><th>Responsable</th></tr></thead><tbody>{documents.map((doc) => { const validity = documentValidity(doc); return <tr key={doc.id}><td><Link className="font-extrabold text-teal-700" href={`/vehiculos/${doc.vehicleId}`}>{doc.vehicle ? formatPlate(doc.vehicle.plate) : "—"}</Link></td><td>{doc.documentType.name}</td><td>{doc.number || "—"}</td><td>{formatDate(doc.expiresAt)}</td><td>{validity.daysRemaining ?? "—"}</td><td><StatusBadge status={validity.status} label={validityLabels[validity.status]} /></td><td>{doc.processStatus === "NONE" ? "Sin trámite" : doc.processStatus.replaceAll("_", " ")}</td><td>{doc.responsible?.name || "—"}</td></tr>; })}</tbody></table></div> : <EmptyState title="Sin documentos registrados" description="Registra el primer documento para comenzar el control de vigencias." />}</section>
  </>;
}
