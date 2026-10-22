"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { createVehicleAction, updateVehicleAction, type FormState } from "@/app/actions/vehicles";

type Option = { id: string; name: string };
type Defaults = Record<string, string | number | null | undefined>;

function Submit() { const { pending } = useFormStatus(); return <button className="btn-primary" disabled={pending}><Save size={17} />{pending ? "Guardando…" : "Guardar vehículo"}</button>; }
const FieldError = ({ errors }: { errors?: string[] }) => errors?.[0] ? <p className="mt-1 text-xs font-semibold text-red-600">{errors[0]}</p> : null;

export function VehicleForm({ vehicleId, categories, owners, companies, defaults = {} }: { vehicleId?: string; categories: Option[]; owners: Option[]; companies: Option[]; defaults?: Defaults }) {
  const action = vehicleId ? updateVehicleAction.bind(null, vehicleId) : createVehicleAction;
  const [state, formAction] = useActionState(action, {} as FormState);
  const input = (name: string) => ({ name, defaultValue: defaults[name] ?? "" });
  return <form action={formAction} className="space-y-6">
    {state.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.error}</div>}
    <section className="card p-5 md:p-6"><h2 className="mb-5 text-lg font-bold">Identificación del vehículo</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div><label className="label">Placa *</label><input className="field uppercase" {...input("plate")} maxLength={7} required /><FieldError errors={state.fieldErrors?.plate} /></div>
      <div><label className="label">Número interno</label><input className="field" {...input("internalNumber")} /></div>
      <div><label className="label">Categoría *</label><select className="field" name="categoryId" defaultValue={String(defaults.categoryId || "")} required><option value="">Seleccionar…</option>{categories.map((x) => <option value={x.id} key={x.id}>{x.name}</option>)}</select><FieldError errors={state.fieldErrors?.categoryId} /></div>
      <div><label className="label">Clase de vehículo</label><input className="field" {...input("vehicleClass")} placeholder="Bus, automóvil…" /></div>
      <div><label className="label">Marca *</label><input className="field" {...input("brand")} required /><FieldError errors={state.fieldErrors?.brand} /></div>
      <div><label className="label">Línea *</label><input className="field" {...input("line")} required /><FieldError errors={state.fieldErrors?.line} /></div>
      <div><label className="label">Modelo</label><input className="field" {...input("model")} /></div>
      <div><label className="label">Año</label><input className="field" type="number" min="1900" max={new Date().getFullYear() + 1} {...input("year")} /></div>
      <div><label className="label">Color</label><input className="field" {...input("color")} /></div>
      <div><label className="label">VIN</label><input className="field uppercase" {...input("vin")} /></div>
      <div><label className="label">Número de chasis</label><input className="field" {...input("chassisNumber")} /></div>
      <div><label className="label">Número de motor</label><input className="field" {...input("engineNumber")} /></div>
      <div><label className="label">Combustible</label><select className="field" name="fuelType" defaultValue={String(defaults.fuelType || "")}><option value="">Seleccionar…</option><option>Gasolina</option><option>Diésel</option><option>Gas</option><option>Eléctrico</option><option>Híbrido</option></select></div>
      <div><label className="label">Capacidad de pasajeros</label><input className="field" type="number" min="1" {...input("passengerCapacity")} /></div>
      <div><label className="label">Fecha de matrícula</label><input className="field" type="date" {...input("registrationDate")} /></div>
      <div><label className="label">Organismo de tránsito</label><input className="field" {...input("transitAuthority")} /></div>
    </div></section>
    <section className="card p-5 md:p-6"><h2 className="mb-5 text-lg font-bold">Información administrativa</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div><label className="label">Propietario actual</label><select className="field" name="ownerId" defaultValue={String(defaults.ownerId || "")}><option value="">Sin asignar</option>{owners.map((x) => <option value={x.id} key={x.id}>{x.name}</option>)}</select></div>
      <div><label className="label">Empresa transportadora</label><select className="field" name="companyId" defaultValue={String(defaults.companyId || "")}><option value="">Sin asignar</option>{companies.map((x) => <option value={x.id} key={x.id}>{x.name}</option>)}</select></div>
      <div><label className="label">Tipo de servicio</label><input className="field" {...input("serviceType")} /></div>
      <div><label className="label">Modalidad de transporte</label><input className="field" {...input("transportModality")} /></div>
      <div><label className="label">Radio de acción</label><input className="field" {...input("operationRadius")} /></div>
      <div><label className="label">Responsable en Autolegal</label><input className="field" {...input("responsibleName")} /></div>
      <div className="md:col-span-2 xl:col-span-3"><label className="label">Observaciones</label><textarea className="field min-h-24" name="notes" defaultValue={String(defaults.notes || "")} /></div>
    </div></section>
    <div className="flex justify-end"><Submit /></div>
  </form>;
}
