import { Info } from "lucide-react";

interface LegalNoticeProps {
  variant?: "compact" | "full";
  className?: string;
}

export function LegalNotice({ variant = "compact", className }: LegalNoticeProps) {
  return (
    <div
      className={`flex gap-3 border border-forge-line bg-forge-surface/70 p-4 text-forge-muted ${className ?? ""}`}
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-forge-bronze" aria-hidden />
      <p className="text-[0.78rem] leading-relaxed">
        <span className="text-forge-ivory">MI HIERRO propone y orienta;</span> no certifica disponibilidad ante RUCTL,
        OEPM, EUIPO ni OMPI.
        {variant === "full" ? (
          <>
            {" "}
            Los resultados son orientativos y no constituyen asesoramiento jurídico ni garantía de registro. Referencia
            normativa: RD 787/2023. Antes de fabricar o usar el hierro, recomendamos una revisión profesional.
          </>
        ) : (
          <> Referencia RD 787/2023.</>
        )}
      </p>
    </div>
  );
}
