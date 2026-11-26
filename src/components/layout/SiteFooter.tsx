import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-forge-gold bg-forge-ink text-forge-paper">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark inverted />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-forge-paper/75">
              Taller digital de hierros ganaderos, marcas de novilleros y emblemas de yeguada PRE. Discreción absoluta en cada boceto.
            </p>
          </div>

          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-forge-gold">Diseñar</p>
            <ul className="mt-4 space-y-2 text-sm text-forge-paper/75">
              <li><Link className="transition hover:text-forge-paper" href="/forjar?perfil=ganaderia">Hierro de ganadería</Link></li>
              <li><Link className="transition hover:text-forge-paper" href="/forjar?perfil=novillero">Marca de novillero</Link></li>
              <li><Link className="transition hover:text-forge-paper" href="/forjar?perfil=particular">Finca particular</Link></li>
              <li><Link className="transition hover:text-forge-paper" href="/forjar">Forjar mi hierro</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-forge-gold">Guías</p>
            <ul className="mt-4 space-y-2 text-sm text-forge-paper/75">
              <li><Link className="transition hover:text-forge-paper" href="/disenar-hierro-ganadero">Diseñar hierro ganadero</Link></li>
              <li><Link className="transition hover:text-forge-paper" href="/marca-personal-novilleros">Marca para novilleros</Link></li>
              <li><Link className="transition hover:text-forge-paper" href="/hierro-yeguada-pre">Hierro de yeguada PRE</Link></li>
              <li><Link className="transition hover:text-forge-paper" href="/encargar-hierro-forjado">Encargar hierro forjado</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-forge-gold">Legal</p>
            <ul className="mt-4 space-y-2 text-sm text-forge-paper/75">
              <li><Link className="transition hover:text-forge-paper" href="/aviso-legal">Aviso legal</Link></li>
              <li><Link className="transition hover:text-forge-paper" href="/privacidad">Privacidad y RGPD</Link></li>
              <li><Link className="transition hover:text-forge-paper" href="/alcance-registral">Alcance registral</Link></li>
              <li><a className="transition hover:text-forge-paper" href="mailto:hola@mihierro.es">hola@mihierro.es</a></li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-forge-paper/15 pt-6 text-xs leading-relaxed text-forge-paper/70">
          MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI. Referencia: RD 787/2023.{" "}
          <Link href="/alcance-registral" className="text-forge-gold underline underline-offset-2">Alcance registral</Link>
        </p>

        <p className="mt-4 text-[0.68rem] uppercase tracking-[0.18em] text-forge-paper/55">
          © {new Date().getFullYear()} MI HIERRO · Taller de forja digital
        </p>
      </div>
    </footer>
  );
}
