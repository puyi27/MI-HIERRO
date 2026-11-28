"use client";

import { useState } from "react";
import { Download, FileText, Hammer, Inbox, Users } from "lucide-react";
import type { LeadRecord, OrderRecord, SimilarityRequestRecord } from "@/lib/store/types";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { ReportStatusControl } from "@/components/admin/ReportStatusControl";
import { UsersPackPanel, type AdminUser } from "@/components/admin/UsersPackPanel";
import { AdminSessionPanel } from "@/components/admin/AdminSessionPanel";

interface AdminDashboardProps {
  orders: OrderRecord[];
  leads: LeadRecord[];
  reports: SimilarityRequestRecord[];
  users: AdminUser[];
  storeDriver: string;
  storeError: string | null;
}

const ORDER_STATUS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
  refunded: "Devuelto",
};

const PRODUCT_LABEL: Record<string, string> = {
  premium: "Pack Digital",
  similarity: "Informe",
};

const REPORT_LABEL: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En revisión",
  delivered: "Enviado",
  cancelled: "Cancelado",
};

function euros(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

function when(value: string): string {
  return new Date(value).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

function Empty({ message }: { message: string }) {
  return <p className="px-4 py-6 text-xs text-forge-graphite">{message}</p>;
}

export function AdminDashboard({ orders, leads, reports, users, storeDriver, storeError }: AdminDashboardProps) {
  const [tab, setTab] = useState<"ops" | "users">("ops");
  const paidOrders = orders.filter((order) => order.status === "paid");
  const revenue = paidOrders.reduce((total, order) => total + order.amountCents, 0);
  const openReports = reports.filter((report) => report.status !== "delivered").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Forge Ops</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-forge-ink">Panel operativo</h1>
          <p className="mt-2 text-xs text-forge-graphite">
            Almacén: <span className="font-semibold text-forge-leather">{storeDriver === "prisma" ? "Postgres / Neon" : "fichero local"}</span> ·
            Pedidos, informes y encargos en tiempo real.
          </p>
        </div>
        <AdminLogout />
      </div>

      <AdminSessionPanel />

      {storeError ? (
        <div role="alert" className="mt-6 border border-forge-grana/40 bg-forge-grana/5 p-4 text-xs text-forge-grana">
          El almacén no responde: {storeError}. Revisa DATABASE_URL.
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-forge-border" role="tablist" aria-label="Secciones del panel">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "ops"}
          onClick={() => setTab("ops")}
          className={`-mb-px border-b-2 px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] transition ${
            tab === "ops" ? "border-forge-grana text-forge-grana" : "border-transparent text-forge-graphite hover:text-forge-ink"
          }`}
        >
          Operativa
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "users"}
          onClick={() => setTab("users")}
          className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] transition ${
            tab === "users" ? "border-forge-grana text-forge-grana" : "border-transparent text-forge-graphite hover:text-forge-ink"
          }`}
        >
          <Users className="h-3.5 w-3.5" aria-hidden />
          Usuarios y Packs
        </button>
      </div>

      {tab === "users" ? (
        <UsersPackPanel initialUsers={users} />
      ) : (
        <>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="border border-forge-border bg-forge-white p-5">
          <p className="eyebrow-muted">Ingresos cobrados</p>
          <p className="mt-2 font-display text-3xl text-forge-ink">{euros(revenue)}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.16em] text-forge-graphite">{paidOrders.length} pedidos pagados</p>
        </div>
        <div className="border border-forge-border bg-forge-white p-5">
          <p className="eyebrow-muted">Informes abiertos</p>
          <p className="mt-2 font-display text-3xl text-forge-ink">{openReports}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.16em] text-forge-graphite">Pendientes o en revisión</p>
        </div>
        <div className="border border-forge-border bg-forge-white p-5">
          <p className="eyebrow-muted">Leads de forja</p>
          <p className="mt-2 font-display text-3xl text-forge-ink">{leads.length}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.16em] text-forge-graphite">Revisiones y encargos físicos</p>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-forge-leather" aria-hidden />
          <h2 className="font-display text-xl tracking-wide text-forge-ink">Informes de similitud</h2>
        </div>
        <div className="mt-4 overflow-x-auto border border-forge-border bg-forge-white">
          {reports.length === 0 ? (
            <Empty message="Todavía no hay informes de similitud." />
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-forge-border bg-forge-stone/50 text-[0.58rem] uppercase tracking-[0.16em] text-forge-graphite">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Diseño</th>
                  <th className="px-4 py-3 font-semibold">Cambiar estado</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-forge-border/60 last:border-0">
                    <td className="px-4 py-3 text-forge-graphite">{when(report.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-forge-ink">{report.name ?? "Sin nombre"}</p>
                      <p className="mt-0.5 text-[0.62rem] text-forge-graphite">{report.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="border border-forge-border px-2 py-1 text-[0.55rem] uppercase tracking-[0.14em] text-forge-leather">
                        {REPORT_LABEL[report.status] ?? report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {report.designId ? (
                        <a
                          href={`/api/admin/designs/${report.designId}/svg`}
                          className="inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-forge-grana hover:underline"
                        >
                          <Download className="h-3 w-3" aria-hidden />
                          SVG maestro
                        </a>
                      ) : (
                        <span className="text-forge-graphite">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ReportStatusControl id={report.id} status={report.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-forge-leather" aria-hidden />
          <h2 className="font-display text-xl tracking-wide text-forge-ink">Pedidos</h2>
        </div>
        <div className="mt-4 overflow-x-auto border border-forge-border bg-forge-white">
          {orders.length === 0 ? (
            <Empty message="Todavía no hay pedidos." />
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-forge-border bg-forge-stone/50 text-[0.58rem] uppercase tracking-[0.16em] text-forge-graphite">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Importe</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Maestro</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-forge-border/60 last:border-0">
                    <td className="px-4 py-3 text-forge-graphite">{when(order.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-forge-ink">{PRODUCT_LABEL[order.product] ?? order.product}</td>
                    <td className="px-4 py-3 font-display text-sm text-forge-leather">{euros(order.amountCents)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[0.58rem] uppercase tracking-[0.14em] ${
                          order.status === "paid" ? "font-semibold text-forge-grana" : "text-forge-graphite"
                        }`}
                      >
                        {ORDER_STATUS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-forge-graphite">{order.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {order.designId ? (
                        <a
                          href={`/api/admin/designs/${order.designId}/svg`}
                          className="inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-forge-grana hover:underline"
                        >
                          <Download className="h-3 w-3" aria-hidden />
                          Descargar
                        </a>
                      ) : (
                        <span className="text-forge-graphite">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Hammer className="h-4 w-4 text-forge-leather" aria-hidden />
          <h2 className="font-display text-xl tracking-wide text-forge-ink">Leads de revisión y forja</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {leads.length === 0 ? (
            <div className="border border-forge-border bg-forge-white">
              <Empty message="Todavía no hay solicitudes." />
            </div>
          ) : (
            leads.map((lead) => (
              <article key={lead.id} className="border border-forge-border bg-forge-white p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-base text-forge-ink">{lead.name}</p>
                  <span className="text-[0.55rem] uppercase tracking-[0.14em] text-forge-grana">
                    {lead.type === "forja" ? "Forja física" : "Revisión"}
                  </span>
                </div>
                <p className="mt-1 text-[0.62rem] text-forge-graphite">
                  {lead.email}
                  {lead.phone ? ` · ${lead.phone}` : ""} · {when(lead.createdAt)}
                </p>
                <p className="mt-3 border-t border-forge-border pt-3 text-xs leading-relaxed text-forge-graphite">{lead.message}</p>
                {lead.designId ? (
                  <a
                    href={`/api/admin/designs/${lead.designId}/svg`}
                    className="mt-3 inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-forge-grana hover:underline"
                  >
                    <Download className="h-3 w-3" aria-hidden />
                    SVG del expediente
                  </a>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

        </>
      )}

      <p className="mt-10 border-t border-forge-border pt-5 text-[0.6rem] uppercase tracking-[0.18em] text-forge-graphite">
        MI HIERRO propone y orienta · No certifica disponibilidad registral
      </p>
    </div>
  );
}
