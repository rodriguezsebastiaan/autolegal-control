import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, BarChart3, BellRing, Building2, CalendarClock, CarFront, CheckCircle2,
  Clock3, Download, FileCheck2, FileWarning, RefreshCcw, Settings,
  ShieldCheck, Wrench,
} from "lucide-react";
import { CategoryChart, DocumentChart } from "./dashboard-charts";
import { MetricCard, PageHeader, StatusBadge } from "./ui";
import {
  demoAlerts, demoCategories, demoCompanies, demoDocuments, demoDocumentStates, demoDrivers,
  demoOrganization, demoOwners, demoRenewals, demoVehicles, type DemoVehicle,
} from "@/lib/demo-data";
import { documentValidity, validityLabels } from "@/lib/dates";
import { formatDate, formatPlate } from "@/lib/utils";

const readOnly = <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Vista DEMO · Sin cambios</span>;
const renewalLabels: Record<string, string> = { PENDING: "Pendiente", IN_PROGRESS: "En trámite", AWAITING_PAYMENT: "Pendiente de pago", COMPLETED: "Completada" };
const verificationLabels: Record<string, string> = { PENDING: "Pendiente", VERIFIED: "Verificado", REJECTED: "Rechazado" };

function DemoIntro({ title, description, eyebrow }: { title: string; description: string; eyebrow: string }) {
  return <><div className="mb-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-3 text-sm text-amber-900"><strong>Datos DEMO:</strong> esta pantalla no consulta ni modifica información real.</div><PageHeader eyebrow={eyebrow} title={title} description={description} action={readOnly}/></>;
}

function DemoDashboard() {
  const count = (status: string) => demoDocumentStates.filter((item) => item.validity.status === status).length;
  const categoryData = demoCategories.map((category) => ({ name: category.name, value: category.vehicles }));
  const documentData = ["VIGENTE", "PROXIMO_A_VENCER", "URGENTE", "VENCIDO", "PENDIENTE_VERIFICACION"].map((status) => ({
    name: validityLabels[status as keyof typeof validityLabels], value: count(status),
  })).filter((item) => item.value > 0);
  return <>
    <DemoIntro eyebrow="Centro de control" title="Resumen ejecutivo" description={`${demoOrganization.lastUpdate}. Fecha de referencia: ${formatDate(demoOrganization.today)}.`}/>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Vehículos registrados" value={demoVehicles.length} icon={CarFront} hint={`${demoVehicles.filter((vehicle) => vehicle.status === "ACTIVE").length} activos`} />
      <MetricCard label="Documentos vigentes" value={count("VIGENTE")} icon={CheckCircle2} tone="blue"/>
      <MetricCard label="Próximos / urgentes" value={count("PROXIMO_A_VENCER") + count("URGENTE")} icon={Clock3} tone="amber" hint="Ventana visual de 30 días"/>
      <MetricCard label="Documentos vencidos" value={count("VENCIDO")} icon={FileWarning} tone="red"/>
    </section>
    <section className="mt-6 grid gap-5 xl:grid-cols-2">
      <article className="card p-5"><div className="mb-2"><h2 className="font-bold text-slate-900">Flota por categoría</h2><p className="text-xs text-slate-500">Las seis categorías internas configuradas</p></div><CategoryChart data={categoryData}/></article>
      <article className="card p-5"><div className="mb-2 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Estado documental</h2><p className="text-xs text-slate-500">Vigencia y verificación son estados independientes</p></div><strong className="text-2xl">{demoDocuments.length}</strong></div><DocumentChart data={documentData}/></article>
    </section>
    <section className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_0.55fr]">
      <article className="card overflow-hidden"><div className="flex items-center justify-between px-5 py-4"><div><h2 className="font-bold">Alertas prioritarias</h2><p className="text-xs text-slate-500">Vencimientos ficticios que requieren atención</p></div><AlertTriangle className="text-amber-600" size={20}/></div><div className="table-shell"><table className="data-table"><thead><tr><th>Placa</th><th>Documento</th><th>Vence</th><th>Nivel</th><th>Responsable</th></tr></thead><tbody>{demoAlerts.map((alert) => <tr key={alert.id}><td><Link className="font-extrabold text-teal-700" href={`/demo/vehiculos/${alert.plate}`}>{alert.plate}</Link></td><td>{alert.type}</td><td>{formatDate(alert.expiresAt)}</td><td><StatusBadge status={alert.status} label={alert.level}/></td><td>{alert.responsible}</td></tr>)}</tbody></table></div></article>
      <article className="card p-5"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2 text-blue-700"><RefreshCcw size={19}/></span><div><h2 className="font-bold">Renovaciones</h2><p className="text-xs text-slate-500">Seguimiento administrativo</p></div></div><div className="space-y-3">{["IN_PROGRESS", "PENDING", "AWAITING_PAYMENT", "COMPLETED"].map((status) => <div key={status} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>{renewalLabels[status]}</span><strong>{demoRenewals.filter((renewal) => renewal.status === status).length}</strong></div>)}<Link href="/demo/renovaciones" className="btn-secondary mt-2 w-full text-sm">Ver renovaciones</Link></div></article>
    </section>
  </>;
}

