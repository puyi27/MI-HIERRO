import type { ForgeStyle } from "@/types/forge";

interface StyleGlyphProps {
  style: ForgeStyle;
  className?: string;
}

export function StyleGlyph({ style, className }: StyleGlyphProps) {
  const common = {
    viewBox: "0 0 120 120",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  if (style === "tradicional") {
    return (
      <svg {...common}>
        <path d="M60 10 V26" />
        <path d="M50 16 H70" />
        <path d="M28 55 V100" strokeWidth={6} />
        <path d="M92 55 V100" strokeWidth={6} />
        <path d="M28 80 H92" strokeWidth={6} />
        <path d="M20 55 H36" />
        <path d="M84 55 H100" />
        <path d="M28 100 L18 108" />
        <path d="M92 100 L102 108" />
      </svg>
    );
  }

  if (style === "monograma") {
    return (
      <svg {...common}>
        <ellipse cx="60" cy="66" rx="42" ry="46" strokeWidth={2} opacity="0.55" />
        <path d="M78 34 C44 34 34 54 34 68 C34 88 52 100 74 94" strokeWidth={6} />
        <path d="M78 34 V96" strokeWidth={6} />
        <path d="M78 66 H50" strokeWidth={5} />
        <path d="M44 40 Q60 22 76 40" strokeWidth={2.5} />
      </svg>
    );
  }

  if (style === "geometrico") {
    return (
      <svg {...common}>
        <path d="M24 52 A40 40 0 0 1 96 52" strokeWidth={3} />
        <path d="M60 18 V34" strokeWidth={4} />
        <path d="M60 46 L92 100 H28 Z" strokeWidth={6} />
        <path d="M46 80 H74" strokeWidth={4} />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M60 14 L94 26 V62 C94 82 78 96 60 104 C42 96 26 82 26 62 V26 Z" strokeWidth={3} />
      <path d="M44 38 L44 30 L54 36 L60 26 L66 36 L76 30 L76 38 Z" strokeWidth={2.5} />
      <path d="M44 52 V86" strokeWidth={5} />
      <path d="M76 52 V86" strokeWidth={5} />
      <path d="M44 70 H76" strokeWidth={5} />
      <path d="M60 52 L52 70 L60 86 L68 70 Z" strokeWidth={2.5} />
    </svg>
  );
}
