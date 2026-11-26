import { Emblem } from "@/components/brand/Emblem";

interface WordmarkProps {
  compact?: boolean;
  inverted?: boolean;
  className?: string;
}

export function Wordmark({ compact = false, inverted = false, className }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <Emblem
        className={`${compact ? "h-7 w-7" : "h-10 w-10"} ${inverted ? "text-forge-gold" : "text-forge-leather"}`}
        strokeWidth={compact ? 6 : 5}
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display tracking-[0.24em] ${inverted ? "text-forge-paper" : "text-forge-ink"} ${compact ? "text-sm" : "text-base sm:text-lg"}`}
        >
          MI HIERRO
        </span>
        {compact ? null : (
          <span
            className={`mt-1.5 font-editorial text-[0.72rem] tracking-[0.14em] ${inverted ? "text-forge-paper/70" : "text-forge-graphite"}`}
          >
            Forja tu legado
          </span>
        )}
      </span>
    </span>
  );
}
