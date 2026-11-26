"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Field } from "@/components/ui/Field";

interface AdminLoginProps {
  localFallback: boolean;
}

export function AdminLogin({ localFallback }: AdminLoginProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "No se pudo iniciar sesión.",
        );
        return;
      }
      setPassword("");
      router.refresh();
    } catch {
      setError("No hay conexión con el servidor.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-5 py-16 sm:py-24">
      <p className="eyebrow">Forge Ops</p>
      <h1 className="mt-4 font-display text-3xl leading-tight text-forge-ink">Panel operativo</h1>
      <p className="mt-3 text-sm leading-relaxed text-forge-graphite">
        Acceso reservado. Desde aquí se revisan pedidos, informes de similitud y encargos de forja física.
      </p>

      <form onSubmit={submit} className="mt-8 border border-forge-border bg-forge-white p-5">
        <Field
          id="adminPassword"
          label="Contraseña"
          value={password}
          onChange={setPassword}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        {error ? (
          <p role="alert" className="mt-3 text-xs text-forge-grana">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
          {busy ? "Comprobando" : "Entrar al panel"}
        </button>

        {localFallback ? (
          <p className="mt-4 border-t border-forge-border pt-4 text-[0.65rem] leading-relaxed text-forge-graphite">
            Sin ADMIN_PASSWORD configurada. En local la contraseña de desarrollo es <span className="font-semibold text-forge-leather">mi-hierro-local-admin</span>.
          </p>
        ) : null}
      </form>

      <p className="mt-6 text-[0.6rem] uppercase tracking-[0.18em] text-forge-graphite">
        MI HIERRO · Acceso restringido · noindex
      </p>
    </div>
  );
}
