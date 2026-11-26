import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-forge-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="MI HIERRO, inicio">
            <Wordmark compact />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/forjar"
              className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.12em] text-forge-leather transition hover:text-forge-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Nuevo diseño
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.12em] text-forge-graphite transition hover:text-forge-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Inicio
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-forge-border px-5 py-6 text-center text-xs text-forge-graphite">
        MI HIERRO propone y orienta · No certifica disponibilidad registral
      </footer>
    </div>
  );
}
