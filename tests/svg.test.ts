import { describe, expect, it } from "vitest";
import { compileForge, extractPathData, svgHasTextTag } from "@/lib/forge-engine/compiler";
import { buildDeterministicBlueprints } from "@/lib/forge-engine/presets";
import { initialsCombinationSchema, userProfileSchema, STYLE_TYPES } from "@/types/forge";

const profile = userProfileSchema.parse({
  profile: "ganaderia",
  firstName: "Joaquín",
  lastName1: "García",
  lastName2: "Moreno",
  origin: "Salamanca",
  character: "senorial",
  remate: "corona",
});

const combination = initialsCombinationSchema.parse({
  id: "dos-JG",
  letters: ["J", "G"],
  label: "JG",
  kind: "dos",
  primary: "J",
  secondary: "G",
});

describe("compilador vectorial", () => {
  for (const style of STYLE_TYPES) {
    it(`compila ${style} sin etiquetas de texto`, () => {
      const blueprints = buildDeterministicBlueprints(profile, combination, style);
      const compiled = compileForge(blueprints[0], combination);
      expect(compiled.svg.startsWith("<svg")).toBe(true);
      expect(svgHasTextTag(compiled.svg)).toBe(false);
      expect(compiled.svg).not.toContain("<image");
      expect(compiled.svg).toContain('viewBox="0 0 300 300"');
      expect(compiled.minStroke).toBeGreaterThanOrEqual(6);
      const pathData = extractPathData(compiled.svg);
      expect(pathData.length).toBeGreaterThan(200);
      expect(pathData).not.toContain("NaN");
      expect(compiled.scores.legibility).toBeGreaterThan(60);
      expect(compiled.scores.forgeability).toBeGreaterThan(60);
    });
  }

  it("produce tres propuestas distintas por estilo", () => {
    const blueprints = buildDeterministicBlueprints(profile, combination, "heraldico");
    expect(blueprints).toHaveLength(3);
    const layouts = new Set(blueprints.map((blueprint) => `${blueprint.layout}-${blueprint.frame}-${blueprint.ornament}`));
    expect(layouts.size).toBe(3);
  });

  it("no devuelve trazados vacíos con una sola inicial", () => {
    const single = initialsCombinationSchema.parse({
      id: "mono-M",
      letters: ["M", "M"],
      label: "M",
      kind: "monograma",
      primary: "M",
      secondary: "M",
    });
    const blueprint = buildDeterministicBlueprints(profile, single, "monograma")[0];
    const compiled = compileForge(blueprint, single);
    expect(extractPathData(compiled.svg).length).toBeGreaterThan(200);
  });
});
