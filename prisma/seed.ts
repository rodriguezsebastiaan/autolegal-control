import { hash } from "bcryptjs";
import { PrismaClient, RoleCode } from "@prisma/client";
import { addCivilDays, bogotaToday, parseCivilDate } from "../src/lib/dates";

const prisma = new PrismaClient();
const categoryNames = ["Busetas urbanas", "Busetas gerencia", "Camperos", "Kias", "Taxis", "Buses intermunicipales"];
const documentTypes = [
  ["SOAT", "SOAT", true],
  ["Revisión técnico-mecánica", "RTM", true],
  ["Tarjeta de operación", "TARJETA_OPERACION", true],
  ["Póliza de responsabilidad civil contractual", "RCC", true],
  ["Póliza de responsabilidad civil extracontractual", "RCE", true],
  ["Impuestos y obligaciones locales", "IMPUESTOS", false],
  ["Contrato de vinculación", "CONTRATO_VINCULACION", true],
] as const;
const roleData: Record<RoleCode, { name: string; description: string }> = {
  ADMIN: { name: "Administrador", description: "Control total de configuración y operación." },
  SUPERVISOR: { name: "Supervisor", description: "Supervisión de expedientes, alertas y renovaciones." },
  DOCUMENT_MANAGER: { name: "Gestor documental", description: "Gestión de vehículos y documentos." },
  VIEWER: { name: "Usuario de consulta", description: "Acceso de solo lectura." },
};

async function main() {
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password || password.startsWith("CAMBIE_") || password.length < 12) throw new Error("Define ADMIN_INITIAL_PASSWORD con al menos 12 caracteres y sin usar el valor de ejemplo.");
  const roles = new Map<RoleCode, string>();
  for (const [code, data] of Object.entries(roleData) as [RoleCode, (typeof roleData)[RoleCode]][]) {
    const role = await prisma.role.upsert({ where: { code }, update: data, create: { code, ...data } }); roles.set(code, role.id);
  }
  const organizationCode = (process.env.ADMIN_ORGANIZATION_CODE || "autolegal-demo").trim().toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/.test(organizationCode)) throw new Error("ADMIN_ORGANIZATION_CODE debe contener letras minúsculas, números o guiones.");
  const organization = await prisma.organization.upsert({
    where: { loginCode: organizationCode },
    update: { name: "Autolegal · Demostración", mode: "DEMO" },
    create: { loginCode: organizationCode, name: "Autolegal · Demostración", mode: "DEMO" },
  });
  const email = (process.env.ADMIN_EMAIL || "admin@autolegal.local").toLowerCase();
  const admin = await prisma.user.upsert({ where: { organizationId_email: { organizationId: organization.id, email } }, update: { name: "Administrador Autolegal", passwordHash: await hash(password, 12), roleId: roles.get("ADMIN")! }, create: { organizationId: organization.id, email, name: "Administrador Autolegal", passwordHash: await hash(password, 12), roleId: roles.get("ADMIN")! } });
  const categories = [];
  for (const name of categoryNames) categories.push(await prisma.vehicleCategory.upsert({ where: { organizationId_name: { organizationId: organization.id, name } }, update: { active: true }, create: { organizationId: organization.id, name, description: "Clasificación interna de Autolegal." } }));
  const types = [];
  for (const [name, code, hasExpiration] of documentTypes) types.push(await prisma.documentType.upsert({ where: { organizationId_code: { organizationId: organization.id, code } }, update: { name, hasExpiration }, create: { organizationId: organization.id, name, code, hasExpiration } }));
  for (const type of types.filter((x) => x.hasExpiration)) for (const advanceDays of [60, 30, 20, 17, 10, 5, 3, 1, 0]) {
    const existing = await prisma.alertRule.findFirst({ where: { organizationId: organization.id, documentTypeId: type.id, companyId: null, vehicleId: null, advanceDays, channel: "INTERNAL" } });
    if (!existing) await prisma.alertRule.create({ data: { organizationId: organization.id, documentTypeId: type.id, advanceDays, channel: "INTERNAL" } });
  }
  const owner = await prisma.owner.upsert({ where: { organizationId_identificationNumber: { organizationId: organization.id, identificationNumber: "DEMO-900001" } }, update: {}, create: { organizationId: organization.id, personType: "LEGAL", identificationType: "NIT", identificationNumber: "DEMO-900001", displayName: "Transportes Ejemplo S.A.S.", city: "Manizales", notes: "Registro ficticio del entorno de demostración." } });
  const company = await prisma.transportCompany.upsert({ where: { organizationId_nit: { organizationId: organization.id, nit: "DEMO-800001" } }, update: {}, create: { organizationId: organization.id, nit: "DEMO-800001", businessName: "Operadora Demo Manizales", modality: "Demostración" } });
  const plates = ["DMO101", "DMO202", "DMO303", "DMO404", "DMO505", "DMO606"];
  for (let index = 0; index < categories.length; index++) {
    let vehicle = await prisma.vehicle.findFirst({ where: { organizationId: organization.id, plate: plates[index] } });
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({ data: { organizationId: organization.id, categoryId: categories[index].id, plate: plates[index], brand: index === 3 ? "Kia" : "Marca demostración", line: `Línea ${index + 1}`, model: "Demo", year: 2024, responsibleName: admin.name, notes: "Vehículo ficticio. No corresponde a información real." } });
      await prisma.vehicleOwner.create({ data: { vehicleId: vehicle.id, ownerId: owner.id, startsAt: parseCivilDate("2026-01-01")! } });
      await prisma.vehicleAffiliation.create({ data: { vehicleId: vehicle.id, companyId: company.id, startsAt: parseCivilDate("2026-01-01")! } });
    }
    const existingDoc = await prisma.document.findFirst({ where: { vehicleId: vehicle.id, documentTypeId: types[0].id } });
    if (!existingDoc) {
      const expires = addCivilDays(bogotaToday(), [60, 30, 17, 5, 1, -3][index]);
      const document = await prisma.document.create({ data: { organizationId: organization.id, vehicleId: vehicle.id, documentTypeId: types[0].id, responsibleUserId: admin.id, number: `DEMO-SOAT-${index + 1}`, issuer: "Aseguradora ficticia", issuedAt: parseCivilDate("2026-01-01"), validFrom: parseCivilDate("2026-01-01"), expiresAt: expires, verificationStatus: "VERIFIED", verifiedAt: new Date(), notes: "Documento ficticio para demostración." } });
      await prisma.documentVersion.create({ data: { documentId: document.id, version: 1, number: document.number, issuer: document.issuer, issuedAt: document.issuedAt, validFrom: document.validFrom, expiresAt: document.expiresAt, verificationStatus: document.verificationStatus, notes: document.notes, createdById: admin.id } });
    }
  }
  console.log(`Datos demo creados. Organización: ${organizationCode}. Usuario: ${email}`);
}

main().finally(() => prisma.$disconnect());
