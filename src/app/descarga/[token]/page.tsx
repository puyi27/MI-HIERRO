import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock3, Download, ShieldAlert } from "lucide-react";
import { getStore } from "@/lib/store";
import { verifyDownloadToken } from "@/lib/security/tokens";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Descarga de tu hierro",
  robots: { index: false, follow: false },
};

export default async function DescargaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const verification = verifyDownloadToken(token);

  if (!verification.ok) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-6 py-20">
        <ShieldAlert className="h-10 w-10 text-forge-grana" aria-hidden />
        <h1 className="mt-6 font-display text-3xl tracking-wide text-forge-ink">Enlace no válido</h1>
        <p className="mt-4 text-sm leading-relaxed text-forge-graphite">
          Este enlace ha caducado o ha sido manipulado. Los enlaces de descarga tienen una validez de 72 horas. Si ya
          compraste el pack, escríbenos y lo regeneramos.
        </p>
        <Link href="/forjar" className="btn-ghost mt-8 w-fit">
          Volver a la fragua
        </Link>
      </main>
    );
  }

  const store = await getStore();
  const order = await store.getOrder(verification.payload.o);

  if (!order) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-24">
        <h1 className="font-display text-3xl text-forge-ink">Pedido no encontrado</h1>
        <p className="mt-4 text-sm text-forge-graphite">No localizamos este pedido. Contacta con nosotros si persiste.</p>
      </main>
    );
  }

  const design = order.designId ? await store.getDesign(order.designId) : null;
  const isPaid = order.status === "paid";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      <p className="eyebrow">MI HIERRO · Entrega privada</p>
      <h1 className="mt-4 font-display text-3xl text-forge-ink sm:text-4xl">
        {isPaid ? "Tu hierro está listo" : "Pago pendiente de confirmación"}
      </h1>

      <div className="mt-8 border border-forge-border bg-forge-white p-6 sm:p-8">
        <div className="flex items-center gap-3 text-sm text-forge-graphite">
          {isPaid ? (
            <CheckCircle2 className="h-5 w-5 text-forge-leather" aria-hidden />
          ) : (
            <Clock3 className="h-5 w-5 text-forge-leather" aria-hidden />
          )}
          <span>
            Pedido {order.id.slice(0, 8).toUpperCase()} · {order.product === "premium" ? "Pack Digital Premium" : "Informe de Similitud"}
          </span>
        </div>

        {design ? (
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src={`/api/preview?d=${design.id}&f=png`}
              alt={`Vista previa del hierro de ${design.firstName}`}
              width={180}
              height={180}
              className="h-40 w-40 border border-forge-border bg-forge-void object-contain"
            />
            <div className="space-y-1 text-sm text-forge-graphite">
              <p className="font-display text-xl tracking-wide text-forge-ink">
                {[design.firstName, design.lastName1, design.lastName2].filter(Boolean).join(" ")}
              </p>
              <p>Iniciales {design.initials} · Estilo {design.style}</p>
              {design.origin ? <p>Procedencia: {design.origin}</p> : null}
              <p>Legibilidad {design.scores.legibility} · Equilibrio {design.scores.balance}</p>
            </div>
          </div>
        ) : null}

        {isPaid && order.product === "premium" ? (
          <a href={`/api/descarga/${token}`} className="btn-primary mt-8">
            <Download className="h-4 w-4" aria-hidden />
            Descargar ZIP completo
          </a>
        ) : null}

        {isPaid && order.product === "similarity" ? (
          <div className="mt-6 border border-forge-border bg-forge-paper p-5 text-sm leading-relaxed text-forge-graphite">
            Tu informe entra en cola de revisión documental. La entrega orientativa es de 24 a 48 horas laborables por
            correo electrónico. El informe describe fuentes, coincidencias y limitaciones; no certifica disponibilidad
            registral.
          </div>
        ) : null}

        {!isPaid ? (
          <div className="mt-6 border border-forge-border bg-forge-paper p-5 text-sm leading-relaxed text-forge-graphite">
            Stripe todavía no ha confirmado el pago. Si acabas de pagar, espera unos segundos y recarga esta página.
          </div>
        ) : null}
      </div>

      <p className="mt-8 text-xs leading-relaxed text-forge-graphite">
        MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI. Referencia RD
        787/2023. Antes de fabricar o usar el hierro, solicita una revisión profesional.
      </p>
    </main>
  );
}
