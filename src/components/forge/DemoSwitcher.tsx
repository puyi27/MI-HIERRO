"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Hammer, ShieldCheck } from "lucide-react";
import type { DemoPackMode } from "@/components/forge/types";
import { isDemoSwitcherEnabled, isLocalBrowserHost } from "@/lib/demo-switcher";

interface DemoSwitcherProps {
  mode: DemoPackMode;
  onChange: (mode: DemoPackMode) => void;
}

const PACK_OPTIONS: Array<{ id: DemoPackMode; label: string; tag: string }> = [
  { id: "free", label: "Plan 0 €", tag: "Marca de agua" },
  { id: "premium", label: "Pack 9,99 €", tag: "ZIP desbloqueado" },
  { id: "similarity", label: "Pack 19,90 €", tag: "Similitud" },
  { id: "forja", label: "Forja Física", tag: "Taller" },
];

export function DemoSwitcher({ mode, onChange }: DemoSwitcherProps) {
  const [expanded, setExpanded] = useState(false);

  const envEnabled = isDemoSwitcherEnabled({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_DEMO_SWITCHER: process.env.NEXT_PUBLIC_DEMO_SWITCHER,
  });

  if (!envEnabled) return null;
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    !isLocalBrowserHost(window.location.hostname)
  ) {
    return null;
  }

  const current = PACK_OPTIONS.find((item) => item.id === mode) ?? PACK_OPTIONS[0];

  return (
    <aside
      aria-label="Conmutador local de packs"
      className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] rounded-[2px] border border-forge-border bg-forge-white p-1 shadow-sm"
    >
      <div className="border border-forge-border bg-forge-paper">
        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-forge-white"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-forge-grana" aria-hidden />
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-forge-ink">
              Demo local · {current.label}
            </span>
          </span>
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-forge-graphite" aria-hidden />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-forge-graphite" aria-hidden />
          )}
        </button>

        {expanded ? (
          <div className="grid grid-cols-2 gap-1.5 border-t border-forge-border bg-forge-white p-2 sm:w-64">
            {PACK_OPTIONS.map((option) => {
              const active = option.id === mode;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setExpanded(false);
                  }}
                  aria-pressed={active}
                  className={`rounded-[2px] border px-2.5 py-2 text-left transition ${
                    active
                      ? "border-forge-grana bg-forge-paper text-forge-grana"
                      : "border-forge-border bg-forge-white text-forge-ink hover:border-forge-leather"
                  }`}
                >
                  <span className="flex items-center justify-between gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em]">
                    <span>{option.label}</span>
                    {option.id === "forja" ? <Hammer className="h-3 w-3 shrink-0" aria-hidden /> : null}
                  </span>
                  <span className="mt-0.5 block text-[0.58rem] text-forge-graphite">{option.tag}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