function DemoVehicles() {
  return <><DemoIntro eyebrow="Gestión de flota" title="Vehículos" description="Consulta visual de placas, categorías, responsables y estado operativo."/><section className="card overflow-hidden"><div className="table-shell"><table className="data-table"><thead><tr><th>Placa</th><th>Número interno</th><th>Categoría</th><th>Vehículo</th><th>Propietario</th><th>Estado</th><th>Ficha</th></tr></thead><tbody>{demoVehicles.map((vehicle) => <tr key={vehicle.plate}><td className="font-black text-slate-900">{formatPlate(vehicle.plate)}</td><td>{vehicle.internalNumber}</td><td>{vehicle.category}</td><td>{vehicle.brand} {vehicle.line} · {vehicle.year}</td><td>{vehicle.owner}</td><td><StatusBadge status={vehicle.status} label={vehicle.status === "ACTIVE" ? "Activo" : "Mantenimiento"}/></td><td><Link className="btn-secondary py-1.5 text-xs" href={`/demo/vehiculos/${vehicle.plate}`}>Ver ficha</Link></td></tr>)}</tbody></table></div></section></>;
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-semibold text-slate-800">{value || "—"}</dd></div>;
}

function DemoVehicleDetail({ vehicle }: { vehicle: DemoVehicle }) {
  const documents = demoDocumentStates.filter((document) => document.plate === vehicle.plate);
  return <>
    <Link href="/demo/vehiculos" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-teal-700"><ArrowLeft size={16}/>Volver a vehículos</Link>
    <DemoIntro eyebrow={`Ficha por placa · ${vehicle.internalNumber}`} title={formatPlate(vehicle.plate)} description={`${vehicle.brand} ${vehicle.line} · ${vehicle.category}`}/>
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="card p-5"><div className="mb-5 flex items-center justify-between"><h2 className="font-bold">Identificación</h2><StatusBadge status={vehicle.status} label={vehicle.status === "ACTIVE" ? "Activo" : "Mantenimiento"}/></div><dl className="grid grid-cols-2 gap-4 text-sm"><Info label="Marca" value={vehicle.brand}/><Info label="Línea" value={vehicle.line}/><Info label="Modelo" value={vehicle.year}/><Info label="Color" value={vehicle.color}/><Info label="Categoría" value={vehicle.category}/><Info label="Servicio" value={vehicle.service}/></dl></article>
      <article className="card p-5"><h2 className="mb-5 font-bold">Administración</h2><dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><Info label="Propietario actual" value={vehicle.owner}/><Info label="Empresa transportadora" value={vehicle.company}/><Info label="Conductor asignado" value={vehicle.driver}/><Info label="Origen" value="Registro ficticio DEMO"/></dl></article>
    </section>
    <section className="card mt-5 overflow-hidden"><div className="px-5 py-4"><h2 className="font-bold">Expediente documental</h2><p className="text-xs text-slate-500">Vigencias calculadas sin persistencia</p></div><div className="table-shell"><table className="data-table"><thead><tr><th>Documento</th><th>Número</th><th>Expedición</th><th>Vencimiento</th><th>Días</th><th>Vigencia</th><th>Verificación</th></tr></thead><tbody>{documents.map((document) => <tr key={document.id}><td className="font-bold">{document.type}</td><td>{document.number}</td><td>{formatDate(document.issuedAt)}</td><td>{formatDate(document.expiresAt)}</td><td>{document.validity.daysRemaining ?? "—"}</td><td><StatusBadge status={document.validity.status} label={validityLabels[document.validity.status]}/></td><td><StatusBadge status={document.verificationStatus} label={verificationLabels[document.verificationStatus]}/></td></tr>)}</tbody></table></div></section>
    <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5"><div className="flex gap-3"><Wrench className="mt-0.5 text-slate-500" size={20}/><div><h2 className="font-bold">Acciones operativas deshabilitadas</h2><p className="mt-1 text-sm text-slate-600">Editar, desactivar, cargar documentos y asignar personas requieren el entorno real con autenticación y base de datos.</p></div></div></section>
  </>;
}

