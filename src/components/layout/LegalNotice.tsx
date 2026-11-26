import Link from "next/link";

interface LegalNoticeProps {
  variant?: "compact" | "full";
  className?: string;
}

export function LegalNotice({ variant = "compact", className }: LegalNoticeProps) {
  if (variant === "full") {
    return (
      <p className={`text-xs leading-relaxed text-forge-graphite ${className ?? ""}`}>
        MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI.
        Los resultados son orientativos y no constituyen asesoramiento jurídico. Ref. RD 787/2023.
      </p>
    );
  }

  return (
    <p className={`text-xs leading-relaxed text-forge-graphite ${className ?? ""}`}>
      MI HIERRO propone y orienta; no certifica disponibilidad registral.{" "}
      <Link href="/alcance-registral" className="underline underline-offset-2 transition hover:text-forge-ink">
        Ref. RD 787/2023
      </Link>
    </p>
  );
}
