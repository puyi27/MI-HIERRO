import { Emblem } from "@/components/brand/Emblem";

interface WordmarkProps {
  compact?: boolean;
  className?: string;
}

export function Wordmark({ compact = false, className }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <Emblem className={compact ? "h-7 w-7 text-forge-bronze" : "h-10 w-10 text-forge-bronze"} strokeWidth={compact ? 6 : 5} />
      <span className="flex flex-col leading-none">
        <span className={`font-display tracking-[0.34em] text-forge-ivory ${compact ? "text-sm" : "text-base sm:text-lg"}`}>
          MI HIERRO
        </span>
        {compact ? null : (
          <span className="mt-1.5 font-editorial text-[0.72rem] tracking-[0.22em] text-forge-muted">Forja tu legado</span>
        )}
      </span>
    </span>
  );
}
