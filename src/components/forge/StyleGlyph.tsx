import Image from "next/image";
import type { ForgeStyle } from "@/types/forge";

const STYLE_SAMPLE: Record<ForgeStyle, string> = {
  tradicional: "/images/styles/tradicional.png",
  monograma: "/images/styles/monograma.png",
  geometrico: "/images/styles/geometrico.png",
  heraldico: "/images/styles/heraldico.png",
};

interface StyleGlyphProps {
  style: ForgeStyle;
  className?: string;
}

export function StyleGlyph({ style, className }: StyleGlyphProps) {
  return (
    <Image
      src={STYLE_SAMPLE[style]}
      alt=""
      aria-hidden
      width={320}
      height={320}
      sizes="(max-width: 768px) 112px, 160px"
      data-style-glyph={style}
      className={`object-contain ${className ?? ""}`}
    />
  );
}
