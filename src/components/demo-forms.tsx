"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, FilePlus2, RotateCcw, UserPlus, X } from "lucide-react";
import { demoCategories } from "@/lib/demo-data";
import type { DemoDocument, DemoDriver, DemoOwner, DemoVehicle } from "@/lib/demo-types";
import { bogotaToday } from "@/lib/dates";
import { useDemoStore } from "./demo-store";

function Modal({ title, description, children, onClose }: { title: string; description: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose]);
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
    <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div><h2 className="text-lg font-black text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>
        <button onClick={onClose} aria-label="Cerrar" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><X size={18}/></button>
      </div>
      <div className="max-h-[78vh] overflow-y-auto p-5 sm:p-6">{children}</div>
    </div>
  </div>;
}

function Field({ label, children, span = false }: { label: string; children: ReactNode; span?: boolean }) {
  return <label className={span ? "sm:col-span-2" : ""}><span className="label">{label}</span>{children}</label>;
}

const documentTypes = ["SOAT", "Revisión técnico-mecánica", "Tarjeta de operación", "Póliza RCC", "Licencia de tránsito"];
const today = bogotaToday();

export function VehicleForm({ onClose, initialCategory = "" }: { onClose: () => void; initialCategory?: string }) {
  const store = useDemoStore();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const plate = String(form.get("plate") || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
    const issuedAt = String(form.get("issuedAt"));
    const expiresAt = String(form.get("expiresAt"));
    if (!/^[A-Z]{3}[0-9]{3}$/.test(plate)) return setError("La placa debe tener el formato ABC123.");
    if (store.vehicles.some((vehicle) => vehicle.plate === plate)) return setError("Esta placa ya existe en la demostración.");
    if (expiresAt < issuedAt) return setError("La fecha de vencimiento no puede ser anterior a la fecha de inicio.");
    const vehicle: DemoVehicle = {
      plate,
      internalNumber: String(form.get("internalNumber")),
      categoryCode: String(form.get("categoryCode")),
      brand: String(form.get("brand")),
      line: String(form.get("line")),
      year: Number(form.get("year")),
      color: String(form.get("color")),
      service: String(form.get("service")),
      ownerId: String(form.get("ownerId")),
      driverId: String(form.get("driverId")) || null,
      status: "ACTIVE",
    };
    store.addVehicle(vehicle, {
      plate, type: String(form.get("documentType")), number: String(form.get("documentNumber")),
      issuer: String(form.get("issuer")), issuedAt, expiresAt, verificationStatus: "PENDING",
      responsible: "Analista Demo", processStatus: "NONE",
    });
    onClose();
  }
  return <Modal title="Registrar vehículo" description="Crea un vehículo y su primer documento. Todo se guarda únicamente en este navegador." onClose={onClose}>
    <form onSubmit={submit} className="space-y-6">
      <section><h3 className="form-section-title">1. Identificación del vehículo</h3><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Placa"><input className="field uppercase" name="plate" placeholder="ABC123" maxLength={6} required/></Field>
        <Field label="Número interno"><input className="field" name="internalNumber" placeholder="Ej. BU-028" required/></Field>
        <Field label="Categoría"><select className="field" name="categoryCode" defaultValue={initialCategory} required><option value="" disabled>Selecciona una categoría</option>{demoCategories.map((category) => <option key={category.code} value={category.code}>{category.name}</option>)}</select></Field>
        <Field label="Tipo de servicio"><input className="field" name="service" placeholder="Ej. Público urbano" required/></Field>
        <Field label="Marca"><input className="field" name="brand" placeholder="Ej. Chevrolet" required/></Field>
        <Field label="Línea"><input className="field" name="line" placeholder="Ej. NPR" required/></Field>
        <Field label="Modelo"><input className="field" name="year" type="number" min="1950" max="2100" defaultValue={new Date().getFullYear()} required/></Field>
        <Field label="Color"><input className="field" name="color" placeholder="Ej. Blanco" required/></Field>
        <Field label="Propietario"><select className="field" name="ownerId" required><option value="" disabled>Selecciona el propietario</option>{store.owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select></Field>
        <Field label="Conductor asignado (opcional)"><select className="field" name="driverId" defaultValue=""><option value="">Sin asignar</option>{store.drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}</select></Field>
      </div></section>
      <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 sm:p-5"><h3 className="form-section-title text-teal-900">2. Primer documento</h3><p className="mt-1 text-xs text-teal-800">Queda pendiente de revisión; no activa una vigencia real.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Tipo"><select className="field" name="documentType" required>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
        <Field label="Número"><input className="field" name="documentNumber" placeholder="Número o referencia" required/></Field>
        <Field label="Entidad emisora"><input className="field" name="issuer" placeholder="Aseguradora o entidad" required/></Field>
        <div/>
        <Field label="Fecha de inicio"><input className="field" name="issuedAt" type="date" defaultValue={today} required/></Field>
        <Field label="Fecha de vencimiento"><input className="field" name="expiresAt" type="date" required/></Field>
      </div></section>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary" type="submit"><CheckCircle2 size={17}/>Guardar registro DEMO</button></div>
    </form>
  </Modal>;
}

export function DocumentForm({ plate, onClose }: { plate: string; onClose: () => void }) {
  const store = useDemoStore();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const issuedAt = String(form.get("issuedAt"));
    const expiresAt = String(form.get("expiresAt"));
    if (expiresAt < issuedAt) return setError("La fecha de vencimiento no puede ser anterior al inicio.");
    store.addDocument({ plate, type: String(form.get("type")), number: String(form.get("number")), issuer: String(form.get("issuer")), issuedAt, expiresAt, verificationStatus: "PENDING", responsible: "Analista Demo", processStatus: "NONE" });
    onClose();
  }
  return <Modal title={`Agregar documento · ${plate}`} description="La nueva versión queda pendiente de revisión independiente." onClose={onClose}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Field label="Tipo"><select className="field" name="type" required>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
    <Field label="Número"><input className="field" name="number" required/></Field>
    <Field label="Entidad emisora"><input className="field" name="issuer" required/></Field><div/>
    <Field label="Fecha de inicio"><input className="field" name="issuedAt" type="date" defaultValue={today} required/></Field>
    <Field label="Fecha de vencimiento"><input className="field" name="expiresAt" type="date" required/></Field>
    {error && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
    <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary"><FilePlus2 size={17}/>Agregar documento DEMO</button></div>
  </form></Modal>;
}

export function OwnerForm({ owner, onClose }: { owner?: DemoOwner; onClose: () => void }) {
  const store = useDemoStore();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = { type: String(form.get("type")) as DemoOwner["type"], identification: String(form.get("identification")), name: String(form.get("name")), phone: String(form.get("phone")), city: String(form.get("city")) };
    if (owner) store.updateOwner({ ...data, id: owner.id }); else store.addOwner(data);
    onClose();
  }
  return <Modal title={owner ? "Editar propietario" : "Nuevo propietario"} description="Directorio DEMO para asociar titulares a los vehículos." onClose={onClose}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Field label="Tipo"><select className="field" name="type" defaultValue={owner?.type || "Persona natural"}><option>Persona natural</option><option>Persona jurídica</option></select></Field>
    <Field label="Identificación"><input className="field" name="identification" defaultValue={owner?.identification} required/></Field>
    <Field label="Nombre completo o razón social" span><input className="field" name="name" defaultValue={owner?.name} required/></Field>
    <Field label="Teléfono"><input className="field" name="phone" defaultValue={owner?.phone} required/></Field>
    <Field label="Ciudad"><input className="field" name="city" defaultValue={owner?.city} required/></Field>
    <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary"><UserPlus size={17}/>{owner ? "Actualizar" : "Crear"} propietario</button></div>
  </form></Modal>;
}

