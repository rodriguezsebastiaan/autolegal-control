import { addCivilDays, bogotaToday, dateKey } from "./dates";
import type { DemoCategory, DemoDocument, DemoDriver, DemoOwner, DemoRenewal, DemoVehicle, DemoWorkspace } from "./demo-types";

export type { DemoCategory, DemoDocument, DemoDriver, DemoOwner, DemoRenewal, DemoVehicle, DemoWorkspace } from "./demo-types";

const today = bogotaToday();
const civil = (offset: number) => dateKey(addCivilDays(today, offset));

export const demoOrganization = {
  name: "Autolegal Control",
  today,
  lastUpdate: "Información local para evaluación funcional",
};

export const demoVehicles: DemoVehicle[] = [
  { plate: "ABC123", categoryCode: "BU", internalNumber: "BU-001", brand: "Chevrolet", line: "NPR", year: 2023, color: "Blanco", status: "ACTIVE", ownerId: "demo-owner-01", driverId: "demo-driver-01", service: "Público urbano" },
  { plate: "DEF456", categoryCode: "BG", internalNumber: "BG-002", brand: "Mercedes-Benz", line: "Sprinter", year: 2024, color: "Gris", status: "ACTIVE", ownerId: "demo-owner-02", driverId: "demo-driver-02", service: "Especial" },
  { plate: "GHI789", categoryCode: "CA", internalNumber: "CA-003", brand: "Toyota", line: "Land Cruiser", year: 2022, color: "Blanco", status: "MAINTENANCE", ownerId: "demo-owner-03", driverId: "demo-driver-03", service: "Mixto" },
  { plate: "JKL012", categoryCode: "KI", internalNumber: "KI-004", brand: "Kia", line: "Picanto", year: 2025, color: "Plata", status: "ACTIVE", ownerId: "demo-owner-04", driverId: "demo-driver-04", service: "Público urbano" },
  { plate: "MNO345", categoryCode: "TX", internalNumber: "TX-005", brand: "Hyundai", line: "Grand i10", year: 2024, color: "Amarillo", status: "ACTIVE", ownerId: "demo-owner-05", driverId: "demo-driver-05", service: "Taxi individual" },
];

export const demoDocuments: DemoDocument[] = [
  { id: "demo-doc-01", plate: "ABC123", type: "SOAT", number: "SOAT-830194", issuer: "Aseguradora Nacional", issuedAt: civil(-300), expiresAt: civil(60), verificationStatus: "VERIFIED", responsible: "Ana Ramírez", processStatus: "NONE" },
  { id: "demo-doc-02", plate: "ABC123", type: "Revisión técnico-mecánica", number: "RTM-410258", issuer: "CDA Central", issuedAt: civil(-340), expiresAt: civil(20), verificationStatus: "VERIFIED", responsible: "Luis Gómez", processStatus: "IN_RENEWAL" },
  { id: "demo-doc-03", plate: "DEF456", type: "SOAT", number: "SOAT-963147", issuer: "Aseguradora Nacional", issuedAt: civil(-360), expiresAt: civil(3), verificationStatus: "VERIFIED", responsible: "Ana Ramírez", processStatus: "AWAITING_PAYMENT" },
  { id: "demo-doc-04", plate: "GHI789", type: "Tarjeta de operación", number: "TO-741085", issuer: "Secretaría de Movilidad", issuedAt: civil(-370), expiresAt: civil(-5), verificationStatus: "VERIFIED", responsible: "Luis Gómez", processStatus: "IN_RENEWAL" },
  { id: "demo-doc-05", plate: "JKL012", type: "SOAT", number: "SOAT-520416", issuer: "Aseguradora Nacional", issuedAt: civil(-200), expiresAt: civil(165), verificationStatus: "VERIFIED", responsible: "Ana Ramírez", processStatus: "NONE" },
  { id: "demo-doc-06", plate: "JKL012", type: "Póliza RCC", number: "RCC-308275", issuer: "Aseguradora Nacional", issuedAt: civil(-10), expiresAt: civil(355), verificationStatus: "PENDING", responsible: "Luis Gómez", processStatus: "NONE" },
  { id: "demo-doc-07", plate: "MNO345", type: "SOAT", number: "SOAT-185630", issuer: "Aseguradora Nacional", issuedAt: civil(-335), expiresAt: civil(30), verificationStatus: "VERIFIED", responsible: "Ana Ramírez", processStatus: "NONE" },
];

