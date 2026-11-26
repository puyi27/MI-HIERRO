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
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    "data-style-glyph": style,
    className,
  };

  if (style === "tradicional") {
    return (
      <svg {...common}>
        <path d="M60 6 V24" strokeWidth={5} />
        <path d="M48 13 H72" strokeWidth={5} />
        <path d="M28 50 V104" strokeWidth={8} />
        <path d="M92 50 V104" strokeWidth={8} />
        <path d="M28 78 H92" strokeWidth={8} />
        <path d="M18 50 H38" strokeWidth={5} />
        <path d="M82 50 H102" strokeWidth={5} />
        <path d="M28 104 L16 114" strokeWidth={5} />
        <path d="M92 104 L104 114" strokeWidth={5} />
        <path d="M12 50 A48 48 0 0 1 108 50" strokeWidth={3.5} />
      </svg>
    );
  }

  if (style === "monograma") {
    return (
      <svg {...common}>
        <ellipse cx="60" cy="64" rx="46" ry="50" strokeWidth={3} />
        <path d="M78 30 C40 30 30 52 30 68 C30 90 50 104 76 96" strokeWidth={8} />
        <path d="M78 30 V100" strokeWidth={8} />
        <path d="M78 64 H46" strokeWidth={7} />
        <circle cx="60" cy="18" r="3" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (style === "geometrico") {
    return (
      <svg {...common}>
        <path d="M60 14 L96 102 H24 Z" strokeWidth={7} />
        <path d="M42 78 H78" strokeWidth={6} />
        <path d="M60 14 V42" strokeWidth={5} />
        <path d="M20 50 A44 44 0 0 1 100 50" strokeWidth={3.5} />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M60 10 L98 24 V62 C98 84 80 100 60 108 C40 100 22 84 22 62 V24 Z" strokeWidth={5} />
      <path d="M42 36 L42 28 L52 34 L60 22 L68 34 L78 28 L78 36 Z" strokeWidth={4} />
      <path d="M42 50 V88" strokeWidth={7} />
      <path d="M78 50 V88" strokeWidth={7} />
      <path d="M42 70 H78" strokeWidth={7} />
      <path d="M60 50 L50 70 L60 88 L70 70 Z" strokeWidth={3.5} />
    </svg>
  );
}
