const PROGRAM_STEPS = [
  { roman: "I", label: "Perfil" },
  { roman: "II", label: "Iniciales" },
  { roman: "III", label: "Estilo" },
  { roman: "IV", label: "Visor" },
  { roman: "V", label: "Entrega" },
] as const;

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <nav aria-label="Programa de mano del taller" className="double-rule-y bg-forge-white py-3.5 px-4">
      <ol className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:justify-center sm:gap-x-8">
        {PROGRAM_STEPS.map((item, index) => {
          const stepNumber = index + 1;
          const active = stepNumber === current;
          const done = stepNumber < current;
          return (
            <li key={item.roman} className="flex items-center gap-1.5">
              <span
                className={`font-display text-xs tracking-[0.08em] transition sm:text-sm ${
                  active
                    ? "border-b-2 border-forge-gold pb-0.5 font-bold text-forge-grana"
                    : done
                      ? "text-forge-ink"
                      : "text-forge-graphite/60"
                }`}
              >
                {item.roman}. {item.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
