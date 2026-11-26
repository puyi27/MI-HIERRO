import { describe, expect, it } from "vitest";
import { buildInitialCombinations, normalizeInitials, normalizeName } from "@/lib/forge-engine/initials";

describe("normalización de nombres", () => {
  it("elimina acentos y pasa a mayúsculas", () => {
    expect(normalizeName("  José  María ")).toBe("JOSE MARIA");
  });

  it("conserva la eñe", () => {
    expect(normalizeName("Íñigo")).toBe("IÑIGO");
    expect(normalizeName("Muñoz")).toBe("MUÑOZ");
  });

  it("elimina dígitos y símbolos sin romper apóstrofes", () => {
    expect(normalizeName("O'Connor 2")).toBe("O'CONNOR");
  });

  it("limita las iniciales a letras", () => {
    expect(normalizeInitials("j.g.-m")).toBe("JGM");
  });
});

describe("combinaciones de iniciales", () => {
  const combinations = buildInitialCombinations({
    firstName: "Joaquín",
    lastName1: "García",
    lastName2: "Moreno",
  });

  it("genera combinaciones sin duplicados", () => {
    const keys = combinations.map((combination) => combination.letters.join(""));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("incluye dos letras, tres letras y monograma", () => {
    const kinds = new Set(combinations.map((combination) => combination.kind));
    expect(kinds.has("dos")).toBe(true);
    expect(kinds.has("tres")).toBe(true);
    expect(kinds.has("monograma")).toBe(true);
    expect(combinations.some((combination) => combination.label === "JGM")).toBe(true);
    expect(combinations.some((combination) => combination.label === "JG")).toBe(true);
  });

  it("elimina duplicados cuando las iniciales coinciden", () => {
    const repeated = buildInitialCombinations({ firstName: "Ana", lastName1: "Alba", lastName2: "Arias" });
    const keys = repeated.map((combination) => combination.letters.join(""));
    expect(new Set(keys).size).toBe(keys.length);
    expect(repeated.filter((combination) => combination.kind !== "monograma").every((combination) => combination.letters.length >= 2)).toBe(true);
    expect(repeated.some((combination) => combination.kind === "monograma")).toBe(true);
  });

  it("funciona sin segundo apellido", () => {
    const single = buildInitialCombinations({ firstName: "Ana", lastName1: "Ruiz" });
    expect(single.some((combination) => combination.label === "AR")).toBe(true);
    expect(single.filter((combination) => combination.kind !== "monograma").every((combination) => combination.letters.length >= 2)).toBe(true);
  });

  it("no genera combinaciones si faltan datos", () => {
    const empty = buildInitialCombinations({ firstName: "", lastName1: "" });
    expect(empty).toHaveLength(0);
  });
});
