import { Bell, Search } from "lucide-react";

export function Topbar({ organization }: { organization: string }) {
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-5 backdrop-blur-lg md:px-8">
      <div className="relative hidden w-full max-w-sm sm:block">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
        <input aria-label="Búsqueda global" className="field py-2 pl-10 text-sm" placeholder="Buscar placa, propietario, documento…" />
      </div>
      <div className="ml-auto flex items-center gap-3"><span className="hidden text-xs font-bold text-slate-500 sm:inline">{organization}</span><button aria-label="Notificaciones" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600"><Bell size={18} /></button></div>
    </div>
  );
}
