import Link from "next/link";
import { BarChart3, Bell, CarFront, FileCheck2, FolderCog, LayoutDashboard, ShieldCheck, UsersRound } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "Resumen ejecutivo", icon: LayoutDashboard },
  { href: "/vehiculos", label: "Vehículos", icon: CarFront },
  { href: "/documentos", label: "Control documental", icon: FileCheck2 },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/personas", label: "Personas y empresas", icon: UsersRound },
  { href: "/categorias", label: "Categorías", icon: FolderCog },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];

export function Sidebar({ userName, organizationMode }: { userName: string; organizationMode: string }) {
  return (
    <aside className="desktop-sidebar fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-[#071b2f] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 text-[#071b2f]"><ShieldCheck size={22} /></span>
          <div><p className="text-sm font-black tracking-wide">AUTOLEGAL</p><p className="text-[0.68rem] font-bold tracking-[0.22em] text-teal-300">CONTROL</p></div>
        </div>
      </div>
      {organizationMode === "DEMO" && <div className="mx-4 mt-4 rounded-lg border border-amber-400/30 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200">Modo demostración · datos ficticios</div>}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white">
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 px-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-bold">{userName.slice(0, 1)}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{userName}</p><p className="text-xs text-slate-400">Sesión protegida</p></div></div>
        <form action={logoutAction}><button className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/5">Cerrar sesión</button></form>
      </div>
    </aside>
  );
}
