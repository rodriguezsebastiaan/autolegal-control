import { documentValidity } from "./dates";
import type { DemoDocument } from "./demo-types";

export type DemoAlertLevel = "Vencido" | "Crítico" | "Alta" | "Preventiva" | "Vigente" | "Pendiente de revisión";

export function getDemoAlert(document: DemoDocument, today?: string) {
  const validity = documentValidity({ ...document, today });
  const days = validity.daysRemaining;
  let level: DemoAlertLevel;
  if (validity.status === "PENDIENTE_VERIFICACION") level = "Pendiente de revisión";
  else if (days === null) level = "Pendiente de revisión";
  else if (days < 0) level = "Vencido";
  else if (days <= 3) level = "Crítico";
  else if (days <= 15) level = "Alta";
  else if (days <= 30) level = "Preventiva";
  else level = "Vigente";
  return { ...document, validity, daysRemaining: days, level };
}

export function buildDemoAlerts(documents: DemoDocument[], today?: string) {
  return documents
    .map((document) => getDemoAlert(document, today))
    .sort((a, b) => (a.daysRemaining ?? Number.MAX_SAFE_INTEGER) - (b.daysRemaining ?? Number.MAX_SAFE_INTEGER));
}
