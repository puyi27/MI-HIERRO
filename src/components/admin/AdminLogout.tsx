"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="inline-flex items-center gap-2 border border-forge-line px-3 py-2 text-[0.6rem] uppercase tracking-[0.18em] text-forge-muted transition hover:border-forge-bronze hover:text-forge-ivory disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden />
      Salir
    </button>
  );
}
