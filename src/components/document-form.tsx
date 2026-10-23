"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { createDocumentAction, updateDocumentAction } from "@/app/actions/documents";
import type { FormState } from "@/app/actions/vehicles";

type Option = { id: string; name: string; detail?: string; hasExpiration?: boolean };
type Defaults = { number?: string | null; issuer?: string | null; issuedAt?: string; validFrom?: string; expiresAt?: string; responsibleUserId?: string | null; notes?: string | null };
function Submit({ editing }: { editing: boolean }) { const { pending } = useFormStatus(); return <button className="btn-primary" disabled={pending}><Save size={17}/>{pending ? "Guardando…" : editing ? "Enviar actualización a revisión" : "Registrar para revisión"}</button>; }
export function DocumentForm({ vehicles, types, users, vehicleId, documentId, defaults = {} }: { vehicles: Option[]; types: Option[]; users: Option[]; vehicleId?: string; documentId?: string; defaults?: Defaults }) {
  const serverAction = documentId ? updateDocumentAction.bind(null, documentId) : createDocumentAction;
  const [state, action] = useActionState(serverAction, {} as FormState);
  const err = (name: string) => state.fieldErrors?.[name]?.[0] ? <p className="mt-1 text-xs font-semibold text-red-600">{state.fieldErrors[name][0]}</p> : null;
  return <form action={action} className="space-y-6"><section className="card p-5 md:p-6">
    {state.error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.error}</div>}
    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Los cambios quedarán pendientes. Solo un administrador o supervisor distinto del autor podrá aprobarlos.</div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {!documentId && <><div><label className="label">Vehículo *</label><select className="field" name="vehicleId" defaultValue={vehicleId || ""} required><option value="">Seleccionar…</option>{vehicles.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.detail}</option>)}</select>{err("vehicleId")}</div>
      <div><label className="label">Tipo de documento *</label><select className="field" name="documentTypeId" required><option value="">Seleccionar…</option>{types.map((x) => <option key={x.id} value={x.id}>{x.name}{x.hasExpiration ? " · con vencimiento" : ""}</option>)}</select>{err("documentTypeId")}</div></>}
      <div><label className="label">Número</label><input className="field" name="number" defaultValue={defaults.number || ""} /></div>
      <div><label className="label">Entidad emisora</label><input className="field" name="issuer" defaultValue={defaults.issuer || ""} /></div>
      <div><label className="label">Fecha de expedición</label><input className="field" type="date" name="issuedAt" defaultValue={defaults.issuedAt || ""} /></div>
      <div><label className="label">Inicio de vigencia</label><input className="field" type="date" name="validFrom" defaultValue={defaults.validFrom || ""} /></div>
      <div><label className="label">Fecha de vencimiento</label><input className="field" type="date" name="expiresAt" defaultValue={defaults.expiresAt || ""} />{err("expiresAt")}</div>
      <div><label className="label">Responsable</label><select className="field" name="responsibleUserId" defaultValue={defaults.responsibleUserId || ""}><option value="">Sin asignar</option>{users.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
      <div className="md:col-span-2 xl:col-span-3"><label className="label">Observaciones</label><textarea className="field min-h-24" name="notes" defaultValue={defaults.notes || ""} /></div>
    </div>
    <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"><strong>Archivo privado:</strong> integración pendiente. En esta versión se registran y verifican metadatos; no se simula una carga hasta configurar el proveedor de almacenamiento.</div>
  </section><div className="flex justify-end"><Submit editing={Boolean(documentId)} /></div></form>;
}
