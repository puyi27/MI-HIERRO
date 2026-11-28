"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hammer, Infinity as InfinityIcon, Loader2, ShieldCheck } from "lucide-react";
import type { ActivePack } from "@/lib/store/types";

interface CurrentSession {
  userId: string;
  activePack: ActivePack;
  creditsLimit: number;
  creditsUsed: number;
  creditsRemaining: number | null;
  unlimited: boolean;
}

interface SessionPayload {
  user: CurrentSession;
  isAdmin: boolean;
}

const PACK_LABEL: Record<ActivePack, string> = {
  FREE: "Plan 0 €",
  PACK_999: "Pack 9,99 €",
  PACK_1990: "Pack 19,90 €",
  FORJA: "Forja Física",
};

export function AdminSessionPanel() {
  const [session, setSession] = useState<CurrentSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const read = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as SessionPayload | null;
        if (!active || !response.ok || !data) return;
        setSession(data.user);
        setIsAdmin(data.isAdmin);
      } catch {
        return;
      } finally {
        if (active) setReading(false);
      }
    };
    void read();
    return () => {
      active = false;
    };
  }, []);

  const toggleUnlimited = async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${session.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlimited: !session.unlimited }),
      });
      const data = (await response.json().catch(() => null)) as { user?: { unlimited: boolean }; error?: string } | null;
      if (!response.ok || !data?.user) {
        setError(data?.error ?? "No se pudo cambiar el modo infinito.");
        return;
      }
      const unlimited = data.user.unlimited;
      setSession((previous) => (previous ? { ...previous, unlimited, creditsRemaining: unlimited ? null : previous.creditsRemaining } : previous));
    } catch {
      setError("Sin conexión con el panel.");
    } finally {
      setBusy(false);
    }
  };

  const remaining = session?.unlimited ? null : (session?.creditsRemaining ?? 0);

  return (
    <section className="mt-6 border border-forge-border bg-forge-white" aria-label="Tu sesión actual">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forge-border bg-forge-stone/50 px-4 py-3">
        <p className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.16em] text-forge-graphite">
          <ShieldCheck className="h-3.5 w-3.5 text-forge-leather" aria-hidden />
          Tu sesión actual en este navegador
        </p>
        <span
          className={`border px-2 py-1 text-[0.55rem] uppercase tracking-[0.14em] ${
            session?.unlimited
              ? "border-forge-grana bg-forge-grana text-forge-paper"
              : "border-forge-border text-forge-graphite"
          }`}
        >
          {reading ? "Leyendo" : session?.unlimited ? "Generación infinita" : "Cupo de 2 diseños"}
        </span>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight text-forge-ink">
            {session ? (session.unlimited ? "Forja sin tope" : "Sesión con cupo") : "Leyendo tu sesión"}
          </p>
          <p className="mt-1 text-[0.62rem] leading-relaxed text-forge-graphite">
            {session ? (
              <>
                {PACK_LABEL[session.activePack]} · {session.creditsUsed}/{session.creditsLimit} créditos usados ·{" "}
                {remaining === null ? "sin límite" : `${remaining} restantes`} · sesión{" "}
                <span className="font-mono text-forge-leather">{session.userId.slice(0, 8)}</span>
              </>
            ) : (
              "Se crea al entrar en la fragua y se conserva 12 meses en este navegador."
            )}
          </p>
          {isAdmin ? (
            <p className="mt-2 text-[0.58rem] uppercase tracking-[0.14em] text-forge-grana">
              Cookie de administrador activa · /api/generate no consume cupo
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleUnlimited}
            disabled={busy || reading || !session}
            className="btn-ghost px-3 py-2 text-[0.62rem]"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <InfinityIcon className="h-3.5 w-3.5" aria-hidden />}
            {session?.unlimited ? "Desactivar infinito" : "Activar infinito"}
          </button>
          <Link href="/forjar" className="btn-primary px-3.5 py-2 text-[0.62rem]">
            <Hammer className="h-3.5 w-3.5" aria-hidden />
            Forjar hierro
          </Link>
        </div>
      </div>

      {error ? (
        <p role="alert" className="border-t border-forge-grana/40 bg-forge-grana/5 px-4 py-3 text-xs text-forge-grana">
          {error}
        </p>
      ) : null}

      <p className="border-t border-forge-border px-4 py-3 text-[0.6rem] leading-relaxed text-forge-graphite">
        Con cookie de administrador la fragua te trata siempre como generación infinita, sin consumir créditos ni cupo diario.
        Desactiva el infinito de esta sesión para comprobar el bloqueo en una ventana sin sesión de administrador.
      </p>
    </section>
  );
}
