import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.17em] text-teal-700">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function MetricCard({ label, value, icon: Icon, tone = "teal", hint }: {
  label: string; value: number | string; icon: LucideIcon; tone?: "teal" | "blue" | "amber" | "red"; hint?: string;
}) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
        </div>
        <span className={cn("rounded-xl p-2.5", tones[tone])}><Icon size={20} /></span>
      </div>
    </article>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto mb-3 h-2 w-12 rounded-full bg-teal-500" />
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  VIGENTE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-200",
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  PENDIENTE_VERIFICACION: "bg-amber-50 text-amber-800 ring-amber-200",
  PROXIMO_A_VENCER: "bg-blue-50 text-blue-700 ring-blue-200",
  URGENTE: "bg-orange-50 text-orange-800 ring-orange-200",
  VENCIDO: "bg-red-50 text-red-700 ring-red-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold ring-1 ring-inset", badgeStyles[status] || "bg-slate-100 text-slate-700 ring-slate-200")}>
      {label || status.replaceAll("_", " ")}
    </span>
  );
}
