"use client";

import { useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { animate, createScope, stagger, utils } from "animejs";
import { createDrawable } from "animejs/svg";
import { AlertCircle, Hammer, Loader2, Lock } from "lucide-react";
import { STYLE_META, STYLE_TYPES, type ForgeProposal, type ForgeStyle } from "@/types/forge";
import { StyleGlyph } from "@/components/forge/StyleGlyph";
import { ProposalCard } from "@/components/forge/ProposalCard";
import { DIVISA_OPTIONS } from "@/components/forge/types";
import { useMediaQuery } from "@/components/ui/useMediaQuery";
import { prefersReducedMotion } from "@/lib/motion";

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
  divisaId: string;
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
  divisaId,
}: StepStyleProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [emblaRef] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const scope = createScope({ root }).add(() => {
      const paths = utils.$("[data-style-glyph] path");
      if (paths.length === 0) return;
      const drawables = createDrawable(paths);
      animate(drawables, {
        draw: ["0 0", "0 1"],
        duration: 1100,
        delay: stagger(20),
        ease: "inOutSine",
      });
    });
    return () => scope.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || proposals.length === 0 || prefersReducedMotion()) return;
    const cards = root.querySelectorAll("[data-proposal-card]");
    if (cards.length === 0) return;
    const animation = animate(cards, {
      opacity: [0, 1],
      translateY: [22, 0],
      duration: 620,
      delay: stagger(90),
      ease: "out(3)",
    });
    return () => {
      animation.revert();
    };
  }, [proposals]);

  const activeProposal = proposals.find((p) => p.id === selectedProposalId) ?? proposals[0] ?? null;
  const activeDivisa = DIVISA_OPTIONS.find((item) => item.id === divisaId) ?? DIVISA_OPTIONS[0];
  const activeStyleMeta = STYLE_META[style];

  return (
    <div ref={rootRef}>
      <p className="eyebrow">III. Estilo y forja</p>
      <h1 className="mt-3 font-display text-3xl leading-tight text-forge-ink sm:text-4xl">Elige la hechura del hierro</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forge-graphite">
        Cuatro estirpes de diseño, tres láminas de prueba por familia.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:sticky lg:top-24 lg:col-span-7">
          {activeProposal ? (
            <div className="border border-forge-border bg-forge-white p-1.5">
              <div className="border border-forge-border">
                <div className="flex items-center justify-between border-b border-forge-border px-4 py-3">
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-forge-graphite">
                      Lámina de prueba · {STYLE_META[activeProposal.blueprint.style].label}
                    </p>
                    <p className="mt-0.5 font-display text-lg text-forge-ink">{activeProposal.blueprint.combo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] text-forge-graphite">{activeDivisa.label}</span>
                    <span className="flex h-6 w-3.5 overflow-hidden border border-forge-border" aria-hidden>
                      <span className="flex-1" style={{ backgroundColor: activeDivisa.colors[0] }} />
                      <span className="flex-1" style={{ backgroundColor: activeDivisa.colors[1] }} />
                    </span>
                  </div>
                </div>
                <div className="relative flex aspect-square max-h-[380px] w-full items-center justify-center bg-forge-void p-6">
                  <img
                    src={activeProposal.previewUrl}
                    alt={`Lámina de prueba para ${activeProposal.blueprint.combo}`}
                    width={520}
                    height={520}
                    className="h-full w-full object-contain"
                  />
                </div>
                <dl className="grid grid-cols-3 divide-x divide-forge-border border-t border-forge-border text-center">
                  <div className="px-3 py-3">
                    <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-forge-graphite">Legibilidad</dt>
                    <dd className="mt-0.5 font-display text-lg text-forge-ink">{activeProposal.scores.legibility}</dd>
                  </div>
                  <div className="px-3 py-3">
                    <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-forge-graphite">Equilibrio</dt>
                    <dd className="mt-0.5 font-display text-lg text-forge-ink">{activeProposal.scores.balance}</dd>
                  </div>
                  <div className="px-3 py-3">
                    <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-forge-graphite">Forjable</dt>
                    <dd className="mt-0.5 font-display text-lg text-forge-grana">{activeProposal.scores.forgeability}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="border border-forge-border bg-forge-white p-1.5">
              <div className="flex flex-col items-center justify-center border border-forge-border px-6 py-16 text-center">
                <StyleGlyph style={style} className="h-28 w-28 text-forge-ink" />
                <p className="mt-6 font-display text-xl text-forge-ink">
                  {activeStyleMeta.label} · {initialsLabel || "—"}
                </p>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-forge-graphite">
                  {activeStyleMeta.description}
                </p>
              </div>
            </div>
          )}

          <p className="mt-3 flex items-center gap-2 text-xs text-forge-graphite">
            <Lock className="h-3.5 w-3.5 shrink-0 text-forge-leather" aria-hidden />
            Tus pruebas no se publican en galerías abiertas ni se ceden a terceros.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="grid gap-3">
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
                  className="card-select flex items-center gap-4 p-4"
                >
                  <span className={`shrink-0 ${active ? "text-forge-grana" : "text-forge-ink"}`}>
                    <StyleGlyph style={styleKey} className="h-12 w-12" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2.5">
                      <span className="numeral text-xs">{String(index + 1).padStart(2, "0")}</span>
                      <span className="font-display text-base tracking-wide text-forge-ink">{meta.label}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-forge-graphite">{meta.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <button type="button" onClick={onGenerate} disabled={generating || initialsLabel.length < 1} className="btn-primary w-full">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Hammer className="h-4 w-4" aria-hidden />}
              {generating ? "La fragua está trabajando" : `Forjar propuestas ${initialsLabel}`}
            </button>
            <p className="mt-2.5 text-xs leading-relaxed text-forge-graphite">
              {generating
                ? "Componiendo iniciales, soldando remates y rasterizando láminas con marca de agua."
                : "Tres propuestas gratuitas · sin tarjeta · vista previa con marca de agua."}
            </p>
          </div>

          {error ? (
            <div role="alert" className="mt-5 flex gap-3 border border-forge-grana/40 bg-forge-grana/5 p-4 text-sm text-forge-grana">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>{error}</p>
            </div>
          ) : null}
        </div>
      </div>

      {proposals.length > 0 ? (
        <div className="mt-12 border-t border-forge-border pt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl tracking-wide text-forge-ink">Fichas de prueba generadas</h2>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-forge-graphite">Elige una para el visor</p>
          </div>

          {isMobile ? (
            <div className="mt-4 overflow-hidden" ref={emblaRef} aria-label="Propuestas forjadas">
              <div className="flex gap-4">
                {proposals.map((proposal, index) => (
                  <div key={proposal.id} className="min-w-0 flex-[0_0_88%]">
                    <ProposalCard
                      proposal={proposal}
                      index={index}
                      selected={selectedProposalId === proposal.id}
                      onSelect={() => onSelectProposal(proposal.id)}
                      divisaId={divisaId}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {proposals.map((proposal, index) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  index={index}
                  selected={selectedProposalId === proposal.id}
                  onSelect={() => onSelectProposal(proposal.id)}
                  divisaId={divisaId}
                />
              ))}
            </div>
          )}

          {isMobile ? (
            <p className="mt-3 text-center text-[0.6rem] uppercase tracking-[0.18em] text-forge-graphite">Desliza para ver las tres</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
