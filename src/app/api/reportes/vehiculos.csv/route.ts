import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET() {
  const user = await getSessionUser(); if (!user) return new Response("No autorizado", { status: 401 });
  const rows = await db.vehicle.findMany({ where: { organizationId: user.organizationId }, include: { category: true, owners: { where: { isCurrent: true }, take: 1, include: { owner: true } }, affiliations: { where: { isCurrent: true }, take: 1, include: { company: true } } }, orderBy: { plate: "asc" } });
  const header = ["Placa", "Número interno", "Categoría", "Marca", "Línea", "Modelo", "Propietario", "Empresa", "Estado"];
  const body = rows.map((x) => [x.plate, x.internalNumber, x.category.name, x.brand, x.line, x.model, x.owners[0]?.owner.displayName, x.affiliations[0]?.company.businessName, x.status].map(csv).join(","));
  return new Response(`\uFEFF${header.map(csv).join(",")}\r\n${body.join("\r\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=vehiculos-autolegal.csv", "Cache-Control": "no-store" } });
}
