"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoWorkspace } from "@/lib/demo-data";
import type { DemoDocument, DemoDriver, DemoOwner, DemoRenewal, DemoVehicle, DemoVehicleStatus, DemoWorkspace } from "@/lib/demo-types";
import { bogotaToday } from "@/lib/dates";

const STORAGE_KEY = "autolegal-control-evaluacion-v2";

type DemoStore = DemoWorkspace & {
  hydrated: boolean;
  addVehicle: (vehicle: DemoVehicle, document: Omit<DemoDocument, "id">) => void;
  updateVehicleStatus: (plate: string, status: DemoVehicleStatus, note: string) => void;
  addDocument: (document: Omit<DemoDocument, "id">) => void;
  addOwner: (owner: Omit<DemoOwner, "id">) => void;
  updateOwner: (owner: DemoOwner) => void;
  removeOwner: (id: string) => boolean;
  addDriver: (driver: Omit<DemoDriver, "id">) => void;
  updateDriver: (driver: DemoDriver) => void;
  createRenewal: (document: Omit<DemoDocument, "id">, renewal: Omit<DemoRenewal, "id">) => void;
  reviewDocument: (documentId: string, decision: "APPROVE" | "REJECT", reviewer: string, reason?: string) => boolean;
  resetDemo: () => void;
};

const DemoStoreContext = createContext<DemoStore | null>(null);

function cloneSeed(): DemoWorkspace {
  return JSON.parse(JSON.stringify(demoWorkspace)) as DemoWorkspace;
}

function isWorkspace(value: unknown): value is DemoWorkspace {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoWorkspace>;
  return [candidate.vehicles, candidate.documents, candidate.owners, candidate.drivers, candidate.renewals]
    .every(Array.isArray);
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<DemoWorkspace>(cloneSeed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let restored: DemoWorkspace | null = null;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isWorkspace(parsed)) restored = parsed;
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    const timer = window.setTimeout(() => {
      if (restored) setWorkspace(restored);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [hydrated, workspace]);

  const value = useMemo<DemoStore>(() => ({
    ...workspace,
    hydrated,
    addVehicle(vehicle, document) {
      setWorkspace((current) => ({
        ...current,
        vehicles: [...current.vehicles, vehicle],
        documents: [...current.documents, { ...document, id: nextId("local-doc") }],
        drivers: current.drivers.map((driver) => driver.id === vehicle.driverId ? { ...driver, vehicle: vehicle.plate } : driver),
      }));
    },
    updateVehicleStatus(plate, status, note) {
      setWorkspace((current) => ({
        ...current,
        vehicles: current.vehicles.map((vehicle) => vehicle.plate === plate
          ? { ...vehicle, status, statusNote: note, statusUpdatedAt: bogotaToday() }
          : vehicle),
      }));
    },
    addDocument(document) {
      setWorkspace((current) => ({ ...current, documents: [...current.documents, { ...document, id: nextId("local-doc") }] }));
    },
    addOwner(owner) {
      setWorkspace((current) => ({ ...current, owners: [...current.owners, { ...owner, id: nextId("local-owner") }] }));
    },
    updateOwner(owner) {
      setWorkspace((current) => ({ ...current, owners: current.owners.map((item) => item.id === owner.id ? owner : item) }));
    },
    removeOwner(id) {
      if (workspace.vehicles.some((vehicle) => vehicle.ownerId === id)) return false;
      setWorkspace((current) => ({ ...current, owners: current.owners.filter((owner) => owner.id !== id) }));
      return true;
    },
    addDriver(driver) {
      setWorkspace((current) => ({ ...current, drivers: [...current.drivers, { ...driver, id: nextId("local-driver") }] }));
    },
    updateDriver(driver) {
      setWorkspace((current) => ({ ...current, drivers: current.drivers.map((item) => item.id === driver.id ? driver : item) }));
    },
    createRenewal(document, renewal) {
      const documentId = nextId("local-doc");
      setWorkspace((current) => ({
        ...current,
        documents: [...current.documents, { ...document, id: documentId, isCurrent: false }],
        renewals: [...current.renewals, { ...renewal, id: nextId("local-renewal"), newDocumentId: documentId, sourceDocumentId: document.replacesDocumentId }],
      }));
    },
    reviewDocument(documentId, decision, reviewer, reason) {
      const candidate = workspace.documents.find((document) => document.id === documentId);
      const reviewerName = reviewer.trim();
      const rejectionReason = reason?.trim();
      if (!candidate || candidate.verificationStatus !== "PENDING" || !reviewerName || reviewerName.toLowerCase() === candidate.responsible.trim().toLowerCase() || (decision === "REJECT" && !rejectionReason)) return false;
      setWorkspace((current) => ({
        ...current,
        documents: current.documents.map((document) => {
          if (document.id === documentId) return {
            ...document,
            verificationStatus: decision === "APPROVE" ? "VERIFIED" : "REJECTED",
            isCurrent: decision === "APPROVE",
            reviewedBy: reviewerName,
            rejectionReason: decision === "REJECT" ? rejectionReason : undefined,
          };
          if (decision === "APPROVE" && document.plate === candidate.plate && document.type === candidate.type && document.isCurrent !== false) {
            return { ...document, isCurrent: false, processStatus: "NONE" };
          }
          return document;
        }),
        renewals: current.renewals.map((renewal) => renewal.newDocumentId === documentId ? {
          ...renewal,
          status: decision === "APPROVE" ? "COMPLETED" : "REJECTED",
          step: decision === "APPROVE" ? `Nueva vigencia aprobada por ${reviewerName}` : `Rechazada por ${reviewerName}: ${rejectionReason}`,
        } : renewal),
      }));
      return true;
    },
    resetDemo() {
      setWorkspace(cloneSeed());
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [hydrated, workspace]);

  return <DemoStoreContext.Provider value={value}><div data-demo-hydrated={hydrated ? "true" : "false"}>{children}</div></DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const store = useContext(DemoStoreContext);
  if (!store) throw new Error("useDemoStore debe usarse dentro de DemoProvider");
  return store;
}
