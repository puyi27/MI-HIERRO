import { AlertCircle, Hammer, Loader2 } from "lucide-react";
import { STYLE_META, STYLE_TYPES, type ForgeProposal, type ForgeStyle } from "@/types/forge";
import { StyleGlyph } from "@/components/forge/StyleGlyph";
import { ProposalCard } from "@/components/forge/ProposalCard";

interface StepStyleProps {
  style: ForgeStyle;
  onStyleChange: (style: ForgeStyle) => void;
  onGenerate: () => void;
  generating: boolean;
  error: string | null;
  proposals: ForgeProposal[];
  selectedProposalId: string | null;
  onSelectProposal: (proposalId: string) => void;
  initialsLabel: string;
}

export function StepStyle({
  style,
  onStyleChange,
  onGenerate,
  generating,
  error,
  proposals,
  selectedProposalId,
  onSelectProposal,
  initialsLabel,
}: StepStyleProps) {
  return (
    <div>
      <p className="eyebrow">Paso 03 · Estilo y forja</p>
      <h1 className="mt-4 font-display text-3xl leading-tight text-forge-ivory sm:text-4xl">Elige el temple del hierro</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forge-muted">
        Cuatro familias de diseño, tres propuestas por familia. Todas con trazados convertidos a curvas, sin tipografías
        incrustadas ni piezas sueltas.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {STYLE_TYPES.map((styleKey, index) => {
          const meta = STYLE_META[styleKey];
          const active = style === styleKey;
          return (
            <button
              key={styleKey}
              type="button"
              onClick={() => onStyleChange(styleKey)}
              aria-pressed={active}
              data-selected={active}
              className="card-select grain relative flex gap-4 overflow-hidden p-5"
            >
              <span className="shrink-0 text-forge-bronze">
                <StyleGlyph style={styleKey} className="h-16 w-16" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-3">
                  <span className="numeral text-sm">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-display text-lg tracking-wide text-forge-ivory">{meta.label}</span>
                </span>
                <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.22em] text-forge-bronze">{meta.tagline}</span>
                <span className="mt-2 block text-xs leading-relaxed text-forge-muted">{meta.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="button" onClick={onGenerate} disabled={generating || initialsLabel.length < 1} className="btn-primary w-full sm:w-auto">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Hammer className="h-4 w-4" aria-hidden />}
          {generating ? "La fragua está trabajando" : `Forjar propuestas ${initialsLabel}`}
        </button>
        <p className="text-xs leading-relaxed text-forge-muted">
          {generating
            ? "Componiendo iniciales, soldando remates y rasterizando vistas con marca de agua."
            : "Tres propuestas gratuitas · sin tarjeta · vista previa siempre con marca de agua."}
        </p>
      </div>

      {error ? (
        <div role="alert" className="mt-6 flex gap-3 border border-[#6d3a2b] bg-[#251512] p-4 text-sm text-[#e6b4a1]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : null}

      {proposals.length > 0 ? (
        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl tracking-wide text-forge-ivory">Propuestas forjadas</h2>
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-forge-muted">Selecciona para el visor</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {proposals.map((proposal, index) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                index={index}
                selected={selectedProposalId === proposal.id}
                onSelect={() => onSelectProposal(proposal.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
