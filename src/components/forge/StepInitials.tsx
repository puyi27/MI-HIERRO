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
      <p className="eyebrow">II. Combinaciones</p>
      <h1 className="mt-3 font-display text-3xl leading-tight text-forge-ink sm:text-4xl">Tus iniciales, una sola marca</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forge-graphite">
        Elige la combinación que quieres forjar para{" "}
        <span className="font-semibold text-forge-ink">
          {draft.firstName} {draft.lastName1}
          {draft.lastName2 ? ` ${draft.lastName2}` : ""}
        </span>
        {draft.nickname ? <span className="font-semibold text-forge-grana"> · «{draft.nickname}»</span> : null}.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {combinations.map((combination) => {
          const active = selected?.id === combination.id;
          return (
            <button
              key={combination.id}
              type="button"
              onClick={() => onSelect(combination)}
              aria-pressed={active}
              data-selected={active}
              className="card-select relative overflow-hidden px-6 py-7"
            >
              <span className="flex items-start justify-between">
                <span className="eyebrow-muted">{KIND_LABEL[combination.kind]}</span>
                <span className={`h-2 w-2 rounded-full ${active ? "bg-forge-grana" : "bg-forge-border"}`} aria-hidden />
              </span>
              <span className="mt-5 block font-display text-5xl leading-none tracking-[0.08em] text-forge-ink">
                {combination.label}
              </span>
              <span className="mt-4 block text-[0.68rem] uppercase tracking-[0.2em] text-forge-leather">
                {combination.letters.join(" · ")}
              </span>
              <span className="mt-3 block text-xs leading-relaxed text-forge-graphite">
                {combination.kind === "monograma"
                  ? "Inicial principal dominante con letra secundaria soldada."
                  : combination.kind === "tres"
                    ? "Tres letras en lectura continua para emblema cerrado."
                    : "Dos iniciales limpias, lectura directa en capote y portón."}
              </span>
            </button>
          );
        })}
      </div>

      {combinations.length === 0 ? (
        <p className="mt-8 border border-forge-border bg-forge-white p-5 text-sm text-forge-graphite">
          Necesitamos un nombre y un primer apellido válidos para proponer combinaciones.
        </p>
      ) : null}

      {!draft.lastName2 ? (
        <p className="mt-6 text-xs leading-relaxed text-forge-graphite">
          Si añades un segundo apellido en el paso anterior aparecerán combinaciones de tres letras.
        </p>
      ) : null}
    </div>
  );
}
