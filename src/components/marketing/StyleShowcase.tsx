import { STYLE_META, STYLE_TYPES } from "@/types/forge";
import { StyleGlyph } from "@/components/forge/StyleGlyph";

const CAPTIONS: Record<string, string> = {
  tradicional: "La estética histórica de la ganadería",
  monograma: "Tus iniciales, una sola marca",
  geometrico: "Trazos simples, gran identidad",
  heraldico: "La fuerza de un símbolo propio",
};

export function StyleShowcase() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {STYLE_TYPES.map((style, index) => {
        const meta = STYLE_META[style];
        return (
          <article key={style} className="panel relative overflow-hidden p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="numeral text-sm">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-lg tracking-[0.08em] text-forge-ink sm:text-xl">{meta.label}</h3>
              </div>
            </div>

            <div className="mt-6 flex h-44 items-center justify-center sm:h-52">
              <StyleGlyph style={style} className="h-36 w-36 text-forge-ink/80 sm:h-40 sm:w-40" />
            </div>

            <p className="mt-6 border-t border-forge-border pt-4 text-center text-xs text-forge-graphite">
              {CAPTIONS[style]}
            </p>
          </article>
        );
      })}
    </div>
  );
}
