import { notFound } from "next/navigation";
import { DemoPage } from "@/components/demo-pages";
import { requireLocalDemo } from "@/lib/demo-access";
import { demoVehicles } from "@/lib/demo-data";

export default async function LocalDemoPage({ params }: { params: Promise<{ path?: string[] }> }) {
  requireLocalDemo();
  const { path = [] } = await params;
  if (path.length === 0) return <DemoPage path={path}/>;
  const allowed = new Set(["vehiculos", "categorias", "documentos", "alertas", "renovaciones", "propietarios", "empresas", "conductores", "reportes", "configuracion"]);
  if (!allowed.has(path[0]) || path.length > (path[0] === "vehiculos" ? 2 : 1)) notFound();
  if (path[0] === "vehiculos" && path.length === 2 && !demoVehicles.some((vehicle) => vehicle.plate === path[1].toUpperCase())) notFound();
  return <DemoPage path={path}/>;
}
