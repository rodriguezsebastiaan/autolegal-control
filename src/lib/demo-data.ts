import { addCivilDays, bogotaToday, dateKey } from "./dates";
import type { DemoCategory, DemoDocument, DemoDriver, DemoOwner, DemoRenewal, DemoVehicle, DemoWorkspace } from "./demo-types";

export type { DemoCategory, DemoDocument, DemoDriver, DemoOwner, DemoRenewal, DemoVehicle, DemoWorkspace } from "./demo-types";

const today = bogotaToday();
const civil = (offset: number) => dateKey(addCivilDays(today, offset));

export const demoOrganization = {
  name: "Autolegal · Entorno DEMO",
  today,
  lastUpdate: "Datos ficticios generados para evaluación visual",
};

export const demoVehicles: DemoVehicle[] = [
  { plate: "DMO101", categoryCode: "DEMO-BU", internalNumber: "DEMO-BU-01", brand: "Chevrolet", line: "NPR", year: 2023, color: "Blanco", status: "ACTIVE", ownerId: "demo-owner-01", driverId: "demo-driver-01", service: "Público urbano" },
  { plate: "DMO202", categoryCode: "DEMO-BG", internalNumber: "DEMO-BG-02", brand: "Mercedes-Benz", line: "Sprinter", year: 2024, color: "Gris", status: "ACTIVE", ownerId: "demo-owner-02", driverId: "demo-driver-02", service: "Especial" },
  { plate: "DMO303", categoryCode: "DEMO-CA", internalNumber: "DEMO-CA-03", brand: "Toyota", line: "Land Cruiser", year: 2022, color: "Blanco", status: "MAINTENANCE", ownerId: "demo-owner-03", driverId: "demo-driver-03", service: "Mixto" },
  { plate: "DMO404", categoryCode: "DEMO-KI", internalNumber: "DEMO-KI-04", brand: "Kia", line: "Picanto", year: 2025, color: "Plata", status: "ACTIVE", ownerId: "demo-owner-04", driverId: "demo-driver-04", service: "Público urbano" },
  { plate: "DMO505", categoryCode: "DEMO-TX", internalNumber: "DEMO-TX-05", brand: "Hyundai", line: "Grand i10", year: 2024, color: "Amarillo", status: "ACTIVE", ownerId: "demo-owner-05", driverId: "demo-driver-05", service: "Taxi individual" },
];

export const demoDocuments: DemoDocument[] = [
  { id: "demo-doc-01", plate: "DMO101", type: "SOAT", number: "DEMO-SOAT-101", issuer: "Aseguradora DEMO", issuedAt: civil(-300), expiresAt: civil(60), verificationStatus: "VERIFIED", responsible: "Ana Supervisora Demo", processStatus: "NONE" },
  { id: "demo-doc-02", plate: "DMO101", type: "Revisión técnico-mecánica", number: "DEMO-RTM-101", issuer: "CDA DEMO", issuedAt: civil(-340), expiresAt: civil(20), verificationStatus: "VERIFIED", responsible: "Luis Gestor Demo", processStatus: "IN_RENEWAL" },
  { id: "demo-doc-03", plate: "DMO202", type: "SOAT", number: "DEMO-SOAT-202", issuer: "Aseguradora DEMO", issuedAt: civil(-360), expiresAt: civil(3), verificationStatus: "VERIFIED", responsible: "Ana Supervisora Demo", processStatus: "AWAITING_PAYMENT" },
  { id: "demo-doc-04", plate: "DMO303", type: "Tarjeta de operación", number: "DEMO-TO-303", issuer: "Autoridad DEMO", issuedAt: civil(-370), expiresAt: civil(-5), verificationStatus: "VERIFIED", responsible: "Luis Gestor Demo", processStatus: "IN_RENEWAL" },
  { id: "demo-doc-05", plate: "DMO404", type: "SOAT", number: "DEMO-SOAT-404", issuer: "Aseguradora DEMO", issuedAt: civil(-200), expiresAt: civil(165), verificationStatus: "VERIFIED", responsible: "Ana Supervisora Demo", processStatus: "NONE" },
  { id: "demo-doc-06", plate: "DMO404", type: "Póliza RCC", number: "DEMO-RCC-404", issuer: "Aseguradora DEMO", issuedAt: civil(-10), expiresAt: civil(355), verificationStatus: "PENDING", responsible: "Luis Gestor Demo", processStatus: "NONE" },
  { id: "demo-doc-07", plate: "DMO505", type: "SOAT", number: "DEMO-SOAT-505", issuer: "Aseguradora DEMO", issuedAt: civil(-335), expiresAt: civil(30), verificationStatus: "VERIFIED", responsible: "Ana Supervisora Demo", processStatus: "NONE" },
];

