import { describe, expect, it } from "vitest";
import { compileForge, extractPathData, svgHasTextTag } from "@/lib/forge-engine/compiler";
import { loadFont } from "@/lib/forge-engine/fonts";
import { buildDeterministicBlueprints } from "@/lib/forge-engine/presets";
import { STYLE_TYPES, initialsCombinationSchema, userProfileSchema, type BrandBlueprint } from "@/types/forge";

const profile = userProfileSchema.parse({
  profile: "ganaderia",
  firstName: "Joaquín",
  lastName1: "García",
  lastName2: "Moreno",
  origin: "Salamanca",
  character: "senorial",
  remate: "cruz-forja",
});

const INITIAL_SETS = [["G"], ["A", "P"], ["C", "R"], ["J", "M", "R"]];

function combinationFor(letters: string[]) {
  return initialsCombinationSchema.parse({
    id: `test-${letters.join("")}`,
    letters,
    label: letters.join(""),
    kind: letters.length === 1 ? "monograma" : letters.length === 2 ? "dos" : "tres",
    primary: letters[0],
    secondary: letters[1],
  });
}

function subpathCount(pathData: string): number {
  return (pathData.match(/M/g) ?? []).length;
}

function glyphContourCount(letter: string): number {
  const font = loadFont("cinzel");
  const glyph = font.charToGlyph(letter);
  const data = glyph.getPath(0, 0, 100).toPathData(2);
  return (data.match(/[Mm]/g) ?? []).length;
}

function bareBlueprint(letter: string): BrandBlueprint {
  return {
    combo: letter,
    style: "tradicional",
    fontFamily: "cinzel",
    layout: "stacked",
    frame: "none",
    ornament: "none",
    strokeWidth: 9,
    rotationDeg: 0,
    lore: "Inicial aislada para comprobar la apertura de sus contornos internos.",
  };
}

describe("geometría forjada", () => {
  for (const letters of INITIAL_SETS) {
    for (const style of STYLE_TYPES) {
      it(`compone ${letters.join("")} en ${style} sin texto ni trazos`, () => {
        const combination = combinationFor(letters);
        const blueprint = buildDeterministicBlueprints(profile, combination, style)[0];
        const compiled = compileForge(blueprint, combination);
        const pathData = extractPathData(compiled.svg);

        expect(svgHasTextTag(compiled.svg)).toBe(false);
        expect(compiled.svg).not.toContain("stroke=");
        expect(compiled.svg).toContain('fill-rule="evenodd"');
        expect(compiled.svg).toContain("forge-metal");
        expect(pathData).not.toContain("NaN");
        expect(compiled.minStroke).toBeGreaterThanOrEqual(6);
        expect(subpathCount(pathData)).toBeGreaterThanOrEqual(letters.length);
      });
    }
  }

  it("mantiene contornos independientes en A y P para no cerrar los huecos", () => {
    const combination = combinationFor(["A", "P"]);
    const blueprint = buildDeterministicBlueprints(profile, combination, "tradicional")[0];
    const compiled = compileForge(blueprint, combination);
    expect(subpathCount(compiled.pathData)).toBeGreaterThanOrEqual(4);
  });

  it("genera marcos huecos con dos contornos por cerco", () => {
    const combination = combinationFor(["A", "P"]);
    const blueprints = buildDeterministicBlueprints(profile, combination, "monograma");
    const ringBlueprint = blueprints.find((blueprint) => blueprint.frame === "circle");
    expect(ringBlueprint).toBeDefined();
    const compiled = compileForge(ringBlueprint!, combination);
    expect(subpathCount(compiled.pathData)).toBeGreaterThanOrEqual(5);
  });

  for (const letter of ["A", "P", "R", "G"]) {
    it(`mantiene abiertos los huecos internos de ${letter}`, () => {
      const combination = combinationFor([letter]);
      const compiled = compileForge(bareBlueprint(letter), combination);
      expect(compiled.geometry.contours).toBe(glyphContourCount(letter));
      if (letter === "G") {
        expect(compiled.geometry.contours).toBe(1);
      } else {
        expect(compiled.geometry.contours).toBeGreaterThanOrEqual(2);
      }
    });
  }

  it("forja el escudo heráldico con dos contornos huecos", () => {
    const combination = combinationFor(["J", "M", "R"]);
    const blueprint = buildDeterministicBlueprints(profile, combination, "heraldico")[0];
    const compiled = compileForge(blueprint, combination);
    expect(compiled.geometry.frame).not.toBeNull();
    expect(compiled.geometry.frameContours).toBeGreaterThanOrEqual(2);
    expect(compiled.quality?.selfIntersections).toBe(0);
    expect(compiled.quality?.containmentErrors).toBe(0);
  });

  it("conecta la calidad real del offset con la métrica Forjable", () => {
    const combination = combinationFor(["A", "P"]);
    let analyzed = 0;
    for (const style of STYLE_TYPES) {
      for (let index = 0; index < 3; index += 1) {
        const blueprint = buildDeterministicBlueprints(profile, combination, style)[index];
        const compiled = compileForge(blueprint, combination);
        expect(compiled.scores.forgeability).toBeGreaterThanOrEqual(60);
        expect(compiled.scores.forgeability).toBeLessThanOrEqual(99);
        if (compiled.quality) {
          expect(compiled.quality.selfIntersections).toBe(0);
          analyzed += 1;
        }
      }
    }
    expect(analyzed).toBeGreaterThan(6);
  });

  it("no monta coronas, cruces ni estrellas sobre las letras", () => {
    const combination = combinationFor(["A", "P", "R"]);
    const mounter = ["crown", "cross", "star"];
    let checked = 0;
    for (const style of STYLE_TYPES) {
      for (let index = 0; index < 3; index += 1) {
        const blueprint = buildDeterministicBlueprints(profile, combination, style)[index];
        if (!mounter.includes(blueprint.ornament)) continue;
        const compiled = compileForge(blueprint, combination);
        expect(compiled.geometry.ornament).not.toBeNull();
        expect(compiled.geometry.ornament!.bottom).toBeLessThanOrEqual(compiled.geometry.glyph.top - 1);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(4);
  });

  it("no devuelve propuestas idénticas entre estilos", () => {
    const combination = combinationFor(["C", "R"]);
    const signatures = STYLE_TYPES.map((style) => {
      const blueprint = buildDeterministicBlueprints(profile, combination, style)[0];
      return compileForge(blueprint, combination).pathData.slice(0, 120);
    });
    expect(new Set(signatures).size).toBe(STYLE_TYPES.length);
  });
});
