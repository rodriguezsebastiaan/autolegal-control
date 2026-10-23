export type DemoVehicleStatus = "ACTIVE" | "MAINTENANCE";

export type DemoVehicle = {
  plate: string;
  categoryCode: string;
  internalNumber: string;
  brand: string;
  line: string;
  year: number;
  color: string;
  status: DemoVehicleStatus;
  ownerId: string;
  driverId: string | null;
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

export type DemoOwner = {
  id: string;
  type: "Persona natural" | "Persona jurídica";
  identification: string;
  name: string;
  phone: string;
  city: string;
};

export type DemoDriver = {
  id: string;
  name: string;
  identification: string;
  license: string;
  category: string;
  issuedAt: string;
  expiresAt: string;
  vehicle: string | null;
};

export type DemoRenewal = {
  id: string;
  plate: string;
  document: string;
  status: "PENDING" | "IN_PROGRESS" | "AWAITING_PAYMENT" | "COMPLETED";
  step: string;
  dueAt: string;
  responsible: string;
};

export type DemoCategory = {
  name: string;
  code: string;
  description: string;
};

export type DemoWorkspace = {
  vehicles: DemoVehicle[];
  documents: DemoDocument[];
  owners: DemoOwner[];
  drivers: DemoDriver[];
  renewals: DemoRenewal[];
};
