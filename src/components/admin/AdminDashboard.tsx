import { Download, FileText, Hammer, Inbox } from "lucide-react";
import type { LeadRecord, OrderRecord, SimilarityRequestRecord } from "@/lib/store/types";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { ReportStatusControl } from "@/components/admin/ReportStatusControl";

interface AdminDashboardProps {
  orders: OrderRecord[];
  leads: LeadRecord[];
  reports: SimilarityRequestRecord[];
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
  return <p className="px-4 py-6 text-xs text-forge-muted">{message}</p>;
}

export function AdminDashboard({ orders, leads, reports, storeDriver, storeError }: AdminDashboardProps) {
  const paidOrders = orders.filter((order) => order.status === "paid");
  const revenue = paidOrders.reduce((total, order) => total + order.amountCents, 0);
  const openReports = reports.filter((report) => report.status !== "delivered").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Forge Ops</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-forge-ivory">Panel operativo</h1>
          <p className="mt-2 text-xs text-forge-muted">
            Almacén: <span className="text-forge-bronze">{storeDriver === "prisma" ? "Postgres / Neon" : "fichero local"}</span> ·
            Pedidos, informes y encargos en tiempo real.
          </p>
        </div>
        <AdminLogout />
      </div>

      {storeError ? (
        <div role="alert" className="mt-6 border border-[#6d3a2b] bg-[#251512] p-4 text-xs text-[#e6b4a1]">
          El almacén no responde: {storeError}. Revisa DATABASE_URL.
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="border border-forge-line bg-forge-surface p-5">
          <p className="eyebrow-muted">Ingresos cobrados</p>
          <p className="mt-2 font-display text-3xl text-forge-ivory">{euros(revenue)}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-forge-muted">{paidOrders.length} pedidos pagados</p>
        </div>
        <div className="border border-forge-line bg-forge-surface p-5">
          <p className="eyebrow-muted">Informes abiertos</p>
          <p className="mt-2 font-display text-3xl text-forge-ivory">{openReports}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-forge-muted">Pendientes o en revisión</p>
        </div>
        <div className="border border-forge-line bg-forge-surface p-5">
          <p className="eyebrow-muted">Leads de forja</p>
          <p className="mt-2 font-display text-3xl text-forge-ivory">{leads.length}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-forge-muted">Revisiones y encargos físicos</p>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-forge-bronze" aria-hidden />
          <h2 className="font-display text-xl tracking-wide text-forge-ivory">Informes de similitud</h2>
        </div>
        <div className="mt-4 overflow-x-auto border border-forge-line bg-forge-surface">
          {reports.length === 0 ? (
            <Empty message="Todavía no hay informes de similitud." />
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-forge-line text-[0.58rem] uppercase tracking-[0.18em] text-forge-muted">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Diseño</th>
                  <th className="px-4 py-3 font-semibold">Cambiar estado</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-forge-line/60 last:border-0">
                    <td className="px-4 py-3 text-forge-muted">{when(report.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="text-forge-ivory">{report.name ?? "Sin nombre"}</p>
                      <p className="mt-0.5 text-[0.62rem] text-forge-muted">{report.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="border border-forge-bronze/40 px-2 py-1 text-[0.55rem] uppercase tracking-[0.16em] text-forge-bronze">
                        {REPORT_LABEL[report.status] ?? report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {report.designId ? (
                        <a
                          href={`/api/admin/designs/${report.designId}/svg`}
                          className="inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-forge-bronze hover:text-forge-ivory"
                        >
                          <Download className="h-3 w-3" aria-hidden />
                          SVG maestro
                        </a>
                      ) : (
                        <span className="text-forge-muted">—</span>
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
          <Inbox className="h-4 w-4 text-forge-bronze" aria-hidden />
          <h2 className="font-display text-xl tracking-wide text-forge-ivory">Pedidos</h2>
        </div>
        <div className="mt-4 overflow-x-auto border border-forge-line bg-forge-surface">
          {orders.length === 0 ? (
            <Empty message="Todavía no hay pedidos." />
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-forge-line text-[0.58rem] uppercase tracking-[0.18em] text-forge-muted">
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
                  <tr key={order.id} className="border-b border-forge-line/60 last:border-0">
                    <td className="px-4 py-3 text-forge-muted">{when(order.createdAt)}</td>
                    <td className="px-4 py-3 text-forge-ivory">{PRODUCT_LABEL[order.product] ?? order.product}</td>
                    <td className="px-4 py-3 font-display text-sm text-forge-bronze">{euros(order.amountCents)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[0.58rem] uppercase tracking-[0.16em] ${
                          order.status === "paid" ? "text-forge-bronze" : "text-forge-muted"
                        }`}
                      >
                        {ORDER_STATUS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-forge-muted">{order.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {order.designId ? (
                        <a
                          href={`/api/admin/designs/${order.designId}/svg`}
                          className="inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-forge-bronze hover:text-forge-ivory"
                        >
                          <Download className="h-3 w-3" aria-hidden />
                          Descargar
                        </a>
                      ) : (
                        <span className="text-forge-muted">—</span>
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
          <Hammer className="h-4 w-4 text-forge-bronze" aria-hidden />
          <h2 className="font-display text-xl tracking-wide text-forge-ivory">Leads de revisión y forja</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {leads.length === 0 ? (
            <div className="border border-forge-line bg-forge-surface">
              <Empty message="Todavía no hay solicitudes." />
            </div>
          ) : (
            leads.map((lead) => (
              <article key={lead.id} className="border border-forge-line bg-forge-surface p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-base text-forge-ivory">{lead.name}</p>
                  <span className="text-[0.55rem] uppercase tracking-[0.16em] text-forge-bronze">
                    {lead.type === "forja" ? "Forja física" : "Revisión"}
                  </span>
                </div>
                <p className="mt-1 text-[0.62rem] text-forge-muted">
                  {lead.email}
                  {lead.phone ? ` · ${lead.phone}` : ""} · {when(lead.createdAt)}
                </p>
                <p className="mt-3 border-t border-forge-line pt-3 text-xs leading-relaxed text-forge-muted">{lead.message}</p>
                {lead.designId ? (
                  <a
                    href={`/api/admin/designs/${lead.designId}/svg`}
                    className="mt-3 inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-forge-bronze hover:text-forge-ivory"
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

      <p className="mt-10 border-t border-forge-line pt-5 text-[0.6rem] uppercase tracking-[0.2em] text-forge-muted/70">
        MI HIERRO propone y orienta · No certifica disponibilidad registral
      </p>
    </div>
  );
}
