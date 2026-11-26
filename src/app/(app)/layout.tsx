import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-forge-line">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="MI HIERRO, inicio">
            <Wordmark compact />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-forge-muted transition hover:text-forge-ivory"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Volver al inicio
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-forge-line px-5 py-6 text-center text-[0.6rem] uppercase tracking-[0.22em] text-forge-muted/80">
        MI HIERRO propone y orienta · No certifica disponibilidad registral
      </footer>
    </div>
  );
}
