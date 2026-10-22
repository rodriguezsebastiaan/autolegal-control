import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentValidity, validityLabels } from "@/lib/dates";
import { dateKey } from "@/lib/dates";

const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET() {
  const user = await getSessionUser(); if (!user) return new Response("No autorizado", { status: 401 });
  const rows = await db.document.findMany({ where: { organizationId: user.organizationId, documentType: { organizationId: user.organizationId }, vehicle: { organizationId: user.organizationId } }, include: { vehicle: true, documentType: true, responsible: true }, orderBy: { expiresAt: "asc" } });
  const header = ["Placa", "Documento", "Número", "Emisor", "Expedición", "Vencimiento", "Días restantes", "Vigencia", "Verificación", "Trámite", "Responsable"];
  const body = rows.map((x) => { const state = documentValidity(x); return [x.vehicle?.plate, x.documentType.name, x.number, x.issuer, x.issuedAt ? dateKey(x.issuedAt) : "", x.expiresAt ? dateKey(x.expiresAt) : "", state.daysRemaining, validityLabels[state.status], x.verificationStatus, x.processStatus, x.responsible?.name].map(csv).join(","); });
  return new Response(`\uFEFF${header.map(csv).join(",")}\r\n${body.join("\r\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=documentos-autolegal.csv", "Cache-Control": "no-store" } });
}
