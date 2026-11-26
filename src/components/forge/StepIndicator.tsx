import { STEP_LABELS } from "@/components/forge/types";

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="eyebrow-muted">
          Paso {String(current).padStart(2, "0")} de 05 · {STEP_LABELS[current - 1]}
        </p>
        <p className="hidden text-[0.62rem] uppercase tracking-[0.24em] text-forge-muted sm:block">MI HIERRO · Forja digital</p>
      </div>
      <ol className="mt-4 flex items-center gap-2" aria-label="Progreso del diseño">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const state = stepNumber < current ? "done" : stepNumber === current ? "active" : "pending";
          return (
            <li key={label} className="flex-1">
              <span className="sr-only">{`Paso ${stepNumber}: ${label} (${state})`}</span>
              <span
                aria-hidden
                className={`block h-[3px] w-full transition ${
                  state === "active" ? "bg-forge-bronze" : state === "done" ? "bg-forge-bronze/45" : "bg-forge-line"
                }`}
              />
              <span
                aria-hidden
                className={`mt-2 hidden text-[0.58rem] uppercase tracking-[0.22em] sm:block ${
                  state === "active" ? "text-forge-ivory" : "text-forge-muted/70"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
