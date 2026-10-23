import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateKey } from "@/lib/dates";
import { DocumentForm } from "@/components/document-form";
import { PageHeader } from "@/components/ui";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ADMIN", "SUPERVISOR", "DOCUMENT_MANAGER"]);
  const { id } = await params;
  const [document, users, pending] = await Promise.all([
    db.document.findFirst({ where: {
      id,
      organizationId: user.organizationId,
      documentType: { organizationId: user.organizationId },
      vehicle: { organizationId: user.organizationId },
    }, include: { documentType: true } }),
    db.user.findMany({ where: { organizationId: user.organizationId, active: true }, orderBy: { name: "asc" } }),
    db.documentVersion.findFirst({ where: {
      documentId: id,
      verificationStatus: "PENDING",
      document: {
        organizationId: user.organizationId,
        documentType: { organizationId: user.organizationId },
        vehicle: { organizationId: user.organizationId },
      },
    }, select: { id: true } }),
  ]);
  if (!document) notFound();
  if (pending) return <><PageHeader eyebrow="Control documental" title="Actualización pendiente" description="Este documento ya tiene una versión esperando revisión."/><div className="card p-5"><Link className="btn-secondary" href={`/documentos/${id}`}>Volver al documento</Link></div></>;
  return <><PageHeader eyebrow="Control documental" title={`Actualizar ${document.documentType.name}`} description="La vigencia actual seguirá activa hasta que otra persona apruebe esta propuesta."/><DocumentForm documentId={id} vehicles={[]} types={[]} users={users.map((x) => ({ id: x.id, name: x.name }))} defaults={{
    number: document.number, issuer: document.issuer,
    issuedAt: document.issuedAt ? dateKey(document.issuedAt) : "",
    validFrom: document.validFrom ? dateKey(document.validFrom) : "",
    expiresAt: document.expiresAt ? dateKey(document.expiresAt) : "",
    responsibleUserId: document.responsibleUserId, notes: document.notes,
  }}/></>;
}
