import { describe, expect, it } from "vitest";
import { documentReviewError } from "./document-workflow";

const document = { id: "document-a", organizationId: "org-a" };
const version = { documentId: document.id, createdById: "creator-a", verificationStatus: "PENDING" as const };

describe("separación de funciones documentales", () => {
  it.each(["ADMIN", "SUPERVISOR"] as const)("permite que un %s diferente revise", (role) => {
    expect(documentReviewError({ actor: { id: "reviewer-a", organizationId: "org-a", role: { code: role } }, document, version })).toBeNull();
  });

  it("impide que el creador apruebe o rechace su propia versión aunque sea administrador", () => {
    expect(documentReviewError({ actor: { id: "creator-a", organizationId: "org-a", role: { code: "ADMIN" } }, document, version })).toMatch(/no puedes revisar/i);
  });

  it.each(["DOCUMENT_MANAGER", "VIEWER"] as const)("rechaza el rol %s", (role) => {
    expect(documentReviewError({ actor: { id: "other-a", organizationId: "org-a", role: { code: role } }, document, version })).toMatch(/permisos/i);
  });

  it("rechaza documentos de otra organización", () => {
    expect(documentReviewError({ actor: { id: "reviewer-a", organizationId: "org-b", role: { code: "ADMIN" } }, document, version })).toMatch(/organización/i);
  });

  it("rechaza una versión sin creador auditable", () => {
    expect(documentReviewError({ actor: { id: "reviewer-a", organizationId: "org-a", role: { code: "ADMIN" } }, document, version: { ...version, createdById: null } })).toMatch(/regularización/i);
  });

  it("rechaza una versión que ya fue revisada", () => {
    expect(documentReviewError({ actor: { id: "reviewer-a", organizationId: "org-a", role: { code: "ADMIN" } }, document, version: { ...version, verificationStatus: "VERIFIED" } })).toMatch(/ya fue revisada/i);
  });
});
