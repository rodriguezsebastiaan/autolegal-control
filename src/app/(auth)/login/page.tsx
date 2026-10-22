import { redirect } from "next/navigation";
import { ShieldCheck, FileCheck2, TimerReset } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const current = await getSessionUser();
  if (current) redirect("/dashboard");
  return (
    <main className="grid min-h-screen bg-[#071b2f] lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-28 top-36 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-400 text-[#071b2f]"><ShieldCheck /></span><div><p className="font-black tracking-wide">AUTOLEGAL</p><p className="text-xs font-bold tracking-[0.25em] text-teal-300">CONTROL</p></div></div>
        <div className="relative max-w-xl"><p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-teal-300">Inteligencia documental para su flota</p><h1 className="text-5xl font-bold leading-[1.08] tracking-tight">Cada vehículo al día. Cada vencimiento bajo control.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-300">Centraliza expedientes, anticipa riesgos y coordina renovaciones desde una plataforma segura diseñada para Autolegal.</p><div className="mt-10 grid grid-cols-2 gap-4"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><FileCheck2 className="mb-3 text-teal-300" /><p className="text-sm font-bold">Expediente unificado</p><p className="mt-1 text-xs text-slate-400">Información trazable y verificable.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><TimerReset className="mb-3 text-teal-300" /><p className="text-sm font-bold">Alertas oportunas</p><p className="mt-1 text-xs text-slate-400">Anticipaciones configurables.</p></div></div></div>
        <p className="relative text-xs text-slate-500">Una solución tecnológica de ConexaCod para Autolegal · Manizales, Colombia</p>
      </section>
      <section className="flex items-center justify-center bg-[#f5f8f8] p-6 sm:p-10">
        <div className="w-full max-w-md"><div className="mb-8 lg:hidden"><p className="text-xl font-black text-[#071b2f]">AUTOLEGAL <span className="text-teal-600">CONTROL</span></p></div><div className="card p-7 sm:p-9"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">Acceso protegido</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Bienvenido</h2><p className="mb-7 mt-2 text-sm leading-6 text-slate-500">Ingresa con las credenciales asignadas por el administrador.</p><LoginForm /></div><p className="mt-5 text-center text-xs text-slate-500">No hay registro público. El acceso y las acciones quedan auditados.</p></div>
      </section>
    </main>
  );
}
