"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, BellRing, CarFront, FileCheck2, FolderCog, LayoutDashboard, Menu,
  RefreshCcw, RotateCcw, Settings, ShieldCheck, UserRound, UsersRound, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "./demo-store";

const navigation = [
  { group: "INICIO", links: [{ href: "/panel", label: "Resumen ejecutivo", icon: LayoutDashboard }] },
  { group: "GESTIÓN", links: [
    { href: "/panel/vehiculos", label: "Vehículos", icon: CarFront },
    { href: "/panel/categorias", label: "Categorías", icon: FolderCog },
    { href: "/panel/documentos", label: "Documentos", icon: FileCheck2 },
    { href: "/panel/propietarios", label: "Propietarios", icon: UsersRound },
    { href: "/panel/conductores", label: "Conductores", icon: UserRound },
  ] },
  { group: "CONTROL", links: [
    { href: "/panel/alertas", label: "Centro de alertas", icon: BellRing },
    { href: "/panel/renovaciones", label: "Renovaciones", icon: RefreshCcw },
    { href: "/panel/reportes", label: "Reportes", icon: BarChart3 },
  ] },
  { group: "SISTEMA", links: [{ href: "/panel/configuracion", label: "Configuración", icon: Settings }] },
];

const allLinks = navigation.flatMap((section) => section.links);

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <div className="flex h-full flex-col bg-[#0b1f33] text-white">
    <div className="flex h-[76px] items-center border-b border-white/8 px-6">
      <span className="mr-3 grid h-10 w-10 place-items-center rounded-lg bg-[#22b8a7] text-[#082133]"><ShieldCheck size={22}/></span>
      <div><p className="text-[0.82rem] font-extrabold tracking-[0.08em]">AUTOLEGAL</p><p className="mt-0.5 text-[0.62rem] font-semibold tracking-[0.24em] text-teal-300">CONTROL</p></div>
    </div>
    <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-5">
      {navigation.map((section) => <div key={section.group} className="mb-5">
        <p className="mb-2 px-3 text-[0.62rem] font-bold tracking-[0.16em] text-slate-500">{section.group}</p>
        <div className="space-y-1">{section.links.map(({ href, label, icon: Icon }) => {
          const active = href === "/panel" ? pathname === href : pathname.startsWith(href);
          return <Link onClick={onNavigate} key={href} href={href} className={cn(
            "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.86rem] font-medium transition-colors",
            active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
          )}>{active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-teal-400"/>}<Icon size={17}/><span>{label}</span></Link>;
        })}</div>
      </div>)}
    </nav>
    <div className="border-t border-white/8 p-4">
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-400/15 text-xs font-bold text-teal-200">AU</span>
        <div className="min-w-0"><p className="truncate text-sm font-semibold">Equipo Autolegal</p><p className="text-[0.7rem] text-slate-400">Entorno local</p></div>
      </div>
    </div>
  </div>;
}

export function DemoShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { resetDemo } = useDemoStore();
  const current = [...allLinks].sort((a, b) => b.href.length - a.href.length).find((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
  return <div className="min-h-screen bg-[#f4f6f8]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[268px] lg:block"><Sidebar/></aside>
    {open && <div className="fixed inset-0 z-40 lg:hidden">
      <button aria-label="Cerrar menú" className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)}/>
      <aside className="relative h-full w-[min(88vw,18rem)] shadow-2xl"><button aria-label="Cerrar menú" onClick={() => setOpen(false)} className="absolute right-3 top-4 z-10 rounded-md border border-white/10 p-2 text-white"><X size={18}/></button><Sidebar onNavigate={() => setOpen(false)}/></aside>
    </div>}
    <main className="min-h-screen lg:ml-[268px]">
      <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <button aria-label="Abrir menú" onClick={() => setOpen(true)} className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 lg:hidden"><Menu size={19}/></button>
        <div><p className="text-sm font-semibold text-slate-900">{current?.label || "Panel administrativo"}</p><p className="hidden text-xs text-slate-500 sm:block">Control documental y gestión de flota</p></div>
        <button onClick={() => { if (window.confirm("¿Restaurar los datos iniciales de este entorno local?")) resetDemo(); }} className="ml-auto hidden items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 sm:inline-flex"><RotateCcw size={14}/>Restaurar datos</button>
        <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[0.7rem] font-semibold text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Entorno local</span>
      </header>
      <div className="mx-auto w-full max-w-[1540px] p-4 sm:p-6 lg:p-8 xl:p-10">{children}</div>
    </main>
  </div>;
}
