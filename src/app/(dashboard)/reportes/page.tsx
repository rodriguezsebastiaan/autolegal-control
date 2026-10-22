import { Download, FileBarChart } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bogotaToday, parseCivilDate } from "@/lib/dates";
import { PageHeader } from "@/components/ui";

export default async function ReportsPage() {
  const user = await requireUser();
  const today = parseCivilDate(bogotaToday())!;
  const [vehicles, documents, expired] = await Promise.all([
    db.vehicle.count({ where: { organizationId: user.organizationId } }),
    db.document.count({ where: { organizationId: user.organizationId } }),
    db.document.count({ where: { organizationId: user.organizationId, verificationStatus: "VERIFIED", expiresAt: { lt: today } } }),
  ]);
  return <><PageHeader eyebrow="Análisis" title="Reportes y exportaciones" description="Exportaciones generadas con los datos de la organización autenticada." />
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><Report title="Inventario de vehículos" description={`${vehicles} registros con categoría, propietario, empresa y estado.`} href="/api/reportes/vehiculos.csv"/><Report title="Estado documental" description={`${documents} documentos registrados; ${expired} con fecha anterior a hoy.`} href="/api/reportes/documentos.csv"/><article className="card border-dashed p-5"><FileBarChart className="mb-4 text-slate-400"/><h2 className="font-bold">Excel y PDF</h2><p className="mt-2 text-sm leading-6 text-slate-500">Preparado para la siguiente fase. CSV está operativo y evita introducir dependencias de generación innecesarias.</p></article></section>
  </>;
}
function Report({ title, description, href }: { title: string; description: string; href: string }) { return <article className="card p-5"><FileBarChart className="mb-4 text-teal-700"/><h2 className="font-bold">{title}</h2><p className="my-3 text-sm leading-6 text-slate-500">{description}</p><a className="btn-secondary" href={href}><Download size={16}/>Descargar CSV</a></article>; }
