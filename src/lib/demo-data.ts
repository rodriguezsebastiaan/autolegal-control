import "server-only";

import { addCivilDays, bogotaToday, dateKey, documentValidity } from "./dates";

export type DemoVehicle = {
  plate: string;
  category: string;
  internalNumber: string;
  brand: string;
  line: string;
  year: number;
  color: string;
  status: "ACTIVE" | "MAINTENANCE";
  owner: string;
  company: string;
  driver: string;
  service: string;
};

export type DemoDocument = {
  id: string;
  plate: string;
  type: string;
  number: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  responsible: string;
  processStatus: "NONE" | "IN_RENEWAL" | "AWAITING_PAYMENT";
};

const today = bogotaToday();
const civil = (offset: number) => dateKey(addCivilDays(today, offset));

export const demoOrganization = {
  name: "Autolegal · Entorno DEMO",
  today,
  lastUpdate: "Datos ficticios generados para evaluación visual",
};

export const demoVehicles: DemoVehicle[] = [
  { plate: "DMO101", category: "Busetas urbanas", internalNumber: "DEMO-BU-01", brand: "Chevrolet", line: "NPR", year: 2023, color: "Blanco", status: "ACTIVE", owner: "Transportes Demo Andino S.A.S.", company: "Operadora Demo Manizales", driver: "Carlos Demo Ramírez", service: "Público urbano" },
  { plate: "DMO202", category: "Busetas gerencia", internalNumber: "DEMO-BG-02", brand: "Mercedes-Benz", line: "Sprinter", year: 2024, color: "Gris", status: "ACTIVE", owner: "Servicios Ejecutivos Demo S.A.S.", company: "Autolegal Transporte Demo", driver: "María Demo López", service: "Especial" },
  { plate: "DMO303", category: "Camperos", internalNumber: "DEMO-CA-03", brand: "Toyota", line: "Land Cruiser", year: 2022, color: "Blanco", status: "MAINTENANCE", owner: "Juan Propietario Demo", company: "Operadora Demo Manizales", driver: "Andrés Demo Gómez", service: "Mixto" },
  { plate: "DMO404", category: "Kias", internalNumber: "DEMO-KI-04", brand: "Kia", line: "Picanto", year: 2025, color: "Plata", status: "ACTIVE", owner: "Flota Demo Cafetera S.A.S.", company: "Central Demo de Transporte", driver: "Laura Demo Sánchez", service: "Público urbano" },
  { plate: "DMO505", category: "Taxis", internalNumber: "DEMO-TX-05", brand: "Hyundai", line: "Grand i10", year: 2024, color: "Amarillo", status: "ACTIVE", owner: "Pedro Propietario Demo", company: "Central Demo de Transporte", driver: "Felipe Demo Torres", service: "Taxi individual" },
  { plate: "DMO606", category: "Buses intermunicipales", internalNumber: "DEMO-BI-06", brand: "Hino", line: "FC9J", year: 2021, color: "Azul y blanco", status: "ACTIVE", owner: "Transportes Demo Andino S.A.S.", company: "Autolegal Transporte Demo", driver: "Sofía Demo Valencia", service: "Intermunicipal" },
];

export const demoDocuments: DemoDocument[] = [
  { id: "demo-doc-01", plate: "DMO101", type: "SOAT", number: "DEMO-SOAT-101", issuer: "Aseguradora DEMO", issuedAt: civil(-300), expiresAt: civil(60), verificationStatus: "VERIFIED", responsible: "Ana Supervisora Demo", processStatus: "NONE" },
  { id: "demo-doc-02", plate: "DMO101", type: "Revisión técnico-mecánica", number: "DEMO-RTM-101", issuer: "CDA DEMO", issuedAt: civil(-340), expiresAt: civil(20), verificationStatus: "VERIFIED", responsible: "Luis Gestor Demo", processStatus: "IN_RENEWAL" },
  { id: "demo-doc-03", plate: "DMO202", type: "SOAT", number: "DEMO-SOAT-202", issuer: "Aseguradora DEMO", issuedAt: civil(-360), expiresAt: civil(3), verificationStatus: "VERIFIED", responsible: "Ana Supervisora Demo", processStatus: "AWAITING_PAYMENT" },
  { id: "demo-doc-04", plate: "DMO303", type: "Tarjeta de operación", number: "DEMO-TO-303", issuer: "Autoridad DEMO", issuedAt: civil(-370), expiresAt: civil(-5), verificationStatus: "VERIFIED", responsible: "Luis Gestor Demo", processStatus: "IN_RENEWAL" },
  { id: "demo-doc-05", plate: "DMO404", type: "SOAT", number: "DEMO-SOAT-404", issuer: "Aseguradora DEMO", issuedAt: civil(-200), expiresAt: civil(165), verificationStatus: "VERIFIED", responsible: "Ana Supervisora Demo", processStatus: "NONE" },
  { id: "demo-doc-06", plate: "DMO404", type: "Póliza RCC", number: "DEMO-RCC-404", issuer: "Aseguradora DEMO", issuedAt: civil(-10), expiresAt: civil(355), verificationStatus: "PENDING", responsible: "Luis Gestor Demo", processStatus: "NONE" },
  { id: "demo-doc-07", plate: "DMO505", type: "SOAT", number: "DEMO-SOAT-505", issuer: "Aseguradora DEMO", issuedAt: civil(-335), expiresAt: civil(30), verificationStatus: "VERIFIED", responsible: "Ana Supervisora Demo", processStatus: "NONE" },
  { id: "demo-doc-08", plate: "DMO606", type: "Revisión técnico-mecánica", number: "DEMO-RTM-606", issuer: "CDA DEMO", issuedAt: civil(-355), expiresAt: civil(10), verificationStatus: "VERIFIED", responsible: "Luis Gestor Demo", processStatus: "IN_RENEWAL" },
  { id: "demo-doc-09", plate: "DMO606", type: "Tarjeta de operación", number: "DEMO-TO-606", issuer: "Autoridad DEMO", issuedAt: civil(-180), expiresAt: civil(185), verificationStatus: "REJECTED", responsible: "Luis Gestor Demo", processStatus: "NONE" },
];

