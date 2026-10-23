import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentValidity, validityLabels } from "@/lib/dates";
import { documentReviewerRoles } from "@/lib/document-workflow";
import { formatDate, formatDateTime, formatPlate } from "@/lib/utils";
import { DocumentReviewActions } from "@/components/document-review-actions";
import { PageHeader, StatusBadge } from "@/components/ui";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const document = await db.document.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
      documentType: { organizationId: user.organizationId },
      vehicle: { organizationId: user.organizationId },
    },
    include: {
      documentType: true,
      vehicle: true,
      responsible: true,
      createdBy: true,
      verifiedBy: true,
      versions: { orderBy: { version: "desc" }, include: { createdBy: true, reviewedBy: true, responsible: true } },
    },
  });
  if (!document) notFound();
  const pending = document.versions.find((version) => version.verificationStatus === "PENDING");
  const validity = documentValidity(document);
  const reviewerRole = documentReviewerRoles.includes(user.role.code);
  const canReview = Boolean(pending && reviewerRole && pending.createdById && pending.createdById !== user.id);
  const blockedReason = pending?.createdById === user.id
    ? "La separación de funciones impide revisar una versión creada por ti."
    : !pending?.createdById
      ? "La versión no tiene un autor identificable y requiere regularización administrativa."
      : !reviewerRole ? "Solo administradores y supervisores pueden revisar documentos." : undefined;

  return <>
    <PageHeader
      eyebrow="Control documental"
      title={document.documentType.name}
      description={document.vehicle ? `${formatPlate(document.vehicle.plate)} · ${document.number || "Sin número"}` : document.number || "Sin número"}
      action={!pending ? <Link className="btn-secondary" href={`/documentos/${document.id}/editar`}><Pencil size={16}/>Proponer actualización</Link> : undefined}
    />
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="card p-5"><h2 className="mb-4 font-bold">Vigencia activa</h2><dl className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Estado" value={<StatusBadge status={validity.status} label={validityLabels[validity.status]}/>}/>
        <Info label="Verificación" value={document.verificationStatus}/>
        <Info label="Expedición" value={formatDate(document.issuedAt)}/>
        <Info label="Vencimiento" value={formatDate(document.expiresAt)}/>
        <Info label="Responsable" value={document.responsible?.name || "—"}/>
        <Info label="Verificó" value={document.verifiedBy?.name || "—"}/>
      </dl>{document.rejectionReason && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"><strong>Último rechazo:</strong> {document.rejectionReason}</p>}</article>
      <article className="card p-5"><h2 className="mb-4 font-bold">Trazabilidad</h2><dl className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Registró" value={document.createdBy?.name || "No identificado"}/>
        <Info label="Registro" value={formatDateTime(document.createdAt)}/>
        <Info label="Última revisión" value={formatDateTime(document.reviewedAt)}/>
        <Info label="Versiones" value={String(document.versions.length)}/>
      </dl></article>
    </section>
    {pending && <section className="card mt-5 p-5"><div className="mb-4"><h2 className="font-bold">Versión {pending.version} pendiente de revisión</h2><p className="text-sm text-slate-500">Creada por {pending.createdBy?.name || "usuario no identificado"} el {formatDateTime(pending.createdAt)}. La vigencia activa no cambiará hasta aprobarla.</p></div><DocumentReviewActions versionId={pending.id} canReview={canReview} blockedReason={blockedReason}/></section>}
    <section className="card mt-5 overflow-hidden"><div className="px-5 py-4"><h2 className="font-bold">Historial de versiones</h2></div><div className="table-shell"><table className="data-table"><thead><tr><th>Versión</th><th>Estado</th><th>Vencimiento</th><th>Autor</th><th>Revisor</th><th>Motivo</th></tr></thead><tbody>{document.versions.map((version) => <tr key={version.id}><td>{version.version}</td><td><StatusBadge status={version.verificationStatus} label={version.verificationStatus}/></td><td>{formatDate(version.expiresAt)}</td><td>{version.createdBy?.name || "—"}</td><td>{version.reviewedBy?.name || "—"}</td><td>{version.rejectionReason || "—"}</td></tr>)}</tbody></table></div></section>
  </>;
}

function Info({ label, value }: { label: string; value: React.ReactNode }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-semibold text-slate-800">{value}</dd></div>; }
