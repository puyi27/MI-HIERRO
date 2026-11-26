import { Check } from "lucide-react";
import { STYLE_META, type ForgeProposal } from "@/types/forge";

interface ProposalCardProps {
  proposal: ForgeProposal;
  selected: boolean;
  onSelect: () => void;
  index: number;
}

export function ProposalCard({ proposal, selected, onSelect, index }: ProposalCardProps) {
  const meta = STYLE_META[proposal.blueprint.style];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-selected={selected}
      className="card-select grain relative overflow-hidden"
    >
      <div className="relative border-b border-forge-line bg-forge-void">
        <img
          src={proposal.previewUrl}
          alt={`Propuesta ${index + 1}: ${meta.label} para las iniciales ${proposal.blueprint.combo}`}
          width={520}
          height={520}
          className="h-56 w-full object-contain p-3"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 border border-forge-line bg-forge-void/90 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-forge-bronze">
          {String(index + 1).padStart(2, "0")} · {meta.label}
        </span>
        {selected ? (
          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center bg-forge-bronze text-forge-void">
            <Check className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <div className="p-5 text-left">
        <p className="text-xs leading-relaxed text-forge-muted">{proposal.explanation}</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-forge-line pt-4">
          <div>
            <dt className="text-[0.55rem] uppercase tracking-[0.18em] text-forge-muted">Legibilidad</dt>
            <dd className="mt-1 font-display text-lg text-forge-ivory">{proposal.scores.legibility}</dd>
          </div>
          <div>
            <dt className="text-[0.55rem] uppercase tracking-[0.18em] text-forge-muted">Equilibrio</dt>
            <dd className="mt-1 font-display text-lg text-forge-ivory">{proposal.scores.balance}</dd>
          </div>
          <div>
            <dt className="text-[0.55rem] uppercase tracking-[0.18em] text-forge-muted">Forjable</dt>
            <dd className="mt-1 font-display text-lg text-forge-ivory">{proposal.scores.forgeability}</dd>
          </div>
        </dl>
      </div>
    </button>
  );
}
