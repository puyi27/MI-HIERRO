"use client";

import { useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { animate } from "animejs";
import { Download, Eye, Loader2 } from "lucide-react";
import type { ForgeProposal } from "@/types/forge";
import { STYLE_META } from "@/types/forge";
import { PreviewCanvas } from "@/components/forge/PreviewCanvas";
import { TEXTURE_OPTIONS, type ForgeTexture } from "@/components/forge/types";
import { useMediaQuery } from "@/components/ui/useMediaQuery";
import { prefersReducedMotion } from "@/lib/motion";

interface StepWorldProps {
  proposals: ForgeProposal[];
  selectedProposal: ForgeProposal | null;
  texture: ForgeTexture;
  onTextureChange: (texture: ForgeTexture) => void;
  onSelectProposal: (proposalId: string) => void;
  onStory: () => void;
  storyBusy: boolean;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const barRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || prefersReducedMotion()) return;
    const animation = animate(bar, { scaleX: [0, 1], duration: 900, ease: "out(3)" });
    return () => {
      animation.revert();
    };
  }, [value]);

  return (
    <div>
      <div className="flex items-baseline justify-between text-[0.62rem] uppercase tracking-[0.2em] text-forge-muted">
        <span>{label}</span>
        <span className="font-display text-sm text-forge-ivory">{value}</span>
      </div>
      <div className="mt-2 h-[3px] w-full bg-forge-line">
        <span
          ref={barRef}
          className="block h-full origin-left bg-forge-bronze"
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function StepWorld({
  proposals,
  selectedProposal,
  texture,
  onTextureChange,
  onSelectProposal,
  onStory,
  storyBusy,
}: StepWorldProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [emblaRef] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  if (!selectedProposal) {
    return (
      <div>
        <p className="eyebrow">Paso 04 · Visor</p>
        <h1 className="mt-4 font-display text-3xl text-forge-ivory">Todavía no hay un hierro que mirar</h1>
        <p className="mt-4 text-sm text-forge-muted">Vuelve al paso anterior y forja tus propuestas para verlas en contexto.</p>
      </div>
    );
  }

  const meta = STYLE_META[selectedProposal.blueprint.style];

  const textureButton = (option: (typeof TEXTURE_OPTIONS)[number]) => {
    const active = texture === option.id;
    return (
      <button
        key={option.id}
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => onTextureChange(option.id)}
        className={`w-full border px-3.5 py-2 text-left transition ${
          active ? "border-forge-bronze bg-forge-bronze/12" : "border-forge-line hover:border-forge-bronze/60"
        }`}
      >
        <span className={`block text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${active ? "text-forge-ivory" : "text-forge-muted"}`}>
          {option.label}
        </span>
        <span className="mt-0.5 block text-[0.6rem] text-forge-muted/80">{option.hint}</span>
      </button>
    );
  };

  return (
    <div>
      <p className="eyebrow">Paso 04 · Visor realista</p>
      <h1 className="mt-4 font-display text-3xl leading-tight text-forge-ivory sm:text-4xl">Míralo en tu mundo</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forge-muted">
        El mismo hierro sobre tres materiales. La vista se genera rasterizada con marca de agua: el archivo vectorial
        limpio solo se entrega con el Pack Digital.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div role="tablist" aria-label="Texturas del visor">
            {isMobile ? (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-2">
                  {TEXTURE_OPTIONS.map((option) => (
                    <div key={option.id} className="min-w-0 flex-[0_0_64%]">
                      {textureButton(option)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">{TEXTURE_OPTIONS.map((option) => textureButton(option))}</div>
            )}
          </div>

          <div className="mt-4">
            <PreviewCanvas
              previewUrl={selectedProposal.previewUrl}
              texture={texture}
              alt={`Hierro ${selectedProposal.blueprint.combo} sobre ${texture}`}
            />
          </div>

          <div className="mt-3 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-forge-muted">
            <Eye className="h-3.5 w-3.5 text-forge-bronze" aria-hidden />
            Vista orientativa con marca de agua · mueve el dedo o el cursor para inclinar la luz
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="border border-forge-line bg-forge-surface p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg tracking-wide text-forge-ivory">{meta.label}</h2>
              <span className="numeral text-sm">{selectedProposal.blueprint.combo}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-forge-muted">{selectedProposal.explanation}</p>
            <div className="mt-5 space-y-4">
              <ScoreBar label="Legibilidad" value={selectedProposal.scores.legibility} />
              <ScoreBar label="Equilibrio" value={selectedProposal.scores.balance} />
              <ScoreBar label="Aptitud de forja" value={selectedProposal.scores.forgeability} />
            </div>
            <p className="mt-4 text-[0.65rem] leading-relaxed text-forge-muted/80">
              Puntuaciones orientativas calculadas sobre proporción, grosor mínimo y complejidad del remate. No sustituyen
              una prueba física de forja.
            </p>
          </div>

          <div className="border border-forge-line bg-forge-surface p-5">
            <p className="eyebrow-muted">Cambiar propuesta</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {proposals.map((proposal, index) => {
                const active = proposal.id === selectedProposal.id;
                return (
                  <button
                    key={proposal.id}
                    type="button"
                    onClick={() => onSelectProposal(proposal.id)}
                    aria-pressed={active}
                    aria-label={`Ver propuesta ${index + 1}`}
                    className={`border bg-forge-void p-1.5 transition ${active ? "border-forge-bronze" : "border-forge-line hover:border-forge-bronze/60"}`}
                  >
                    <img src={proposal.previewUrl} alt="" width={160} height={160} className="h-20 w-full object-contain" />
                    <span className="mt-1 block text-center text-[0.55rem] uppercase tracking-[0.16em] text-forge-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" onClick={onStory} disabled={storyBusy} className="btn-ghost w-full">
            {storyBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
            {storyBusy ? "Preparando Story" : "Descargar Story 9:16 gratis"}
          </button>
        </div>
      </div>
    </div>
  );
}
