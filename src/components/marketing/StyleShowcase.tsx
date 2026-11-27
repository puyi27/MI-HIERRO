import Image from "next/image";
import { STYLE_META, STYLE_TYPES, type ForgeStyle } from "@/types/forge";

const EXAMPLES: Record<ForgeStyle, { caption: string; image: string }> = {
  tradicional: {
    caption: "La estética histórica de la ganadería",
    image: "/images/styles/tradicional.png",
  },
  monograma: {
    caption: "Tus iniciales, una sola marca",
    image: "/images/styles/monograma.png",
  },
  geometrico: {
    caption: "Trazos simples, gran identidad",
    image: "/images/styles/geometrico.png",
  },
  heraldico: {
    caption: "La fuerza de un símbolo propio",
    image: "/images/styles/heraldico.png",
  },
};

export function StyleShowcase() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {STYLE_TYPES.map((style, index) => {
        const meta = STYLE_META[style];
        const example = EXAMPLES[style];
        return (
          <article key={style} className="panel relative overflow-hidden p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="numeral text-sm">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-lg tracking-[0.08em] text-forge-ink sm:text-xl">{meta.label}</h3>
              </div>
              <span className="border border-forge-border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-forge-graphite">
                Lámina real
              </span>
            </div>

            <div className="mt-6 flex h-44 items-center justify-center sm:h-52">
              <Image
                src={example.image}
                alt={`Hierro real de estilo ${meta.label.toLowerCase()}`}
                width={320}
                height={320}
                sizes="(max-width: 640px) 144px, 176px"
                className="h-36 w-36 object-contain sm:h-44 sm:w-44"
              />
            </div>

            <p className="mt-6 border-t border-forge-border pt-4 text-center text-xs text-forge-graphite">
              {example.caption}
            </p>
          </article>
        );
      })}
    </div>
  );
}
