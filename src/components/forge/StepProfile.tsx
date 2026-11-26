import { Crown, Home, MapPin, Shield, User } from "lucide-react";
import { CharacterType, PROFILE_META, PROFILE_TYPES, ProfileType, RemateType, REMATE_META, CHARACTER_META } from "@/types/forge";
import { CHARACTER_TYPES, REMATE_TYPES } from "@/types/forge";
import { Field } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { LegalNotice } from "@/components/layout/LegalNotice";
import type { WizardDraft } from "@/components/forge/types";

const PROFILE_ICONS = {
  novillero: Crown,
  ganaderia: Shield,
  particular: Home,
} as const;

interface StepProfileProps {
  draft: WizardDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<WizardDraft>) => void;
}

export function StepProfile({ draft, errors, onChange }: StepProfileProps) {
  return (
    <div>
      <p className="eyebrow">Paso 01 · Perfil y datos</p>
      <h1 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Empecemos por tu nombre</h1>

      <fieldset className="mt-8">
        <legend className="eyebrow-muted">¿Para quién forjamos?</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PROFILE_TYPES.map((profile: ProfileType) => {
            const Icon = PROFILE_ICONS[profile];
            const meta = PROFILE_META[profile];
            const selected = draft.profile === profile;
            return (
              <button
                key={profile}
                type="button"
                onClick={() => onChange({ profile })}
                aria-pressed={selected}
                data-selected={selected}
                className="card-select relative overflow-hidden p-5"
              >
                <span className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${selected ? "text-forge-leather" : "text-forge-graphite"}`} aria-hidden />
                  <span className={`h-2 w-2 rounded-full border ${selected ? "border-forge-leather bg-forge-leather" : "border-forge-border"}`} aria-hidden />
                </span>
                <span className="mt-4 block font-display text-lg tracking-wide text-forge-ink">{meta.label}</span>
                <span className="mt-2 block text-xs leading-relaxed text-forge-graphite">{meta.description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field
          id="firstName"
          label="Nombre"
          value={draft.firstName}
          onChange={(firstName) => onChange({ firstName })}
          placeholder="Joaquín"
          autoComplete="given-name"
          error={errors.firstName}
          hint="Solo letras, espacios, guiones y apóstrofes."
          required
          maxLength={40}
        />
        <Field
          id="lastName1"
          label="Primer apellido"
          value={draft.lastName1}
          onChange={(lastName1) => onChange({ lastName1 })}
          placeholder="García"
          autoComplete="family-name"
          error={errors.lastName1}
          required
          maxLength={40}
        />
        <Field
          id="lastName2"
          label="Segundo apellido"
          value={draft.lastName2}
          onChange={(lastName2) => onChange({ lastName2 })}
          placeholder="Moreno"
          autoComplete="additional-name"
          error={errors.lastName2}
          optionalLabel="opcional"
          maxLength={40}
        />
        {draft.profile === "novillero" ? (
          <Field
            id="nickname"
            label="Apodo"
            value={draft.nickname}
            onChange={(nickname) => onChange({ nickname })}
            placeholder="El Sella"
            autoComplete="nickname"
            error={errors.nickname}
            hint="El nombre por el que te conocen en el patio de cuadrillas."
            optionalLabel="opcional"
            maxLength={30}
          />
        ) : null}
        <Field
          id="origin"
          label="Procedencia"
          value={draft.origin}
          onChange={(origin) => onChange({ origin })}
          placeholder="Salamanca"
          autoComplete="address-level2"
          error={errors.origin}
          optionalLabel="opcional"
          maxLength={60}
        />
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <fieldset>
          <legend className="eyebrow-muted">Carácter del trazo</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHARACTER_TYPES.map((character: CharacterType) => (
              <Chip
                key={character}
                label={CHARACTER_META[character]}
                selected={draft.character === character}
                onSelect={() => onChange({ character })}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="eyebrow-muted">Remate superior</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {REMATE_TYPES.map((remate: RemateType) => (
              <Chip
                key={remate}
                label={REMATE_META[remate]}
                selected={draft.remate === remate}
                onSelect={() => onChange({ remate })}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-8 flex items-start gap-3 border border-forge-border bg-forge-stone p-4 text-xs leading-relaxed text-forge-graphite">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forge-leather" aria-hidden />
        <p>La procedencia es opcional y solo se usa para personalizar la explicación del trazo.</p>
      </div>

      <LegalNotice variant="full" className="mt-6" />

      <p className="mt-4 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.12em] text-forge-graphite">
        <User className="h-3.5 w-3.5" aria-hidden />
        Sin registro · Sin tarjeta para empezar
      </p>
    </div>
  );
}
