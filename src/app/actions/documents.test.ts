import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
  vehicleFindFirst: vi.fn(),
  typeFindFirst: vi.fn(),
  userFindFirst: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/lib/audit", () => ({ audit: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    vehicle: { findFirst: mocks.vehicleFindFirst },
    documentType: { findFirst: mocks.typeFindFirst },
    user: { findFirst: mocks.userFindFirst },
    $transaction: mocks.transaction,
  },
}));

import { createDocumentAction } from "./documents";

const organizationA = "org-a";
const organizationB = "org-b";
const vehicleId = "cm12345678901234567890123";
const documentTypeId = "cm22345678901234567890123";
const responsibleId = "cm32345678901234567890123";

function documentForm(responsible = false) {
  const form = new FormData();
  form.set("vehicleId", vehicleId);
  form.set("documentTypeId", documentTypeId);
  form.set("verificationStatus", "PENDING");
  if (responsible) form.set("responsibleUserId", responsibleId);
  return form;
}

describe("createDocumentAction: aislamiento multiempresa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRole.mockResolvedValue({ id: "user-a", organizationId: organizationA });
    mocks.typeFindFirst.mockResolvedValue({ id: documentTypeId, organizationId: organizationA, active: true, hasExpiration: false });
    mocks.userFindFirst.mockResolvedValue(null);
  });

  it("rechaza un vehículo de otra organización antes de abrir la transacción", async () => {
    mocks.vehicleFindFirst.mockResolvedValue({ id: vehicleId, organizationId: organizationB, status: "ACTIVE" });

    const result = await createDocumentAction({}, documentForm());

    expect(result.error).toMatch(/vehículo.*no están disponibles/i);
    expect(mocks.vehicleFindFirst).toHaveBeenCalledWith({ where: { id: vehicleId, organizationId: organizationA, status: { not: "INACTIVE" } } });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rechaza un responsable de otra organización", async () => {
    mocks.vehicleFindFirst.mockResolvedValue({ id: vehicleId, organizationId: organizationA, status: "ACTIVE" });
    mocks.userFindFirst.mockResolvedValue({ id: responsibleId, organizationId: organizationB, active: true });

    const result = await createDocumentAction({}, documentForm(true));

    expect(result.error).toMatch(/responsable.*no está disponible/i);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
