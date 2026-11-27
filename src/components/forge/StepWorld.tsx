"use client";

import useEmblaCarousel from "embla-carousel-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { ArrowRight, CheckCircle2, Download, Eye, Loader2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { ForgeProposal, ProfileType } from "@/types/forge";
import { STYLE_META } from "@/types/forge";
import { PreviewCanvas } from "@/components/forge/PreviewCanvas";
import {
  DIVISA_OPTIONS,
  getTextureOptionsForProfile,
  previewUrlForTexture,
  type DemoPackMode,
  type ForgeTexture,
  type TextureOption,
} from "@/components/forge/types";
import { useMediaQuery } from "@/components/ui/useMediaQuery";

interface StepWorldProps {
  profile: ProfileType;
  proposals: ForgeProposal[];
  selectedProposal: ForgeProposal | null;
  texture: ForgeTexture;
  onTextureChange: (texture: ForgeTexture) => void;
  divisaId: string;
  onDivisaChange: (divisaId: string) => void;
  onSelectProposal: (proposalId: string) => void;
  onStory: () => void;
  storyBusy: boolean;
  demoMode?: DemoPackMode;
  onGoToDelivery?: () => void;
}

export function StepWorld({
  profile,
  proposals,
  selectedProposal,
  texture,
  onTextureChange,
  divisaId,
  onDivisaChange,
  onSelectProposal,
  onStory,
  storyBusy,
  demoMode = "free",
  onGoToDelivery,
}: StepWorldProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [emblaRef] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  if (!selectedProposal) {
    return (
      <div>
        <p className="eyebrow">IV. Visor</p>
        <h1 className="mt-3 font-display text-3xl text-forge-ink">Todavía no hay un hierro que mirar</h1>
        <p className="mt-3 text-sm text-forge-graphite">Vuelve al paso anterior y forja tus propuestas para verlas sobre tus avíos.</p>
      </div>
    );
  }

  const options = getTextureOptionsForProfile(profile);
  const activeTexture = options.some((option) => option.id === texture) ? texture : options[0].id;
  const activeOption = options.find((option) => option.id === activeTexture) ?? options[0];
  const meta = STYLE_META[selectedProposal.blueprint.style];
  const activeDivisa = DIVISA_OPTIONS.find((item) => item.id === divisaId) ?? DIVISA_OPTIONS[0];
  const activePreviewUrl = previewUrlForTexture(selectedProposal.previewUrl, activeTexture);

  const textureButton = (option: TextureOption) => {
    const active = activeTexture === option.id;
    return (
      <button
        key={option.id}
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => onTextureChange(option.id)}
        className={`w-full rounded-[2px] border px-3 py-2 text-left transition ${
          active ? "border-forge-grana bg-forge-white" : "border-forge-border bg-forge-stone/60 hover:border-forge-leather"
        }`}
      >
        <span className={`block text-[0.68rem] font-semibold uppercase tracking-[0.1em] ${active ? "text-forge-grana" : "text-forge-ink"}`}>
          {option.label}
        </span>
        <span className="mt-0.5 block text-[0.62rem] text-forge-graphite">{option.hint}</span>
      </button>
    );
  };

  return (
    <div>
      <p className="eyebrow">IV. Avíos y trastos</p>
      <h1 className="mt-3 font-display text-3xl leading-tight text-forge-ink sm:text-4xl">Míralo en tu mundo</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forge-graphite">
        {profile === "novillero"
          ? "Prueba tu hierro sobre capote en hilo de oro, esportón de piel, fundón de espadas, maleta del mozo y avatar."
          : "Prueba tu hierro sobre fragua viva, montura vaquera, cancela de finca y polo de campo."}
      </p>

      {demoMode === "premium" ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-forge-gold bg-forge-white px-4 py-3 text-xs text-forge-ink">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-forge-leather" aria-hidden />
            <span>Demo local · Pack Digital 9,99 € activo con acceso directo al pliego ZIP completo.</span>
          </div>
          {onGoToDelivery ? (
            <button type="button" onClick={onGoToDelivery} className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.12em] text-forge-grana underline underline-offset-2">
              Ir a descarga del Pack
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:sticky lg:top-24 lg:col-span-7">
          <div role="tablist" aria-label="Avíos y soportes">
            {isMobile ? (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-2">
                  {options.map((option) => (
                    <div key={option.id} className="min-w-0 flex-[0_0_58%]">
                      {textureButton(option)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`grid gap-2 ${options.length >= 5 ? "grid-cols-3 xl:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}>
                {options.map((option) => textureButton(option))}
              </div>
            )}
          </div>

          <div className="mt-4 border border-forge-border bg-forge-white p-1.5">
            <TransformWrapper minScale={1} maxScale={3} initialScale={1} wheel={{ step: 0.2 }}>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div>
                  <div className="flex items-center justify-between border-b border-forge-border bg-forge-paper px-3 py-2">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-forge-graphite">
                      {activeOption.label} · Lupa de inspección
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => zoomIn()}
                        aria-label="Acercar vista"
                        className="inline-flex h-7 w-7 items-center justify-center border border-forge-border bg-forge-white text-forge-ink transition hover:border-forge-grana hover:text-forge-grana"
                      >
                        <ZoomIn className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => zoomOut()}
                        aria-label="Alejar vista"
                        className="inline-flex h-7 w-7 items-center justify-center border border-forge-border bg-forge-white text-forge-ink transition hover:border-forge-grana hover:text-forge-grana"
                      >
                        <ZoomOut className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => resetTransform()}
                        aria-label="Restablecer zoom"
                        className="inline-flex h-7 items-center gap-1 border border-forge-border bg-forge-white px-2 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-forge-ink transition hover:border-forge-grana hover:text-forge-grana"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden />
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden border border-forge-border">
                    <TransformComponent wrapperClass="!w-full" contentClass="!w-full">
                      <PreviewCanvas
                        previewUrl={activePreviewUrl}
                        texture={activeTexture}
                        alt={`Hierro ${selectedProposal.blueprint.combo} sobre ${activeOption.label}`}
                      />
                    </TransformComponent>
                  </div>
                </div>
              )}
            </TransformWrapper>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-forge-graphite">
            <Eye className="h-3.5 w-3.5 shrink-0 text-forge-leather" aria-hidden />
            Lámina de prueba con marca de agua · usa la lupa o arrastra para inspeccionar el trazo
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <article className="border border-forge-border bg-forge-white p-1.5">
            <div className="border border-forge-border">
              <header className="flex items-center justify-between border-b border-forge-border px-4 py-3">
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-forge-graphite">
                    Ficha de hierro · {meta.label}
                  </p>
                  <h2 className="mt-0.5 font-display text-xl text-forge-ink">{selectedProposal.blueprint.combo}</h2>
                </div>
                <div className="flex items-center gap-2" aria-label={`Divisa ${activeDivisa.label}`}>
                  <span className="text-[0.65rem] text-forge-graphite">{activeDivisa.label}</span>
                  <div className="flex h-6 w-3.5 overflow-hidden border border-forge-border">
                    <span className="flex-1" style={{ backgroundColor: activeDivisa.colors[0] }} />
                    <span className="flex-1" style={{ backgroundColor: activeDivisa.colors[1] }} />
                  </div>
                </div>
              </header>

              <div className="p-4">
                <p className="text-xs leading-relaxed text-forge-graphite">{selectedProposal.explanation}</p>
              </div>

              <dl className="grid grid-cols-3 divide-x divide-forge-border border-t border-forge-border text-center">
                <div className="px-2 py-2.5">
                  <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-forge-graphite">Legibilidad</dt>
                  <dd className="mt-0.5 font-display text-base text-forge-ink">{selectedProposal.scores.legibility}</dd>
                </div>
                <div className="px-2 py-2.5">
                  <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-forge-graphite">Equilibrio</dt>
                  <dd className="mt-0.5 font-display text-base text-forge-ink">{selectedProposal.scores.balance}</dd>
                </div>
                <div className="px-2 py-2.5">
                  <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-forge-graphite">Forjable</dt>
                  <dd className="mt-0.5 font-display text-base text-forge-grana">{selectedProposal.scores.forgeability}</dd>
                </div>
              </dl>
            </div>
          </article>

          <div className="border border-forge-border bg-forge-white p-4">
            <p className="eyebrow-muted">Divisa de la casa</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DIVISA_OPTIONS.map((item) => {
                const active = item.id === divisaId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onDivisaChange(item.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-2.5 rounded-[2px] border px-3 py-2 text-left text-xs transition ${
                      active ? "border-forge-grana bg-forge-paper text-forge-ink font-semibold" : "border-forge-border text-forge-graphite hover:border-forge-leather"
                    }`}
                  >
                    <span className="flex h-4 w-3 shrink-0 overflow-hidden border border-forge-border" aria-hidden>
                      <span className="flex-1" style={{ backgroundColor: item.colors[0] }} />
                      <span className="flex-1" style={{ backgroundColor: item.colors[1] }} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-forge-border bg-forge-white p-4">
            <p className="eyebrow-muted">Cambiar lámina</p>
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
                    className={`rounded-[2px] border bg-forge-void p-1.5 transition ${active ? "border-forge-grana ring-1 ring-forge-grana" : "border-forge-border hover:border-forge-leather"}`}
                  >
                    <img src={proposal.previewUrl} alt="" width={160} height={160} className="h-20 w-full object-contain" />
                    <span className="mt-1 block text-center text-[0.55rem] uppercase tracking-[0.16em] text-forge-paper">
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
