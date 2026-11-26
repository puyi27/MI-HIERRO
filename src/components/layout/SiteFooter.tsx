import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-forge-line bg-forge-surface/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-forge-muted">
              Forja digital de hierros ganaderos, marcas personales de novilleros y emblemas de yeguada PRE. Diseño
              orientativo, entrega vectorial y revisión humana cuando importa.
            </p>
          </div>

          <div>
            <p className="eyebrow-muted">Diseñar</p>
            <ul className="mt-4 space-y-2 text-sm text-forge-muted">
              <li><Link className="transition hover:text-forge-ivory" href="/forjar?perfil=ganaderia">Hierro de ganadería</Link></li>
              <li><Link className="transition hover:text-forge-ivory" href="/forjar?perfil=novillero">Marca de novillero</Link></li>
              <li><Link className="transition hover:text-forge-ivory" href="/forjar?perfil=particular">Finca particular</Link></li>
              <li><Link className="transition hover:text-forge-ivory" href="/forjar">Forjar mi hierro</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow-muted">Guías</p>
            <ul className="mt-4 space-y-2 text-sm text-forge-muted">
              <li><Link className="transition hover:text-forge-ivory" href="/disenar-hierro-ganadero">Diseñar hierro ganadero</Link></li>
              <li><Link className="transition hover:text-forge-ivory" href="/marca-personal-novilleros">Marca para novilleros</Link></li>
              <li><Link className="transition hover:text-forge-ivory" href="/hierro-yeguada-pre">Hierro de yeguada PRE</Link></li>
              <li><Link className="transition hover:text-forge-ivory" href="/encargar-hierro-forjado">Encargar hierro forjado</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow-muted">Legal</p>
            <ul className="mt-4 space-y-2 text-sm text-forge-muted">
              <li><Link className="transition hover:text-forge-ivory" href="/aviso-legal">Aviso legal</Link></li>
              <li><Link className="transition hover:text-forge-ivory" href="/privacidad">Privacidad y RGPD</Link></li>
              <li><Link className="transition hover:text-forge-ivory" href="/alcance-registral">Alcance registral</Link></li>
              <li><a className="transition hover:text-forge-ivory" href="mailto:hola@mihierro.es">hola@mihierro.es</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border border-forge-line/70 p-5 text-xs leading-relaxed text-forge-muted">
          MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI. Las propuestas son
          orientativas y no constituyen asesoramiento jurídico ni garantía de registro. Referencia normativa: RD
          787/2023. Las tarifas mostradas son orientativas para validar el mercado.
        </div>

        <p className="mt-8 text-[0.68rem] uppercase tracking-[0.28em] text-forge-muted">
          © {new Date().getFullYear()} MI HIERRO · Forja tu legado
        </p>
      </div>
    </footer>
  );
}
