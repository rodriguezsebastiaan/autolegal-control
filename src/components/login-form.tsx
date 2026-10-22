"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { loginAction, type AuthState } from "@/app/actions/auth";

function LoginButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary mt-2 w-full py-3">{pending ? "Verificando…" : "Ingresar al sistema"}<ArrowRight size={17} /></button>;
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, {} as AuthState);
  return (
    <form action={action} className="space-y-5">
      <div><label className="label" htmlFor="email">Correo institucional</label><div className="relative"><Mail className="absolute left-3 top-3.5 text-slate-400" size={17} /><input className="field py-3 pl-10" id="email" name="email" type="email" autoComplete="username" placeholder="usuario@autolegal.com" required /></div></div>
      <div><label className="label" htmlFor="password">Contraseña</label><div className="relative"><LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={17} /><input className="field py-3 pl-10" id="password" name="password" type="password" autoComplete="current-password" minLength={8} required /></div></div>
      {state.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">{state.error}</p>}
      <LoginButton />
    </form>
  );
}
