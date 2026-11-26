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
      className="inline-flex items-center gap-2 border border-forge-border bg-forge-white px-3 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-forge-graphite transition hover:border-forge-grana hover:text-forge-grana disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden />
      Salir
    </button>
  );
}
