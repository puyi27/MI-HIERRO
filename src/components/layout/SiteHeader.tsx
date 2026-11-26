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
    <header className="sticky top-0 z-40 border-b border-forge-line bg-forge-void/92 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="MI HIERRO, inicio" className="shrink-0">
          <Wordmark compact />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-forge-muted transition hover:text-forge-ivory"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/forjar"
            className="hidden items-center gap-2 bg-forge-bronze px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-forge-void transition hover:bg-forge-ivory sm:inline-flex"
          >
            Forjar mi hierro
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>

          <details className="relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center border border-forge-line text-forge-ivory">
              <span className="sr-only">Abrir menú</span>
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </span>
            </summary>
            <div className="absolute right-0 mt-3 w-64 border border-forge-line bg-forge-surface p-4 shadow-2xl">
              <nav aria-label="Navegación móvil" className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-b border-forge-line/60 py-3 text-sm text-forge-ivory last:border-0"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/forjar" className="mt-3 bg-forge-bronze px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-forge-void">
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