export const demoOwners: DemoOwner[] = [
  { id: "demo-owner-01", type: "Persona jurídica", identification: "NIT DEMO-900001", name: "Transportes Demo Andino S.A.S.", phone: "(606) 000 0101", city: "Manizales" },
  { id: "demo-owner-02", type: "Persona jurídica", identification: "NIT DEMO-900002", name: "Servicios Ejecutivos Demo S.A.S.", phone: "(606) 000 0202", city: "Manizales" },
  { id: "demo-owner-03", type: "Persona natural", identification: "CC DEMO-100003", name: "Juan Propietario Demo", phone: "300 000 0303", city: "Neira" },
  { id: "demo-owner-04", type: "Persona jurídica", identification: "NIT DEMO-900004", name: "Flota Demo Cafetera S.A.S.", phone: "(606) 000 0404", city: "Villamaría" },
  { id: "demo-owner-05", type: "Persona natural", identification: "CC DEMO-100005", name: "Pedro Propietario Demo", phone: "300 000 0505", city: "Manizales" },
];

export const demoDrivers: DemoDriver[] = [
  { id: "demo-driver-01", name: "Carlos Demo Ramírez", identification: "CC DEMO-1101", license: "DEMO-001", category: "C2", issuedAt: civil(-1200), expiresAt: civil(95), vehicle: "DMO101" },
  { id: "demo-driver-02", name: "María Demo López", identification: "CC DEMO-2202", license: "DEMO-002", category: "C2", issuedAt: civil(-1300), expiresAt: civil(18), vehicle: "DMO202" },
  { id: "demo-driver-03", name: "Andrés Demo Gómez", identification: "CC DEMO-3303", license: "DEMO-003", category: "C1", issuedAt: civil(-1500), expiresAt: civil(-2), vehicle: "DMO303" },
  { id: "demo-driver-04", name: "Laura Demo Sánchez", identification: "CC DEMO-4404", license: "DEMO-004", category: "C1", issuedAt: civil(-900), expiresAt: civil(210), vehicle: "DMO404" },
  { id: "demo-driver-05", name: "Felipe Demo Torres", identification: "CC DEMO-5505", license: "DEMO-005", category: "C1", issuedAt: civil(-1000), expiresAt: civil(45), vehicle: "DMO505" },
];

export const demoRenewals: DemoRenewal[] = [
  { id: "demo-renewal-01", plate: "DMO101", document: "Revisión técnico-mecánica", status: "IN_PROGRESS", step: "Cita programada", dueAt: civil(20), responsible: "Luis Gestor Demo" },
  { id: "demo-renewal-02", plate: "DMO202", document: "SOAT", status: "AWAITING_PAYMENT", step: "Cotización aprobada", dueAt: civil(3), responsible: "Ana Supervisora Demo" },
  { id: "demo-renewal-03", plate: "DMO303", document: "Tarjeta de operación", status: "PENDING", step: "Recolección de soportes", dueAt: civil(-5), responsible: "Luis Gestor Demo" },
];

export const demoCategories: DemoCategory[] = [
  { name: "Busetas urbanas", code: "DEMO-BU", description: "Clasificación interna para operación urbana." },
  { name: "Busetas gerencia", code: "DEMO-BG", description: "Vehículos destinados a servicios ejecutivos." },
  { name: "Camperos", code: "DEMO-CA", description: "Clasificación operativa para recorridos mixtos." },
  { name: "Kias", code: "DEMO-KI", description: "Categoría interna de Autolegal; no es modalidad jurídica." },
  { name: "Taxis", code: "DEMO-TX", description: "Servicio público individual." },
];

export const demoWorkspace: DemoWorkspace = {
  vehicles: demoVehicles,
  documents: demoDocuments,
  owners: demoOwners,
  drivers: demoDrivers,
  renewals: demoRenewals,
};
