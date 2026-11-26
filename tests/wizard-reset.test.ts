import { describe, it, expect, beforeEach } from "vitest";
import { createDraft, type WizardDraft } from "@/components/forge/types";

function simulateUpdate(draft: WizardDraft, patch: Partial<WizardDraft>): WizardDraft {
  const next = { ...draft, ...patch };

  if ("profile" in patch && patch.profile !== draft.profile) {
    const fresh = createDraft(patch.profile!);
    fresh.step = draft.step;
    return fresh;
  }

  const RESETTING_KEYS: Array<keyof WizardDraft> = [
    "firstName", "lastName1", "lastName2", "nickname",
    "origin", "character", "remate", "combinationId", "style", "profile",
  ];

  const touchesIdentity = Object.keys(patch).some((key) =>
    RESETTING_KEYS.includes(key as keyof WizardDraft),
  );
  if (touchesIdentity) {
    next.proposals = [];
    next.selectedProposalId = null;
  }
  return next;
}

describe("Wizard reset on profile change", () => {
  let draft: WizardDraft;

  beforeEach(() => {
    draft = createDraft("novillero");
    draft.firstName = "Joaquín";
    draft.lastName1 = "García";
    draft.nickname = "El Sella";
    draft.combinationId = "JG";
    draft.style = "monograma";
    draft.proposals = [
      {
        id: "p1",
        blueprint: {
          combo: "JG",
          style: "monograma",
          fontFamily: "cinzel",
          layout: "interlocked",
          frame: "none",
          ornament: "none",
          strokeWidth: 10,
          rotationDeg: 0,
          lore: "Monograma clásico con iniciales entrelazadas.",
        },
        previewUrl: "/api/preview?d=p1",
        scores: { legibility: 80, balance: 75, forgeability: 90 },
        explanation: "Propuesta de monograma con trazo sobrio.",
      },
    ];
    draft.selectedProposalId = "p1";
    draft.step = 3;
  });

  it("clears all data when switching from novillero to ganaderia", () => {
    const result = simulateUpdate(draft, { profile: "ganaderia" });
    expect(result.profile).toBe("ganaderia");
    expect(result.firstName).toBe("");
    expect(result.lastName1).toBe("");
    expect(result.nickname).toBe("");
    expect(result.combinationId).toBeNull();
    expect(result.proposals).toHaveLength(0);
    expect(result.selectedProposalId).toBeNull();
    expect(result.style).toBe("tradicional");
  });

  it("clears all data when switching from ganaderia to particular", () => {
    draft = createDraft("ganaderia");
    draft.firstName = "Domecq";
    draft.lastName1 = "Solís";
    draft.combinationId = "DS";
    draft.proposals = [
      {
        id: "p2",
        blueprint: {
          combo: "DS",
          style: "tradicional",
          fontFamily: "cinzel",
          layout: "stacked",
          frame: "circle",
          ornament: "cross",
          strokeWidth: 10,
          rotationDeg: 0,
          lore: "Hierro tradicional de ganadería.",
        },
        previewUrl: "/api/preview?d=p2",
        scores: { legibility: 85, balance: 80, forgeability: 95 },
        explanation: "Propuesta de hierro tradicional.",
      },
    ];
    draft.selectedProposalId = "p2";

    const result = simulateUpdate(draft, { profile: "particular" });
    expect(result.profile).toBe("particular");
    expect(result.firstName).toBe("");
    expect(result.combinationId).toBeNull();
    expect(result.proposals).toHaveLength(0);
  });

  it("preserves the current step number on profile change", () => {
    draft.step = 3;
    const result = simulateUpdate(draft, { profile: "ganaderia" });
    expect(result.step).toBe(3);
  });

  it("clears proposals when firstName changes without profile change", () => {
    const result = simulateUpdate(draft, { firstName: "Antonio" });
    expect(result.firstName).toBe("Antonio");
    expect(result.proposals).toHaveLength(0);
    expect(result.selectedProposalId).toBeNull();
  });

  it("createDraft returns a clean default state", () => {
    const fresh = createDraft("novillero");
    expect(fresh.step).toBe(1);
    expect(fresh.firstName).toBe("");
    expect(fresh.lastName1).toBe("");
    expect(fresh.nickname).toBe("");
    expect(fresh.combinationId).toBeNull();
    expect(fresh.proposals).toHaveLength(0);
    expect(fresh.selectedProposalId).toBeNull();
    expect(fresh.email).toBe("");
  });
});