export const demoOwners = [
  { id: "demo-owner-01", type: "Persona jurídica", identification: "NIT DEMO-900001", name: "Transportes Demo Andino S.A.S.", phone: "(606) 000 0101", city: "Manizales", vehicles: 2 },
  { id: "demo-owner-02", type: "Persona jurídica", identification: "NIT DEMO-900002", name: "Servicios Ejecutivos Demo S.A.S.", phone: "(606) 000 0202", city: "Manizales", vehicles: 1 },
  { id: "demo-owner-03", type: "Persona natural", identification: "CC DEMO-100003", name: "Juan Propietario Demo", phone: "300 000 0303", city: "Neira", vehicles: 1 },
  { id: "demo-owner-04", type: "Persona jurídica", identification: "NIT DEMO-900004", name: "Flota Demo Cafetera S.A.S.", phone: "(606) 000 0404", city: "Villamaría", vehicles: 1 },
  { id: "demo-owner-05", type: "Persona natural", identification: "CC DEMO-100005", name: "Pedro Propietario Demo", phone: "300 000 0505", city: "Manizales", vehicles: 1 },
];

export const demoCompanies = [
  { id: "demo-company-01", nit: "NIT DEMO-800101", name: "Operadora Demo Manizales", modality: "Urbano y mixto", contact: "Diana Contacto Demo", vehicles: 2 },
  { id: "demo-company-02", nit: "NIT DEMO-800202", name: "Autolegal Transporte Demo", modality: "Especial e intermunicipal", contact: "Óscar Contacto Demo", vehicles: 2 },
  { id: "demo-company-03", nit: "NIT DEMO-800303", name: "Central Demo de Transporte", modality: "Individual y urbano", contact: "Paula Contacto Demo", vehicles: 2 },
];

export const demoDrivers = [
  { id: "demo-driver-01", name: "Carlos Demo Ramírez", identification: "CC DEMO-1101", license: "C2 · DEMO-001", expiresAt: civil(95), vehicle: "DMO101" },
  { id: "demo-driver-02", name: "María Demo López", identification: "CC DEMO-2202", license: "C2 · DEMO-002", expiresAt: civil(18), vehicle: "DMO202" },
  { id: "demo-driver-03", name: "Andrés Demo Gómez", identification: "CC DEMO-3303", license: "C1 · DEMO-003", expiresAt: civil(-2), vehicle: "DMO303" },
  { id: "demo-driver-04", name: "Laura Demo Sánchez", identification: "CC DEMO-4404", license: "C1 · DEMO-004", expiresAt: civil(210), vehicle: "DMO404" },
  { id: "demo-driver-05", name: "Felipe Demo Torres", identification: "CC DEMO-5505", license: "C1 · DEMO-005", expiresAt: civil(45), vehicle: "DMO505" },
  { id: "demo-driver-06", name: "Sofía Demo Valencia", identification: "CC DEMO-6606", license: "C3 · DEMO-006", expiresAt: civil(120), vehicle: "DMO606" },
];

export const demoRenewals = [
  { id: "demo-renewal-01", plate: "DMO101", document: "Revisión técnico-mecánica", status: "IN_PROGRESS", step: "Cita programada", dueAt: civil(20), responsible: "Luis Gestor Demo" },
  { id: "demo-renewal-02", plate: "DMO202", document: "SOAT", status: "AWAITING_PAYMENT", step: "Cotización aprobada", dueAt: civil(3), responsible: "Ana Supervisora Demo" },
  { id: "demo-renewal-03", plate: "DMO303", document: "Tarjeta de operación", status: "PENDING", step: "Recolección de soportes", dueAt: civil(-5), responsible: "Luis Gestor Demo" },
  { id: "demo-renewal-04", plate: "DMO606", document: "Revisión técnico-mecánica", status: "COMPLETED", step: "Pendiente de revisión documental", dueAt: civil(10), responsible: "Ana Supervisora Demo" },
];

export const demoCategories = [
  { name: "Busetas urbanas", code: "DEMO-BU", vehicles: 1, description: "Clasificación interna para operación urbana." },
  { name: "Busetas gerencia", code: "DEMO-BG", vehicles: 1, description: "Vehículos destinados a servicios ejecutivos." },
  { name: "Camperos", code: "DEMO-CA", vehicles: 1, description: "Clasificación operativa para recorridos mixtos." },
  { name: "Kias", code: "DEMO-KI", vehicles: 1, description: "Categoría interna de Autolegal; no es modalidad jurídica." },
  { name: "Taxis", code: "DEMO-TX", vehicles: 1, description: "Servicio público individual." },
  { name: "Buses intermunicipales", code: "DEMO-BI", vehicles: 1, description: "Operación entre municipios." },
];

export const demoAlerts = demoDocuments
  .map((document) => ({ document, validity: documentValidity(document) }))
  .filter(({ validity }) => ["PROXIMO_A_VENCER", "URGENTE", "VENCIDO"].includes(validity.status))
  .map(({ document, validity }, index) => ({
    ...document,
    id: `demo-alert-${index + 1}`,
    status: validity.status,
    daysRemaining: validity.daysRemaining,
    level: validity.status === "VENCIDO" ? "Crítica" : validity.status === "URGENTE" ? "Alta" : "Preventiva",
  }));

export const demoDocumentStates = demoDocuments.map((document) => ({ ...document, validity: documentValidity(document) }));
