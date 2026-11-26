import { Check } from "lucide-react";
import { STYLE_META, type ForgeProposal } from "@/types/forge";
import { DIVISA_OPTIONS } from "@/components/forge/types";

interface ProposalCardProps {
  proposal: ForgeProposal;
  selected: boolean;
  onSelect: () => void;
  index: number;
  divisaId?: string;
}

export function ProposalCard({ proposal, selected, onSelect, index, divisaId }: ProposalCardProps) {
  const meta = STYLE_META[proposal.blueprint.style];
  const divisa = DIVISA_OPTIONS.find((item) => item.id === divisaId) ?? DIVISA_OPTIONS[0];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-selected={selected}
      data-proposal-card=""
      className="card-select relative flex flex-col overflow-hidden p-1.5"
    >
      <div className="flex w-full flex-col border border-forge-border bg-forge-white">
        <div className="flex items-center justify-between border-b border-forge-border px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-forge-graphite">
              {String(index + 1).padStart(2, "0")} · {meta.label}
            </span>
            <span className="font-display text-sm font-bold tracking-[0.08em] text-forge-ink">
              {proposal.blueprint.combo}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-3 overflow-hidden border border-forge-border" title={`Divisa ${divisa.label}`} aria-hidden>
              <span className="flex-1" style={{ backgroundColor: divisa.colors[0] }} />
              <span className="flex-1" style={{ backgroundColor: divisa.colors[1] }} />
            </span>
            {selected ? (
              <span className="flex h-5 w-5 items-center justify-center bg-forge-grana text-forge-paper">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative flex items-center justify-center border-b border-forge-border bg-forge-void p-4">
          <img
            src={proposal.previewUrl}
            alt={`Propuesta ${index + 1}: ${meta.label} para las iniciales ${proposal.blueprint.combo}`}
            width={520}
            height={520}
            className="h-48 w-full object-contain"
            loading="lazy"
          />
        </div>

        <div className="p-4 text-left">
          <p className="text-xs leading-relaxed text-forge-graphite">{proposal.explanation}</p>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-forge-border border-t border-forge-border text-center">
          <div className="px-2 py-2.5">
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-forge-graphite">Legibilidad</dt>
            <dd className="mt-0.5 font-display text-base text-forge-ink">{proposal.scores.legibility}</dd>
          </div>
          <div className="px-2 py-2.5">
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-forge-graphite">Equilibrio</dt>
            <dd className="mt-0.5 font-display text-base text-forge-ink">{proposal.scores.balance}</dd>
          </div>
          <div className="px-2 py-2.5">
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-forge-graphite">Forjable</dt>
            <dd className="mt-0.5 font-display text-base text-forge-grana">{proposal.scores.forgeability}</dd>
          </div>
        </dl>
      </div>
    </button>
  );
}
