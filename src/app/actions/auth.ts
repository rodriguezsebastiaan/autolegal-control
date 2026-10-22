"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";

export type AuthState = { error?: string };

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  try {
    const user = await db.user.findFirst({
      where: { email: parsed.data.email, active: true },
      include: { role: true },
    });
    if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
      return { error: "Correo o contraseña incorrectos" };
    }
    await createSession(user.id);
    await db.auditLog.create({
      data: { organizationId: user.organizationId, userId: user.id, action: "AUTH_LOGIN", entityType: "User", entityId: user.id },
    });
  } catch (error) {
    console.error("Login error", error);
    return { error: "No fue posible conectar con la base de datos. Revisa la configuración local." };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
