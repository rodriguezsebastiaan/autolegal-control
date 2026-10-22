import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RoleCode } from "@prisma/client";
import { db } from "./db";

const cookieName = process.env.SESSION_COOKIE_NAME || "autolegal_session";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const ttlHours = Number(process.env.SESSION_TTL_HOURS || 12);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await db.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(cookieName);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { role: true, organization: true } } },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.active) {
    if (session) await db.session.delete({ where: { id: session.id } });
    cookieStore.delete(cookieName);
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(allowed: RoleCode[]) {
  const user = await requireUser();
  if (!allowed.includes(user.role.code)) redirect("/sin-permiso");
  return user;
}
