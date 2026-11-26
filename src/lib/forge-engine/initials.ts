import type { InitialsCombination } from "@/types/forge";

const NBSP_SENTINEL = "\u0001";

export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[nN]\u0303/g, NBSP_SENTINEL)
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0001/g, "Ñ")
    .replace(/[^A-ZÑ\s'\u2019\-.]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function normalizeInitials(value: string): string {
  return normalizeName(value).replace(/[^A-ZÑ]/g, "").slice(0, 3);
}

export function firstLetter(value: string): string {
  const normalized = normalizeName(value);
  const match = normalized.match(/[A-ZÑ]/);
  return match ? match[0] : "";
}

interface NameParts {
  firstName: string;
  lastName1: string;
  lastName2?: string;
}

export function buildInitialCombinations({ firstName, lastName1, lastName2 }: NameParts): InitialsCombination[] {
  const nameInitial = firstLetter(firstName);
  const firstSurnameInitial = firstLetter(lastName1);
  const secondSurnameInitial = firstLetter(lastName2 ?? "");

  const candidates: InitialsCombination[] = [];
  const seen = new Set<string>();

  const push = (combination: InitialsCombination) => {
    const key = combination.letters.join("");
    if (!key || seen.has(key)) return;
    if (combination.kind !== "monograma" && key.length < 2) return;
    seen.add(key);
    candidates.push(combination);
  };

  if (nameInitial && firstSurnameInitial) {
    push({
      id: `dos-${nameInitial}${firstSurnameInitial}`,
      letters: [nameInitial, firstSurnameInitial],
      label: `${nameInitial}${firstSurnameInitial}`,
      kind: "dos",
      primary: nameInitial,
      secondary: firstSurnameInitial,
    });
  }

  if (firstSurnameInitial && secondSurnameInitial) {
    push({
      id: `dos-${firstSurnameInitial}${secondSurnameInitial}`,
      letters: [firstSurnameInitial, secondSurnameInitial],
      label: `${firstSurnameInitial}${secondSurnameInitial}`,
      kind: "dos",
      primary: firstSurnameInitial,
      secondary: secondSurnameInitial,
    });
  }

  if (nameInitial && secondSurnameInitial) {
    push({
      id: `dos-${nameInitial}${secondSurnameInitial}`,
      letters: [nameInitial, secondSurnameInitial],
      label: `${nameInitial}${secondSurnameInitial}`,
      kind: "dos",
      primary: nameInitial,
      secondary: secondSurnameInitial,
    });
  }

  if (nameInitial && firstSurnameInitial && secondSurnameInitial) {
    push({
      id: `tres-${nameInitial}${firstSurnameInitial}${secondSurnameInitial}`,
      letters: [nameInitial, firstSurnameInitial, secondSurnameInitial],
      label: `${nameInitial}${firstSurnameInitial}${secondSurnameInitial}`,
      kind: "tres",
      primary: nameInitial,
      secondary: `${firstSurnameInitial}${secondSurnameInitial}`,
    });
  }

  if (nameInitial) {
    const secondary = firstSurnameInitial || secondSurnameInitial;
    push({
      id: `mono-${nameInitial}${secondary}`,
      letters: [nameInitial],
      label: nameInitial,
      kind: "monograma",
      primary: nameInitial,
      secondary: secondary || undefined,
    });
  }

  return candidates;
}

export function combinationToText(combination: InitialsCombination): string {
  return combination.letters.join("");
}

export function safeCombinationForRequest(value: string): string {
  const cleaned = normalizeInitials(value);
  return cleaned.length >= 2 ? cleaned : cleaned.padEnd(2, cleaned);
}
