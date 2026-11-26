import type { InitialsCombination } from "@/types/forge";
import type { WizardDraft } from "@/components/forge/types";

interface StepInitialsProps {
  draft: WizardDraft;
  combinations: InitialsCombination[];
  selected: InitialsCombination | null;
  onSelect: (combination: InitialsCombination) => void;
}

const KIND_LABEL: Record<InitialsCombination["kind"], string> = {
  dos: "Dos letras",
  tres: "Tres letras",
  monograma: "Monograma",
};

export function StepInitials({ draft, combinations, selected, onSelect }: StepInitialsProps) {
  return (
    <div>
      <p className="eyebrow">Paso 02 · Combinaciones</p>
      <h1 className="mt-4 font-display text-3xl leading-tight text-forge-ivory sm:text-4xl">Tus iniciales, una sola marca</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forge-muted">
        Hemos normalizado tu nombre y apellidos, eliminando acentos y duplicados. Elige la combinación que quieres forjar:
        {""}
        <span className="text-forge-ivory"> {draft.firstName} {draft.lastName1}{draft.lastName2 ? ` ${draft.lastName2}` : ""}</span>.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {combinations.map((combination) => {
          const active = selected?.id === combination.id;
          return (
            <button
              key={combination.id}
              type="button"
              onClick={() => onSelect(combination)}
              aria-pressed={active}
              data-selected={active}
              className="card-select grain relative overflow-hidden px-6 py-8"
            >
              <span className="flex items-start justify-between">
                <span className="eyebrow-muted">{KIND_LABEL[combination.kind]}</span>
                <span className={`h-2 w-2 rounded-full ${active ? "bg-forge-bronze" : "bg-forge-line"}`} aria-hidden />
              </span>
              <span className="mt-6 block font-display text-5xl leading-none tracking-[0.08em] text-forge-ivory">
                {combination.label}
              </span>
              <span className="mt-4 block text-[0.68rem] uppercase tracking-[0.22em] text-forge-bronze">
                {combination.letters.join(" · ")}
              </span>
              <span className="mt-3 block text-xs leading-relaxed text-forge-muted">
                {combination.kind === "monograma"
                  ? "Inicial principal dominante con letra secundaria soldada."
                  : combination.kind === "tres"
                    ? "Tres letras en lectura continua, ideal para emblema cerrado."
                    : "Dos iniciales limpias, la lectura más directa en capote y portón."}
              </span>
            </button>
          );
        })}
      </div>

      {combinations.length === 0 ? (
        <p className="mt-8 border border-forge-line p-5 text-sm text-forge-muted">
          Necesitamos un nombre y un primer apellido válidos para proponer combinaciones. Vuelve al paso anterior y
          revisa los datos.
        </p>
      ) : null}

      {!draft.lastName2 ? (
        <p className="mt-6 text-xs leading-relaxed text-forge-muted">
          Si añades un segundo apellido en el paso anterior aparecerán combinaciones adicionales de tres letras.
        </p>
      ) : null}
    </div>
  );
}
