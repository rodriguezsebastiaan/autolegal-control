export type DocumentValidity =
  | "VIGENTE"
  | "PROXIMO_A_VENCER"
  | "URGENTE"
  | "VENCIDO"
  | "SIN_INFORMACION"
  | "PENDIENTE_VERIFICACION";

function utcDay(year: number, month: number, day: number) {
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function bogotaToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function dateKey(value: Date | string) {
  if (typeof value === "string") return value.slice(0, 10);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
}

export function daysUntil(expiration: Date | string, today = bogotaToday()) {
  const [ey, em, ed] = dateKey(expiration).split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return utcDay(ey, em, ed) - utcDay(ty, tm, td);
}

export function documentValidity(input: {
  expiresAt: Date | string | null;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  today?: string;
}): { status: DocumentValidity; daysRemaining: number | null } {
  if (input.verificationStatus !== "VERIFIED") {
    return { status: "PENDIENTE_VERIFICACION", daysRemaining: input.expiresAt ? daysUntil(input.expiresAt, input.today) : null };
  }
  if (!input.expiresAt) return { status: "SIN_INFORMACION", daysRemaining: null };

  const daysRemaining = daysUntil(input.expiresAt, input.today);
  if (daysRemaining < 0) return { status: "VENCIDO", daysRemaining };
  if (daysRemaining <= 3) return { status: "URGENTE", daysRemaining };
  if (daysRemaining <= 30) return { status: "PROXIMO_A_VENCER", daysRemaining };
  return { status: "VIGENTE", daysRemaining };
}

export const validityLabels: Record<DocumentValidity, string> = {
  VIGENTE: "Vigente",
  PROXIMO_A_VENCER: "Próximo a vencer",
  URGENTE: "Urgente",
  VENCIDO: "Vencido",
  SIN_INFORMACION: "Sin información",
  PENDIENTE_VERIFICACION: "Pendiente de verificación",
};
