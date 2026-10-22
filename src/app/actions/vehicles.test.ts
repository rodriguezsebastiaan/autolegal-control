import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
  categoryFindFirst: vi.fn(),
  ownerFindFirst: vi.fn(),
  companyFindFirst: vi.fn(),
  vehicleFindFirst: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/lib/audit", () => ({ audit: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    vehicleCategory: { findFirst: mocks.categoryFindFirst },
    owner: { findFirst: mocks.ownerFindFirst },
    transportCompany: { findFirst: mocks.companyFindFirst },
    vehicle: { findFirst: mocks.vehicleFindFirst },
    $transaction: mocks.transaction,
  },
}));

import { updateVehicleAction } from "./vehicles";

const organizationA = "org-a";
const organizationB = "org-b";
const vehicleId = "cm12345678901234567890123";
const categoryId = "cm22345678901234567890123";

function vehicleForm() {
  const form = new FormData();
  form.set("plate", "ABC123");
  form.set("categoryId", categoryId);
  form.set("brand", "Kia");
  form.set("line", "Picanto");
  return form;
}

describe("updateVehicleAction: aislamiento multiempresa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRole.mockResolvedValue({ id: "user-a", organizationId: organizationA });
    mocks.ownerFindFirst.mockResolvedValue(null);
    mocks.companyFindFirst.mockResolvedValue(null);
  });

  it("no modifica un vehículo de la organización B aunque el repositorio lo devuelva", async () => {
    mocks.vehicleFindFirst
      .mockResolvedValueOnce({ id: vehicleId, organizationId: organizationB })
      .mockResolvedValueOnce(null);
    mocks.categoryFindFirst.mockResolvedValue({ id: categoryId, organizationId: organizationA, active: true });

    const result = await updateVehicleAction(vehicleId, {}, vehicleForm());

    expect(result.error).toMatch(/no pertenece a tu organización/i);
    expect(mocks.vehicleFindFirst).toHaveBeenNthCalledWith(1, { where: { id: vehicleId, organizationId: organizationA } });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("no modifica cuando la categoría pertenece a la organización B", async () => {
    mocks.vehicleFindFirst
      .mockResolvedValueOnce({ id: vehicleId, organizationId: organizationA })
      .mockResolvedValueOnce(null);
    mocks.categoryFindFirst.mockResolvedValue({ id: categoryId, organizationId: organizationB, active: true });

    const result = await updateVehicleAction(vehicleId, {}, vehicleForm());

    expect(result.error).toMatch(/categoría.*no está disponible/i);
    expect(mocks.categoryFindFirst).toHaveBeenCalledWith({ where: { id: categoryId, organizationId: organizationA, active: true } });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
