"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { approveDocumentVersionAction, rejectDocumentVersionAction, type ReviewState } from "@/app/actions/documents";

function ActionButton({ kind }: { kind: "approve" | "reject" }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className={kind === "approve" ? "btn-primary" : "btn-secondary text-red-700"}>
    {kind === "approve" ? <CheckCircle2 size={17}/> : <XCircle size={17}/>}
    {pending ? "Procesando…" : kind === "approve" ? "Aprobar versión" : "Rechazar versión"}
  </button>;
}

export function DocumentReviewActions({ versionId, canReview, blockedReason }: { versionId: string; canReview: boolean; blockedReason?: string }) {
  const [approveState, approveAction] = useActionState(approveDocumentVersionAction.bind(null, versionId), {} as ReviewState);
  const [rejectState, rejectAction] = useActionState(rejectDocumentVersionAction.bind(null, versionId), {} as ReviewState);
  if (!canReview) return <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{blockedReason || "No tienes permisos para revisar esta versión."}</p>;
  return <div className="grid gap-4 lg:grid-cols-2">
    <form action={approveAction} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <h3 className="font-bold text-emerald-900">Aprobar y activar</h3>
      <p className="my-3 text-sm text-emerald-800">La vigencia propuesta sustituirá a la vigente y las alertas anteriores quedarán canceladas.</p>
      {approveState.error && <p role="alert" className="mb-3 text-sm font-semibold text-red-700">{approveState.error}</p>}
      <ActionButton kind="approve" />
    </form>
    <form action={rejectAction} className="rounded-xl border border-red-200 bg-red-50 p-4">
      <h3 className="font-bold text-red-900">Rechazar</h3>
      <label className="label mt-3" htmlFor="rejection-reason">Motivo obligatorio</label>
      <textarea id="rejection-reason" name="reason" className="field min-h-24" minLength={10} maxLength={500} required />
      {rejectState.fieldErrors?.reason?.[0] && <p className="mt-1 text-xs font-semibold text-red-700">{rejectState.fieldErrors.reason[0]}</p>}
      {rejectState.error && <p role="alert" className="my-3 text-sm font-semibold text-red-700">{rejectState.error}</p>}
      <div className="mt-3"><ActionButton kind="reject" /></div>
    </form>
  </div>;
}
