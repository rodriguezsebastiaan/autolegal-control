export type DocumentValidity =
  | "VIGENTE"
  | "PROXIMO_A_VENCER"
  | "URGENTE"
  | "VENCIDO"
  | "SIN_INFORMACION"
  | "PENDIENTE_VERIFICACION";

const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function utcDay(year: number, month: number, day: number) {
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

function civilDateParts(value: string) {
  const match = CIVIL_DATE_PATTERN.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) return null;
  return { year, month, day };
}

/** Devuelve la fecha civil YYYY-MM-DD sin convertirla a una zona horaria. */
export function dateKey(value: Date | string) {
  if (typeof value === "string") {
    const key = value.slice(0, 10);
    if (!civilDateParts(key)) throw new RangeError(`Fecha civil inválida: ${value}`);
    return key;
  }
  if (Number.isNaN(value.getTime())) throw new RangeError("Fecha inválida");
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
}

/** Convierte una fecha civil para Prisma @db.Date preservando exactamente su día. */
export function parseCivilDate(value?: string | null) {
  if (!value) return undefined;
  const key = dateKey(value);
  const parts = civilDateParts(key)!;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

export function isCivilDate(value: string) {
  return civilDateParts(value) !== null;
}

export function formatCivilDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const [year, month, day] = dateKey(value).split("-");
  return `${day}/${month}/${year}`;
}

export function addCivilDays(value: Date | string, days: number) {
  const date = parseCivilDate(dateKey(value))!;
  date.setUTCDate(date.getUTCDate() + days);
  return date;
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
