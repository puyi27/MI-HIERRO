"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En revisión" },
  { value: "delivered", label: "Enviado" },
];

interface ReportStatusControlProps {
  id: string;
  status: string;
}

export function ReportStatusControl({ id, status }: ReportStatusControlProps) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: value }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "No se pudo actualizar.",
        );
        return;
      }
      router.refresh();
    } catch {
      setError("Sin conexión.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor={`report-status-${id}`} className="sr-only">
          Estado del informe
        </label>
        <select
          id={`report-status-${id}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="border border-forge-border bg-forge-white px-2 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-forge-ink"
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={save}
          disabled={busy || value === status}
          className="border border-forge-border bg-forge-paper px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-forge-grana transition hover:border-forge-grana disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : "Guardar"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-[0.6rem] text-forge-grana">
          {error}
        </p>
      ) : null}
    </div>
  );
}
