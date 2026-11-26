"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import type { ProfileType } from "@/types/forge";
import { StepIndicator } from "@/components/forge/StepIndicator";
import { StepProfile } from "@/components/forge/StepProfile";
import { StepInitials } from "@/components/forge/StepInitials";
import { StepStyle } from "@/components/forge/StepStyle";
import { StepWorld } from "@/components/forge/StepWorld";
import { StepDelivery } from "@/components/forge/StepDelivery";
import { useForgeWizard } from "@/components/forge/useForgeWizard";

interface ForgeWizardProps {
  initialProfile: ProfileType;
  canceled?: boolean;
}

export function ForgeWizard({ initialProfile, canceled = false }: ForgeWizardProps) {
  const wizard = useForgeWizard({ initialProfile, canceled });
  const {
    draft,
    errors,
    generating,
    generateError,
    texture,
    setTexture,
    storyBusy,
    avatarBusy,
    busyProduct,
    checkoutFeedback,
    leadBusy,
    leadFeedback,
    combinations,
    selectedCombination,
    selectedProposal,
  } = wizard;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-8 sm:px-8">
      <StepIndicator current={draft.step} />

      <motion.div
        key={draft.step}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mt-10"
      >
        {draft.step === 1 ? <StepProfile draft={draft} errors={errors} onChange={wizard.update} /> : null}

        {draft.step === 2 ? (
          <>
            {errors.combination ? (
              <div role="alert" className="mb-6 flex gap-3 border border-[#6d3a2b] bg-[#251512] p-4 text-sm text-[#e6b4a1]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>{errors.combination}</p>
              </div>
            ) : null}
            <StepInitials
              draft={draft}
              combinations={combinations}
              selected={selectedCombination}
              onSelect={(combination) => wizard.update({ combinationId: combination.id })}
            />
          </>
        ) : null}

        {draft.step === 3 ? (
          <StepStyle
            style={draft.style}
            onStyleChange={(style) => wizard.update({ style })}
            onGenerate={wizard.generate}
            generating={generating}
            error={generateError}
            proposals={draft.proposals}
            selectedProposalId={selectedProposal?.id ?? null}
            onSelectProposal={wizard.selectProposal}
            initialsLabel={selectedCombination?.label ?? ""}
          />
        ) : null}

        {draft.step === 4 ? (
          <StepWorld
            proposals={draft.proposals}
            selectedProposal={selectedProposal}
            texture={texture}
            onTextureChange={setTexture}
            onSelectProposal={wizard.selectProposal}
            onStory={wizard.downloadStory}
            storyBusy={storyBusy}
          />
        ) : null}

        {draft.step === 5 ? (
          <StepDelivery
            draft={draft}
            proposal={selectedProposal}
            email={draft.email}
            onEmailChange={wizard.setEmail}
            onCheckout={wizard.checkout}
            busyProduct={busyProduct}
            checkoutFeedback={checkoutFeedback}
            onStory={wizard.downloadStory}
            storyBusy={storyBusy}
            onAvatar={wizard.downloadAvatar}
            avatarBusy={avatarBusy}
            onLead={wizard.submitLead}
            leadBusy={leadBusy}
            leadFeedback={leadFeedback}
          />
        ) : null}
      </motion.div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-forge-line pt-6">
        <div>
          {draft.step > 1 ? (
            <button type="button" onClick={() => wizard.goToStep(draft.step - 1)} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Atrás
            </button>
          ) : (
            <button
              type="button"
              onClick={wizard.reset}
              className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-forge-muted transition hover:text-forge-ivory"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Empezar de nuevo
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {draft.step === 1 ? (
            <button type="button" onClick={wizard.advanceFromProfile} className="btn-primary">
              Continuar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {draft.step === 2 ? (
            <button type="button" onClick={wizard.advanceFromInitials} className="btn-primary">
              Elegir estilo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {draft.step === 3 ? (
            <button type="button" onClick={() => wizard.goToStep(4)} disabled={!selectedProposal} className="btn-primary">
              Ver en el visor
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {draft.step === 4 ? (
            <button type="button" onClick={() => wizard.goToStep(5)} disabled={!selectedProposal} className="btn-primary">
              Continuar a entrega
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {draft.step === 5 ? (
            <button type="button" onClick={wizard.reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Forjar otro hierro
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
