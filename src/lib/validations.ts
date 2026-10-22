import { z } from "zod";
import { normalizePlate } from "./utils";
import { isCivilDate } from "./dates";

const optionalText = z.string().trim().transform((value) => value || undefined).optional();
const optionalCivilDate = z.string().trim().refine((value) => !value || isCivilDate(value), "Ingresa una fecha válida").transform((value) => value || undefined).optional();

export const loginSchema = z.object({
  organizationCode: z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/, "Ingresa el código de organización"),
  email: z.string().trim().email("Ingresa un correo válido").toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const vehicleSchema = z.object({
  plate: z
    .string()
    .transform(normalizePlate)
    .refine((plate) => /^[A-Z]{3}[0-9]{3}$/.test(plate) || /^[A-Z]{3}[0-9]{2}[A-Z]$/.test(plate), {
      message: "La placa debe tener un formato colombiano válido (ABC123 o ABC12D)",
    }),
  categoryId: z.string().cuid("Selecciona una categoría"),
  ownerId: optionalText,
  companyId: optionalText,
  internalNumber: optionalText,
  vehicleClass: optionalText,
  brand: z.string().trim().min(2, "La marca es obligatoria").max(80),
  line: z.string().trim().min(1, "La línea es obligatoria").max(80),
  model: optionalText,
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional().or(z.literal("")),
  color: optionalText,
  vin: optionalText,
  chassisNumber: optionalText,
  engineNumber: optionalText,
  fuelType: optionalText,
  passengerCapacity: z.coerce.number().int().positive().optional().or(z.literal("")),
  registrationDate: optionalCivilDate,
  transitAuthority: optionalText,
  serviceType: optionalText,
  transportModality: optionalText,
  operationRadius: optionalText,
  responsibleName: optionalText,
  notes: optionalText,
});

export const documentSchema = z
  .object({
    vehicleId: z.string().cuid("Selecciona un vehículo"),
    documentTypeId: z.string().cuid("Selecciona un tipo de documento"),
    number: optionalText,
    issuer: optionalText,
    issuedAt: optionalCivilDate,
    validFrom: optionalCivilDate,
    expiresAt: optionalCivilDate,
    responsibleUserId: optionalText,
    notes: optionalText,
    verificationStatus: z.enum(["PENDING", "VERIFIED"]),
  })
  .refine(
    (data) => !data.issuedAt || !data.expiresAt || data.expiresAt >= data.issuedAt,
    { message: "El vencimiento no puede ser anterior a la expedición", path: ["expiresAt"] },
  );

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: optionalText,
});

export const ownerSchema = z.object({
  personType: z.enum(["NATURAL", "LEGAL"]),
  identificationType: z.string().trim().min(1).max(20),
  identificationNumber: z.string().trim().min(4).max(30),
  displayName: z.string().trim().min(3).max(160),
  phone: optionalText,
  email: z.string().trim().email().optional().or(z.literal("")),
  city: optionalText,
});

export const companySchema = z.object({
  nit: z.string().trim().min(5).max(30),
  businessName: z.string().trim().min(3).max(160),
  contactName: optionalText,
  phone: optionalText,
  email: z.string().trim().email().optional().or(z.literal("")),
  modality: optionalText,
});

export const driverSchema = z.object({
  identificationType: z.string().trim().min(1),
  identificationNumber: z.string().trim().min(4).max(30),
  fullName: z.string().trim().min(3).max(160),
  phone: optionalText,
  email: z.string().trim().email().optional().or(z.literal("")),
  licenseNumber: optionalText,
  licenseCategory: optionalText,
  licenseExpiresAt: optionalCivilDate,
});