function DemoCategories() {
  return <><DemoIntro eyebrow="Catálogo interno" title="Seis categorías vehiculares" description="Clasificaciones demostrativas; la aplicabilidad documental deberá configurarse y validarse con Autolegal."/><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{demoCategories.map((category) => <article key={category.code} className="card p-5"><div className="mb-5 flex items-start justify-between"><span className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><CarFront size={20}/></span><StatusBadge status="ACTIVE" label="Activa"/></div><h2 className="text-lg font-bold">{category.name}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{category.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm"><span className="font-mono text-xs text-slate-500">{category.code}</span><strong>{category.vehicles} vehículo</strong></div></article>)}</section></>;
}

function DemoDocuments() {
  return <><DemoIntro eyebrow="Expediente central" title="Documentos y vencimientos" description="Vista conjunta de vigencia civil, verificación administrativa y estado del trámite."/><section className="card overflow-hidden"><div className="table-shell"><table className="data-table"><thead><tr><th>Placa</th><th>Documento</th><th>Número</th><th>Vencimiento</th><th>Días</th><th>Vigencia</th><th>Verificación</th><th>Trámite</th></tr></thead><tbody>{demoDocumentStates.map((document) => <tr key={document.id}><td><Link href={`/demo/vehiculos/${document.plate}`} className="font-extrabold text-teal-700">{document.plate}</Link></td><td className="font-semibold">{document.type}</td><td>{document.number}</td><td>{formatDate(document.expiresAt)}</td><td>{document.validity.daysRemaining ?? "—"}</td><td><StatusBadge status={document.validity.status} label={validityLabels[document.validity.status]}/></td><td><StatusBadge status={document.verificationStatus} label={verificationLabels[document.verificationStatus]}/></td><td>{document.processStatus === "NONE" ? "Sin trámite" : document.processStatus === "IN_RENEWAL" ? "En renovación" : "Pendiente de pago"}</td></tr>)}</tbody></table></div></section><div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><strong>Flujo protegido:</strong> en el producto real una nueva versión permanece pendiente hasta que la revise un usuario autorizado diferente de su autor.</div></>;
}

function DemoAlerts() {
  return <><DemoIntro eyebrow="Seguimiento preventivo" title="Centro de alertas" description="Eventos ficticios priorizados por vencimiento. El envío externo está deshabilitado."/><section className="grid gap-4 sm:grid-cols-3"><MetricCard label="Alertas abiertas" value={demoAlerts.length} icon={AlertTriangle} tone="amber"/><MetricCard label="Críticas" value={demoAlerts.filter((alert) => alert.level === "Crítica").length} icon={FileWarning} tone="red"/><MetricCard label="Recuperadas" value="2 DEMO" icon={RefreshCcw} tone="blue" hint="Simulación de continuidad"/></section><section className="card mt-5 overflow-hidden"><div className="table-shell"><table className="data-table"><thead><tr><th>Nivel</th><th>Placa</th><th>Documento</th><th>Fecha lógica</th><th>Días restantes</th><th>Responsable</th><th>Canal</th></tr></thead><tbody>{demoAlerts.map((alert) => <tr key={alert.id}><td><StatusBadge status={alert.status} label={alert.level}/></td><td><Link href={`/demo/vehiculos/${alert.plate}`} className="font-extrabold text-teal-700">{alert.plate}</Link></td><td>{alert.type}</td><td>{formatDate(alert.expiresAt)}</td><td>{alert.daysRemaining}</td><td>{alert.responsible}</td><td>Interno · DEMO</td></tr>)}</tbody></table></div></section></>;
}

function DemoRenewals() {
  return <><DemoIntro eyebrow="Gestión de vigencias" title="Renovaciones" description="Propuesta visual del flujo administrativo; este módulo todavía no persiste acciones en el producto real."/><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{["PENDING", "IN_PROGRESS", "AWAITING_PAYMENT", "COMPLETED"].map((status) => <article key={status} className="card p-5"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{renewalLabels[status]}</p><p className="mt-3 text-3xl font-bold">{demoRenewals.filter((renewal) => renewal.status === status).length}</p></article>)}</section><section className="card mt-5 overflow-hidden"><div className="table-shell"><table className="data-table"><thead><tr><th>Placa</th><th>Documento</th><th>Estado</th><th>Etapa actual</th><th>Fecha objetivo</th><th>Responsable</th></tr></thead><tbody>{demoRenewals.map((renewal) => <tr key={renewal.id}><td><Link href={`/demo/vehiculos/${renewal.plate}`} className="font-extrabold text-teal-700">{renewal.plate}</Link></td><td>{renewal.document}</td><td><StatusBadge status={renewal.status} label={renewalLabels[renewal.status]}/></td><td>{renewal.step}</td><td>{formatDate(renewal.dueAt)}</td><td>{renewal.responsible}</td></tr>)}</tbody></table></div></section><div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Crear tareas, comentar y cerrar renovaciones se muestra como concepto visual; no hay botones de escritura en esta demostración.</div></>;
}

function DemoOwners() {
  return <><DemoIntro eyebrow="Personas y titulares" title="Propietarios" description="Directorio ficticio de propietarios actuales y cantidad de vehículos asociados."/><section className="card overflow-hidden"><div className="table-shell"><table className="data-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Identificación</th><th>Ciudad</th><th>Contacto</th><th>Vehículos</th></tr></thead><tbody>{demoOwners.map((owner) => <tr key={owner.id}><td className="font-bold">{owner.name}</td><td>{owner.type}</td><td>{owner.identification}</td><td>{owner.city}</td><td>{owner.phone}</td><td>{owner.vehicles}</td></tr>)}</tbody></table></div></section></>;
}

function DemoCompanies() {
  return <><DemoIntro eyebrow="Afiliaciones" title="Empresas transportadoras" description="Vista ficticia de empresas, modalidades y flota afiliada."/><section className="grid gap-4 lg:grid-cols-3">{demoCompanies.map((company) => <article key={company.id} className="card p-5"><span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Building2 size={20}/></span><h2 className="font-bold">{company.name}</h2><p className="mt-1 text-xs font-semibold text-slate-500">{company.nit}</p><dl className="mt-5 space-y-3 text-sm"><Info label="Modalidad" value={company.modality}/><Info label="Contacto" value={company.contact}/><Info label="Vehículos afiliados" value={company.vehicles}/></dl></article>)}</section></>;
}

function DemoDrivers() {
  return <><DemoIntro eyebrow="Talento operativo" title="Conductores" description="Asignaciones y licencias ficticias para revisar la experiencia de usuario."/><section className="card overflow-hidden"><div className="table-shell"><table className="data-table"><thead><tr><th>Conductor</th><th>Identificación</th><th>Licencia</th><th>Vencimiento</th><th>Vehículo</th><th>Estado</th></tr></thead><tbody>{demoDrivers.map((driver) => { const validity = documentValidity({ expiresAt: driver.expiresAt, verificationStatus: "VERIFIED" }); return <tr key={driver.id}><td className="font-bold">{driver.name}</td><td>{driver.identification}</td><td>{driver.license}</td><td>{formatDate(driver.expiresAt)}</td><td><Link href={`/demo/vehiculos/${driver.vehicle}`} className="font-extrabold text-teal-700">{driver.vehicle}</Link></td><td><StatusBadge status={validity.status} label={validityLabels[validity.status]}/></td></tr>; })}</tbody></table></div></section></>;
}

function DemoReports() {
  const reports = [
    { title: "Inventario de vehículos", description: "Placas, categorías, propietarios y estado.", icon: CarFront },
    { title: "Vencimientos documentales", description: "Vigencias, responsables y estado de verificación.", icon: FileCheck2 },
    { title: "Alertas y recuperación", description: "Eventos generados, recuperados y omitidos.", icon: AlertTriangle },
    { title: "Seguimiento de renovaciones", description: "Etapas, fechas objetivo y responsables.", icon: RefreshCcw },
  ];
  return <><DemoIntro eyebrow="Analítica operativa" title="Reportes" description="Catálogo visual. Las descargas están deshabilitadas para evitar que una acción simulada parezca real."/><section className="grid gap-4 md:grid-cols-2">{reports.map(({ title, description, icon: Icon }) => <article key={title} className="card flex items-center gap-4 p-5"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon size={22}/></span><div className="min-w-0 flex-1"><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div><button disabled title="Disponible cuando se conecte el entorno real" className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-400"><Download size={15}/>No disponible</button></article>)}</section><section className="card mt-5 p-5"><div className="flex items-start gap-3"><BarChart3 className="mt-0.5 text-blue-700"/><div><h2 className="font-bold">Próxima validación</h2><p className="mt-1 text-sm leading-6 text-slate-600">Los reportes reales deberán probar aislamiento por organización, protección contra fórmulas CSV y consistencia con los indicadores del dashboard.</p></div></div></section></>;
}

function DemoSettings() {
  const settings = [
    { label: "Zona horaria", value: "America/Bogota", icon: CalendarClock },
    { label: "Ventana de recuperación", value: "7 días", icon: RefreshCcw },
    { label: "Canales externos", value: "Deshabilitados", icon: BellRing },
    { label: "Separación de funciones", value: "Activa", icon: ShieldCheck },
  ];
  return <><DemoIntro eyebrow="Parámetros del sistema" title="Configuración" description="Vista de referencia. Ningún valor puede guardarse desde el modo DEMO."/><section className="grid gap-4 md:grid-cols-2">{settings.map(({ label, value, icon: Icon }) => <article key={label} className="card flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon size={20}/></span><div><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-bold">{value}</p></div></article>)}</section><section className="card mt-5 p-5"><div className="mb-5 flex items-center gap-3"><Settings className="text-teal-700"/><div><h2 className="font-bold">Políticas demostrativas</h2><p className="text-xs text-slate-500">Controles visuales deliberadamente bloqueados</p></div></div><div className="grid gap-4 sm:grid-cols-2"><label className="rounded-xl border border-slate-200 p-4 text-sm"><span className="mb-2 block font-bold">Notificaciones por correo</span><input type="checkbox" disabled className="mr-2"/> Requiere proveedor autorizado</label><label className="rounded-xl border border-slate-200 p-4 text-sm"><span className="mb-2 block font-bold">Almacenamiento privado</span><input type="checkbox" disabled className="mr-2"/> Requiere diseño y conexión aprobados</label></div></section></>;
}

export function DemoPage({ path }: { path: string[] }) {
  if (path.length === 0) return <DemoDashboard/>;
  if (path[0] === "vehiculos" && path.length === 1) return <DemoVehicles/>;
  if (path[0] === "vehiculos" && path.length === 2) {
    const vehicle = demoVehicles.find((item) => item.plate === path[1].toUpperCase());
    return vehicle ? <DemoVehicleDetail vehicle={vehicle}/> : null;
  }
  const pages: Record<string, React.ReactNode> = {
    categorias: <DemoCategories/>, documentos: <DemoDocuments/>, alertas: <DemoAlerts/>, renovaciones: <DemoRenewals/>,
    propietarios: <DemoOwners/>, empresas: <DemoCompanies/>, conductores: <DemoDrivers/>, reportes: <DemoReports/>, configuracion: <DemoSettings/>,
  };
  return path.length === 1 ? pages[path[0]] ?? null : null;
}
