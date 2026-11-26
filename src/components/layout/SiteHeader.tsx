import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";

const NAV_LINKS = [
  { href: "/disenar-hierro-ganadero", label: "Ganaderías" },
  { href: "/marca-personal-novilleros", label: "Novilleros" },
  { href: "/hierro-yeguada-pre", label: "Yeguadas" },
  { href: "/encargar-hierro-forjado", label: "Forja física" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-forge-paper/95 backdrop-blur-sm double-rule-b">
      <div className="flex h-[3px] w-full" aria-hidden>
        <span className="flex-1 bg-forge-grana" />
        <span className="flex-1 bg-forge-gold" />
      </div>
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="MI HIERRO, inicio" className="shrink-0">
          <Wordmark compact />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-forge-graphite transition hover:text-forge-grana"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/forjar"
            className="hidden items-center gap-2 rounded-[2px] bg-forge-ink px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-forge-paper transition hover:bg-forge-grana sm:inline-flex"
          >
            Forjar mi hierro
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>

          <details className="relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-[2px] border border-forge-border text-forge-ink">
              <span className="sr-only">Abrir menú</span>
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </span>
            </summary>
            <div className="absolute right-0 mt-3 w-64 rounded-[2px] border border-forge-border bg-forge-white p-4 shadow-md">
              <nav aria-label="Navegación móvil" className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-b border-forge-border/60 py-3 text-sm text-forge-ink last:border-0"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/forjar" className="mt-3 rounded-[2px] bg-forge-ink px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.1em] text-forge-paper">
                  Forjar mi hierro
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