export const demoOwners: DemoOwner[] = [
  { id: "demo-owner-01", type: "Persona jurídica", identification: "NIT 901.000.101-1", name: "Transportes Andino S.A.S.", phone: "(606) 880 0101", city: "Manizales" },
  { id: "demo-owner-02", type: "Persona jurídica", identification: "NIT 901.000.202-2", name: "Servicios Ejecutivos S.A.S.", phone: "(606) 880 0202", city: "Manizales" },
  { id: "demo-owner-03", type: "Persona natural", identification: "CC 1.010.003", name: "Juan Carlos Rivera", phone: "300 400 0303", city: "Neira" },
  { id: "demo-owner-04", type: "Persona jurídica", identification: "NIT 901.000.404-4", name: "Flota Cafetera S.A.S.", phone: "(606) 880 0404", city: "Villamaría" },
  { id: "demo-owner-05", type: "Persona natural", identification: "CC 1.010.005", name: "Pedro Antonio López", phone: "300 400 0505", city: "Manizales" },
];

export const demoDrivers: DemoDriver[] = [
  { id: "demo-driver-01", name: "Carlos Ramírez", identification: "CC 1.101.101", license: "LC-520001", category: "C2", issuedAt: civil(-1200), expiresAt: civil(95), vehicle: "ABC123" },
  { id: "demo-driver-02", name: "María López", identification: "CC 1.102.202", license: "LC-520002", category: "C2", issuedAt: civil(-1300), expiresAt: civil(18), vehicle: "DEF456" },
  { id: "demo-driver-03", name: "Andrés Gómez", identification: "CC 1.103.303", license: "LC-520003", category: "C1", issuedAt: civil(-1500), expiresAt: civil(-2), vehicle: "GHI789" },
  { id: "demo-driver-04", name: "Laura Sánchez", identification: "CC 1.104.404", license: "LC-520004", category: "C1", issuedAt: civil(-900), expiresAt: civil(210), vehicle: "JKL012" },
  { id: "demo-driver-05", name: "Felipe Torres", identification: "CC 1.105.505", license: "LC-520005", category: "C1", issuedAt: civil(-1000), expiresAt: civil(45), vehicle: "MNO345" },
];

export const demoRenewals: DemoRenewal[] = [
  { id: "demo-renewal-01", plate: "ABC123", document: "Revisión técnico-mecánica", status: "IN_PROGRESS", step: "Cita programada", dueAt: civil(20), responsible: "Luis Gómez" },
  { id: "demo-renewal-02", plate: "DEF456", document: "SOAT", status: "AWAITING_PAYMENT", step: "Cotización aprobada", dueAt: civil(3), responsible: "Ana Ramírez" },
  { id: "demo-renewal-03", plate: "GHI789", document: "Tarjeta de operación", status: "PENDING", step: "Recolección de soportes", dueAt: civil(-5), responsible: "Luis Gómez" },
];

export const demoCategories: DemoCategory[] = [
  { name: "Busetas urbanas", code: "BU", description: "Clasificación interna para operación urbana." },
  { name: "Busetas gerencia", code: "BG", description: "Vehículos destinados a servicios ejecutivos." },
  { name: "Camperos", code: "CA", description: "Clasificación operativa para recorridos mixtos." },
  { name: "Kias", code: "KI", description: "Categoría interna de Autolegal; no es modalidad jurídica." },
  { name: "Taxis", code: "TX", description: "Servicio público individual." },
];

export const demoWorkspace: DemoWorkspace = {
  vehicles: demoVehicles,
  documents: demoDocuments,
  owners: demoOwners,
  drivers: demoDrivers,
  renewals: demoRenewals,
};
