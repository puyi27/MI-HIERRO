import { describe, expect, it } from "vitest";
import { compileForge, extractPathData, svgHasTextTag } from "@/lib/forge-engine/compiler";
import { buildDeterministicBlueprints } from "@/lib/forge-engine/presets";
import {
  ARCHITECTURES,
  STYLE_TYPES,
  brandBlueprintV2Schema,
  initialsCombinationSchema,
  userProfileSchema,
} from "@/types/forge";

const profile = userProfileSchema.parse({
  profile: "ganaderia",
  firstName: "Joaquín",
  lastName1: "García",
  lastName2: "Moreno",
  origin: "Salamanca",
  character: "senorial",
  remate: "cruz-forja",
});

const DIFFICULT_COMBOS = [
  ["M"],
  ["A"],
  ["J", "P"],
  ["V", "M"],
  ["C", "R"],
  ["O", "C"],
  ["G", "R"],
  ["A", "G", "L"],
  ["J", "P", "D"],
  ["E", "M", "R"],
];

function makeCombo(letters: string[]) {
  return initialsCombinationSchema.parse({
    id: `v2-${letters.join("")}`,
    letters,
    label: letters.join(""),
    kind: letters.length === 1 ? "monograma" : letters.length === 2 ? "dos" : "tres",
    primary: letters[0],
    secondary: letters[1],
  });
}

describe("Motor de Forja v2 · 10 combinaciones difíciles", () => {
  for (const letters of DIFFICULT_COMBOS) {
    it(`forja ${letters.join("")} con 3 arquitecturas distintas, sin <text> y grosor >= 6`, () => {
      const combo = makeCombo(letters);
      const blueprints = buildDeterministicBlueprints(profile, combo, "tradicional");

      expect(blueprints).toHaveLength(3);
      const architectures = new Set(blueprints.map((bp) => bp.architecture));
      expect(architectures.size).toBe(3);

      const paths = new Set<string>();
      for (const bp of blueprints) {
        expect(brandBlueprintV2Schema.safeParse(bp).success).toBe(true);
        const compiled = compileForge(bp, combo);
        expect(svgHasTextTag(compiled.svg)).toBe(false);
        expect(compiled.svg).not.toContain("<image");
        expect(compiled.minStroke).toBeGreaterThanOrEqual(6);
        const d = extractPathData(compiled.svg);
        expect(d.length).toBeGreaterThan(100);
        expect(d).not.toContain("NaN");
        expect(d).not.toContain("Infinity");
        paths.add(d);
      }

      expect(paths.size).toBe(3);
    });
  }

  it("compila todas las 6 arquitecturas reales en todos los estilos", () => {
    const combo = makeCombo(["J", "P"]);
    const base = buildDeterministicBlueprints(profile, combo, "heraldico")[0];

    for (const arch of ARCHITECTURES) {
      const compiled = compileForge({ ...base, architecture: arch }, combo);
      expect(svgHasTextTag(compiled.svg)).toBe(false);
      expect(compiled.minStroke).toBeGreaterThanOrEqual(6);
      expect(compiled.pathData.length).toBeGreaterThan(100);
    }
  });

  it("mantiene diversidad real en los cuatro estilos", () => {
    const combo = makeCombo(["V", "M"]);
    for (const style of STYLE_TYPES) {
      const bps = buildDeterministicBlueprints(profile, combo, style);
      const archs = new Set(bps.map((b) => b.architecture));
      expect(archs.size).toBe(3);
    }
  });
});
