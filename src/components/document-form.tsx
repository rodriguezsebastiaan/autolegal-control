"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { createDocumentAction } from "@/app/actions/documents";
import type { FormState } from "@/app/actions/vehicles";

type Option = { id: string; name: string; detail?: string; hasExpiration?: boolean };
function Submit() { const { pending } = useFormStatus(); return <button className="btn-primary" disabled={pending}><Save size={17}/>{pending ? "Registrando…" : "Registrar documento"}</button>; }
export function DocumentForm({ vehicles, types, users, vehicleId }: { vehicles: Option[]; types: Option[]; users: Option[]; vehicleId?: string }) {
  const [state, action] = useActionState(createDocumentAction, {} as FormState);
  const err = (name: string) => state.fieldErrors?.[name]?.[0] ? <p className="mt-1 text-xs font-semibold text-red-600">{state.fieldErrors[name][0]}</p> : null;
  return <form action={action} className="space-y-6"><section className="card p-5 md:p-6">
    {state.error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.error}</div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div><label className="label">Vehículo *</label><select className="field" name="vehicleId" defaultValue={vehicleId || ""} required><option value="">Seleccionar…</option>{vehicles.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.detail}</option>)}</select>{err("vehicleId")}</div>
      <div><label className="label">Tipo de documento *</label><select className="field" name="documentTypeId" required><option value="">Seleccionar…</option>{types.map((x) => <option key={x.id} value={x.id}>{x.name}{x.hasExpiration ? " · con vencimiento" : ""}</option>)}</select>{err("documentTypeId")}</div>
      <div><label className="label">Número</label><input className="field" name="number" /></div>
      <div><label className="label">Entidad emisora</label><input className="field" name="issuer" /></div>
      <div><label className="label">Fecha de expedición</label><input className="field" type="date" name="issuedAt" /></div>
      <div><label className="label">Inicio de vigencia</label><input className="field" type="date" name="validFrom" /></div>
      <div><label className="label">Fecha de vencimiento</label><input className="field" type="date" name="expiresAt" />{err("expiresAt")}</div>
      <div><label className="label">Responsable</label><select className="field" name="responsibleUserId"><option value="">Sin asignar</option>{users.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
      <div><label className="label">Verificación</label><select className="field" name="verificationStatus" defaultValue="PENDING"><option value="PENDING">Pendiente de verificación</option><option value="VERIFIED">Verificado</option></select></div>
      <div className="md:col-span-2 xl:col-span-3"><label className="label">Observaciones</label><textarea className="field min-h-24" name="notes" /></div>
    </div>
    <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"><strong>Archivo privado:</strong> integración pendiente. En esta versión se registran y verifican metadatos; no se simula una carga hasta configurar el proveedor de almacenamiento.</div>
  </section><div className="flex justify-end"><Submit /></div></form>;
}
