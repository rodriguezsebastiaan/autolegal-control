import { notFound } from "next/navigation";
import { DemoPage } from "@/components/demo-pages";
import { requireLocalDemo } from "@/lib/demo-access";

export default async function LocalEvaluationPage({ params }: { params: Promise<{ path?: string[] }> }) {
  requireLocalDemo();
  const { path = [] } = await params;
  if (path.length === 0) return <DemoPage path={path}/>;
  const allowed = new Set(["vehiculos", "categorias", "documentos", "alertas", "renovaciones", "propietarios", "conductores", "reportes", "configuracion"]);
  const detailSections = new Set(["vehiculos", "categorias"]);
  if (!allowed.has(path[0]) || path.length > (detailSections.has(path[0]) ? 2 : 1)) notFound();
  if (path[0] === "vehiculos" && path.length === 2 && !/^[A-Z0-9-]{5,10}$/i.test(path[1])) notFound();
  if (path[0] === "categorias" && path.length === 2 && !["BU", "BG", "CA", "KI", "TX"].includes(path[1].toUpperCase())) notFound();
  return <DemoPage path={path}/>;
}
