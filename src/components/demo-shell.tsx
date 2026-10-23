"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, BellRing, Building2, CarFront, ChevronRight, FileCheck2, FolderCog,
  LayoutDashboard, Menu, RefreshCcw, Settings, ShieldCheck, UserRound, UsersRound, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const demoLinks = [
  { href: "/demo", label: "Resumen ejecutivo", icon: LayoutDashboard },
  { href: "/demo/vehiculos", label: "Vehículos", icon: CarFront },
  { href: "/demo/categorias", label: "Categorías", icon: FolderCog },
  { href: "/demo/documentos", label: "Documentos", icon: FileCheck2 },
  { href: "/demo/alertas", label: "Centro de alertas", icon: BellRing },
  { href: "/demo/renovaciones", label: "Renovaciones", icon: RefreshCcw },
  { href: "/demo/propietarios", label: "Propietarios", icon: UsersRound },
  { href: "/demo/empresas", label: "Empresas", icon: Building2 },
  { href: "/demo/conductores", label: "Conductores", icon: UserRound },
  { href: "/demo/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/demo/configuracion", label: "Configuración", icon: Settings },
];

function DemoSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <div className="flex h-full flex-col bg-[#071b2f] text-white">
    <div className="border-b border-white/10 px-5 py-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-400 text-[#071b2f]"><ShieldCheck size={22}/></span>
        <div><p className="text-sm font-black tracking-wide">AUTOLEGAL</p><p className="text-[0.68rem] font-bold tracking-[0.22em] text-teal-300">CONTROL</p></div>
      </div>
      <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2.5">
        <p className="text-xs font-black text-amber-200">ENTORNO DEMO LOCAL</p>
        <p className="mt-1 text-[0.68rem] leading-4 text-amber-100/75">Datos ficticios · Solo lectura</p>
      </div>
    </div>
    <nav aria-label="Módulos de demostración" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {demoLinks.map(({ href, label, icon: Icon }) => {
        const active = href === "/demo" ? pathname === href : pathname.startsWith(href);
        return <Link onClick={onNavigate} key={href} href={href} className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
          active ? "bg-teal-400 text-[#071b2f] shadow-lg shadow-teal-950/20" : "text-slate-300 hover:bg-white/8 hover:text-white",
        )}><Icon size={18}/><span className="flex-1">{label}</span>{active && <ChevronRight size={15}/>}</Link>;
      })}
    </nav>
    <div className="border-t border-white/10 p-4">
      <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-400/15 text-sm font-black text-teal-200">AD</span>
        <div className="min-w-0"><p className="truncate text-sm font-bold">Analista Demo</p><p className="text-xs text-slate-400">Navegación sin persistencia</p></div>
      </div>
    </div>
  </div>;
}

export function DemoShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block"><DemoSidebar/></aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden">
      <button aria-label="Cerrar menú" className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setOpen(false)}/>
      <aside className="relative h-full w-[min(88vw,19rem)] shadow-2xl"><button aria-label="Cerrar menú" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 rounded-lg border border-white/10 p-2 text-white"><X size={18}/></button><DemoSidebar onNavigate={() => setOpen(false)}/></aside>
    </div>}
    <main className="min-h-screen lg:ml-72">
      <div className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
        <button aria-label="Abrir menú" onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 lg:hidden"><Menu size={19}/></button>
        <div><p className="text-xs font-black uppercase tracking-[0.13em] text-teal-700">Autolegal · DEMO</p><p className="hidden text-xs text-slate-500 sm:block">Evaluación visual y funcional sin base de datos</p></div>
        <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200"><span className="h-2 w-2 rounded-full bg-amber-500"/>Solo lectura</span>
      </div>
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </main>
  </div>;
}
