"use client";

import { useState } from "react";
import { Infinity as InfinityIcon, Loader2, Plus, RefreshCw, RotateCcw, UserPlus } from "lucide-react";
import type { ActivePack, ForgeUserRecord } from "@/lib/store/types";

interface AdminDesign {
  id: string;
  initials: string;
  style: string;
  createdAt: string;
}

export type AdminUser = ForgeUserRecord & { designs: AdminDesign[] };

interface UsersPackPanelProps {
  initialUsers: AdminUser[];
}

const PACKS: Array<{ value: ActivePack; label: string }> = [
  { value: "FREE", label: "Plan 0 €" },
  { value: "PACK_999", label: "Pack 9,99 €" },
  { value: "PACK_1990", label: "Pack 19,90 €" },
  { value: "FORJA", label: "Forja Física" },
];

const packLabel = (pack: ActivePack) => PACKS.find((item) => item.value === pack)?.label ?? pack;

function when(value: string): string {
  return new Date(value).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

export function UsersPackPanel({ initialUsers }: UsersPackPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    activePack: "FREE" as ActivePack,
    creditsLimit: "2",
    unlimited: false,
  });

  const patchUser = async (id: string, body: Record<string, unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "No se pudo actualizar el usuario.",
        );
        return;
      }
      const updated = (data as { user: ForgeUserRecord }).user;
      setUsers((previous) =>
        previous.map((user) => (user.id === updated.id ? { ...updated, designs: user.designs } : user)),
      );
    } catch {
      setError("Sin conexión con el panel.");
    } finally {
      setBusyId(null);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as { users?: AdminUser[]; error?: string } | null;
      if (!response.ok || !data?.users) {
        setError(data?.error ?? "No se pudo leer la lista de sesiones.");
        return;
      }
      setUsers(data.users);
    } catch {
      setError("Sin conexión con el panel.");
    } finally {
      setRefreshing(false);
    }
  };

  const createUser = async () => {
    setCreating(true);
    setError(null);
    setCreatedToken(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim() || undefined,
          email: form.email.trim() || undefined,
          activePack: form.activePack,
          creditsLimit: Number(form.creditsLimit) || 0,
          unlimited: form.unlimited,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "No se pudo crear el usuario.",
        );
        return;
      }
      const created = (data as { user: ForgeUserRecord; sessionToken: string }).user;
      setUsers((previous) => [{ ...created, designs: [] }, ...previous]);
      const payload = data as { sessionToken: string; sessionCookie?: string };
      setCreatedToken(payload.sessionCookie ?? payload.sessionToken);
      setForm({ name: "", email: "", activePack: "FREE", creditsLimit: "2", unlimited: false });
    } catch {
      setError("Sin conexión con el panel.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Clientes y cupos</p>
          <h2 className="mt-2 font-display text-2xl tracking-wide text-forge-ink">Usuarios y Packs</h2>
          <p className="mt-1 text-xs text-forge-graphite">
            Activa generación infinita, cambia el pack o reparte créditos sin tocar la base de datos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="border border-forge-border bg-forge-white px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-forge-graphite">
            {users.length} sesiones registradas
          </p>
          <button
            type="button"
            onClick={refreshUsers}
            disabled={refreshing}
            className="btn-ghost px-2.5 py-1.5 text-[0.6rem]"
          >
            {refreshing ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <RefreshCw className="h-3 w-3" aria-hidden />}
            Actualizar
          </button>
        </div>
      </div>

      {error ? (
        <div role="alert" className="mt-4 border border-forge-grana/40 bg-forge-grana/5 p-3 text-xs text-forge-grana">
          {error}
        </div>
      ) : null}

      <div className="mt-5 border border-forge-border bg-forge-white">
        <div className="border-b border-forge-border bg-forge-stone/50 px-4 py-3">
          <p className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.16em] text-forge-graphite">
            <UserPlus className="h-3.5 w-3.5 text-forge-leather" aria-hidden />
            Nueva sesión VIP o de pruebas
          </p>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-12">
          <label className="md:col-span-3">
            <span className="mb-1 block text-[0.58rem] uppercase tracking-[0.14em] text-forge-graphite">Nombre</span>
            <input
              value={form.name}
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
              className="w-full border border-forge-border bg-forge-paper px-2.5 py-2 text-xs text-forge-ink"
              placeholder="Cliente VIP"
            />
          </label>
          <label className="md:col-span-3">
            <span className="mb-1 block text-[0.58rem] uppercase tracking-[0.14em] text-forge-graphite">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
              className="w-full border border-forge-border bg-forge-paper px-2.5 py-2 text-xs text-forge-ink"
              placeholder="cliente@mihierro.es"
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-[0.58rem] uppercase tracking-[0.14em] text-forge-graphite">Pack</span>
            <select
              value={form.activePack}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, activePack: event.target.value as ActivePack }))
              }
              className="w-full border border-forge-border bg-forge-paper px-2 py-2 text-xs text-forge-ink"
            >
              {PACKS.map((pack) => (
                <option key={pack.value} value={pack.value}>
                  {pack.label}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-[0.58rem] uppercase tracking-[0.14em] text-forge-graphite">Créditos</span>
            <input
              type="number"
              min={0}
              max={10000}
              value={form.creditsLimit}
              onChange={(event) => setForm((previous) => ({ ...previous, creditsLimit: event.target.value }))}
              className="w-full border border-forge-border bg-forge-paper px-2.5 py-2 text-xs text-forge-ink"
            />
          </label>
          <div className="flex items-end gap-2 md:col-span-2">
            <label className="flex flex-1 items-center gap-2 pb-2 text-[0.62rem] text-forge-graphite">
              <input
                type="checkbox"
                checked={form.unlimited}
                onChange={(event) => setForm((previous) => ({ ...previous, unlimited: event.target.checked }))}
                className="h-3.5 w-3.5 accent-forge-grana"
              />
              Infinito
            </label>
            <button type="button" onClick={createUser} disabled={creating} className="btn-ghost px-3 py-2 text-[0.6rem]">
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : "Crear"}
            </button>
          </div>
        </div>
        {createdToken ? (
          <p className="border-t border-forge-border px-4 py-3 text-[0.6rem] text-forge-graphite">
            Cookie de sesión VIP (mi_hierro_session): <span className="ml-1 break-all font-mono text-forge-grana">{createdToken}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {users.length === 0 ? (
          <p className="border border-forge-border bg-forge-white px-4 py-6 text-xs text-forge-graphite">
            Todavía no hay sesiones registradas. Se crean al entrar en /forjar o al llamar a /api/session.
          </p>
        ) : (
          users.map((user) => {
            const busy = busyId === user.id;
            const remaining = user.unlimited ? null : Math.max(0, user.creditsLimit - user.creditsUsed);
            return (
              <article key={user.id} className="border border-forge-border bg-forge-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base text-forge-ink">{user.name ?? "Sesión sin nombre"}</p>
                    <p className="mt-0.5 truncate text-[0.62rem] text-forge-graphite">
                      {user.email ?? "sin email"} · {when(user.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 border px-2 py-1 text-[0.55rem] uppercase tracking-[0.14em] ${
                      user.unlimited
                        ? "border-forge-grana/50 bg-forge-grana/5 text-forge-grana"
                        : "border-forge-border text-forge-graphite"
                    }`}
                  >
                    {user.unlimited ? "Infinito" : packLabel(user.activePack)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 divide-x divide-forge-border border border-forge-border text-center">
                  <div className="px-2 py-2">
                    <p className="text-[0.52rem] uppercase tracking-[0.12em] text-forge-graphite">Pack</p>
                    <p className="mt-0.5 text-[0.68rem] font-semibold text-forge-ink">{packLabel(user.activePack)}</p>
                  </div>
                  <div className="px-2 py-2">
                    <p className="text-[0.52rem] uppercase tracking-[0.12em] text-forge-graphite">Créditos</p>
                    <p className="mt-0.5 text-[0.68rem] font-semibold text-forge-ink">
                      {user.creditsUsed}/{user.creditsLimit}
                    </p>
                  </div>
                  <div className="px-2 py-2">
                    <p className="text-[0.52rem] uppercase tracking-[0.12em] text-forge-graphite">Diseños</p>
                    <p className="mt-0.5 text-[0.68rem] font-semibold text-forge-ink">{user.designs.length}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    value={user.activePack}
                    onChange={(event) => patchUser(user.id, { activePack: event.target.value })}
                    disabled={busy}
                    aria-label={`Pack de ${user.name ?? "la sesión"}`}
                    className="border border-forge-border bg-forge-paper px-2 py-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-forge-ink"
                  >
                    {PACKS.map((pack) => (
                      <option key={pack.value} value={pack.value}>
                        {pack.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => patchUser(user.id, { addCredits: 5 })}
                    disabled={busy}
                    className="btn-ghost px-2.5 py-1.5 text-[0.6rem]"
                  >
                    <Plus className="h-3 w-3" aria-hidden />5
                  </button>
                  <button
                    type="button"
                    onClick={() => patchUser(user.id, { addCredits: 10 })}
                    disabled={busy}
                    className="btn-ghost px-2.5 py-1.5 text-[0.6rem]"
                  >
                    <Plus className="h-3 w-3" aria-hidden />10
                  </button>
                  <button
                    type="button"
                    onClick={() => patchUser(user.id, { resetCredits: true })}
                    disabled={busy}
                    className="btn-ghost px-2.5 py-1.5 text-[0.6rem]"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => patchUser(user.id, { unlimited: !user.unlimited })}
                    disabled={busy}
                    className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.12em] transition ${
                      user.unlimited
                        ? "border-forge-grana bg-forge-grana text-forge-white"
                        : "border-forge-border text-forge-graphite hover:border-forge-grana hover:text-forge-grana"
                    }`}
                  >
                    {busy ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <InfinityIcon className="h-3 w-3" aria-hidden />}
                    {user.unlimited ? "Quitar infinito" : "Generación infinita"}
                  </button>
                </div>

                <p className="mt-3 text-[0.6rem] text-forge-graphite">
                  {user.unlimited
                    ? "Modo infinito activo: sin tope de generaciones."
                    : `Le quedan ${remaining} generaciones en este pack.`}
                </p>

                {user.designs.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {user.designs.slice(0, 8).map((design) => (
                      <li
                        key={design.id}
                        className="border border-forge-border px-1.5 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-forge-graphite"
                      >
                        {design.initials} · {design.style}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