export function DriverForm({ driver, onClose }: { driver?: DemoDriver; onClose: () => void }) {
  const store = useDemoStore();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const issuedAt = String(form.get("issuedAt"));
    const expiresAt = String(form.get("expiresAt"));
    if (expiresAt < issuedAt) return setError("El vencimiento no puede ser anterior a la expedición.");
    const data = { name: String(form.get("name")), identification: String(form.get("identification")), license: String(form.get("license")), category: String(form.get("category")), issuedAt, expiresAt, vehicle: String(form.get("vehicle")) || null };
    if (driver) store.updateDriver({ ...data, id: driver.id }); else store.addDriver(data);
    onClose();
  }
  return <Modal title={driver ? "Editar conductor y licencia" : "Registrar conductor"} description="Consulta y actualización local de la licencia en el entorno DEMO." onClose={onClose}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Field label="Nombre completo" span><input className="field" name="name" defaultValue={driver?.name} required/></Field>
    <Field label="Cédula"><input className="field" name="identification" defaultValue={driver?.identification} required/></Field>
    <Field label="Número de licencia"><input className="field" name="license" defaultValue={driver?.license} required/></Field>
    <Field label="Categoría"><select className="field" name="category" defaultValue={driver?.category || "C1"}>{["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"].map((category) => <option key={category}>{category}</option>)}</select></Field>
    <Field label="Vehículo asignado"><select className="field" name="vehicle" defaultValue={driver?.vehicle || ""}><option value="">Sin asignar</option>{store.vehicles.map((vehicle) => <option key={vehicle.plate}>{vehicle.plate}</option>)}</select></Field>
    <Field label="Fecha de expedición"><input className="field" name="issuedAt" type="date" defaultValue={driver?.issuedAt || today} required/></Field>
    <Field label="Fecha de vencimiento"><input className="field" name="expiresAt" type="date" defaultValue={driver?.expiresAt} required/></Field>
    {error && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
    <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary"><CheckCircle2 size={17}/>{driver ? "Actualizar" : "Registrar"} conductor</button></div>
  </form></Modal>;
}

export function RenewalForm({ document, onClose }: { document: DemoDocument; onClose: () => void }) {
  const store = useDemoStore();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const issuedAt = String(form.get("issuedAt"));
    const expiresAt = String(form.get("expiresAt"));
    if (expiresAt < issuedAt) return setError("El vencimiento no puede ser anterior al inicio.");
    store.createRenewal({ ...document, number: String(form.get("number")), issuedAt, expiresAt, verificationStatus: "PENDING", processStatus: "NONE", responsible: "Analista Demo" }, { plate: document.plate, document: document.type, status: "COMPLETED", step: "Nueva versión pendiente de revisión", dueAt: expiresAt, responsible: "Analista Demo" });
    onClose();
  }
  return <Modal title={`Renovar ${document.type}`} description={`${document.plate} · La vigencia anterior sigue activa hasta la aprobación de otra persona.`} onClose={onClose}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Field label="Nuevo número" span><input className="field" name="number" placeholder="Número de la nueva versión" required/></Field>
    <Field label="Nueva fecha de inicio"><input className="field" name="issuedAt" type="date" defaultValue={today} required/></Field>
    <Field label="Nueva fecha de vencimiento"><input className="field" name="expiresAt" type="date" required/></Field>
    <div className="sm:col-span-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><strong>Separación de funciones:</strong> esta acción prepara la renovación DEMO, pero no la aprueba ni reemplaza automáticamente la vigencia anterior.</div>
    {error && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
    <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary"><RotateCcw size={17}/>Preparar renovación DEMO</button></div>
  </form></Modal>;
}
