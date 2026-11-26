import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Hammer } from "lucide-react";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PlanGrid } from "@/components/marketing/PlanGrid";
import { FaqList } from "@/components/marketing/FaqList";
import { LegalNotice } from "@/components/layout/LegalNotice";
import { Emblem } from "@/components/brand/Emblem";

export const metadata: Metadata = {
  title: "Encargar hierro forjado",
  description:
    "Del diseño digital a la pieza física: forja de hierro ganadero a presupuesto, con revisión previa de similitud y archivo vectorial preparado para taller.",
  alternates: { canonical: "/encargar-hierro-forjado" },
  openGraph: {
    title: "Encargar hierro forjado · MI HIERRO",
    description: "Diseño, revisión y forja física con presupuesto a medida.",
    url: "/encargar-hierro-forjado",
  },
};

export default function ForjaFisicaLanding() {
  return (
    <>
      <section className="border-b border-forge-line">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">De la pantalla al taller</p>
            <h1 className="mt-5 font-display text-[2.5rem] leading-[1.05] text-forge-ivory sm:text-5xl">
              Encargar hierro forjado,
              <span className="font-editorial italic text-forge-bronze"> con criterio previo.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-forge-muted sm:text-base">
              Diseñamos el hierro, comprobamos su lectura y lo dejamos listo para taller. La forja física se presupuesta
              caso por caso: medidas, grosor, acabado y uso previsto. Sin compromiso hasta validar la pieza y la
              viabilidad.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/forjar?perfil=particular" className="btn-primary">
                Diseñar y pedir presupuesto
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="#servicios" className="btn-ghost">Ver servicios</Link>
            </div>
            <LegalNotice variant="full" className="mt-8" />
          </div>

          <div className="relative mx-auto w-full max-w-sm self-center">
            <div className="absolute inset-0 -translate-x-3 -translate-y-3 border border-forge-line" aria-hidden />
            <div className="grain panel relative p-8 text-center">
              <Hammer className="mx-auto h-6 w-6 text-forge-bronze" aria-hidden />
              <Emblem className="mx-auto mt-8 h-36 w-36 text-forge-bronze" />
              <p className="mt-8 font-display text-lg tracking-[0.24em] text-forge-ivory">FORJA A MEDIDA</p>
              <div className="rule my-5" />
              <p className="text-[0.62rem] uppercase leading-relaxed tracking-[0.2em] text-forge-muted">
                Presupuesto tras revisión
                <br />
                Sin pago inicial de fabricación
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Servicios</p>
        <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Tres formas de llevarlo al hierro</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="panel p-6">
            <p className="numeral text-sm">01</p>
            <h3 className="mt-3 font-display text-lg text-forge-ivory">Archivo para tu taller</h3>
            <p className="mt-2 text-sm leading-relaxed text-forge-muted">
              Pack Digital con SVG limpio y PNG a 2400 px. Tu fabricante trabaja con un archivo cerrado, sin tipografías
              ni piezas sueltas.
            </p>
            <p className="mt-4 font-display text-lg text-forge-bronze">9,99 €</p>
          </article>
          <article className="panel p-6">
            <p className="numeral text-sm">02</p>
            <h3 className="mt-3 font-display text-lg text-forge-ivory">Revisión profesional</h3>
            <p className="mt-2 text-sm leading-relaxed text-forge-muted">
              Valoramos similitudes, legibilidad y viabilidad antes de fabricar. Incluye informe de observaciones y
              recomendaciones de ajuste.
            </p>
            <p className="mt-4 font-display text-lg text-forge-bronze">49–99 €</p>
          </article>
          <article className="panel p-6">
            <p className="numeral text-sm">03</p>
            <h3 className="mt-3 font-display text-lg text-forge-ivory">Forja física</h3>
            <p className="mt-2 text-sm leading-relaxed text-forge-muted">
              Presupuesto a medida con taller colaborador: dimensiones, acabado, anclaje y plazo. Se confirma tras revisar
              el diseño y el uso previsto.
            </p>
            <p className="mt-4 font-display text-lg text-forge-bronze">A presupuesto</p>
          </article>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-forge-muted">
          La solicitud de forja se envía desde el paso 5 del flujo, con el diseño adjunto. No se cobra nada hasta que
          aceptes el presupuesto del taller.
        </p>
      </section>

      <section className="border-y border-forge-line bg-forge-surface/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Camino completo</p>
          <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Diseño, comprobación y encargo</h2>
          <div className="mt-10">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-3xl text-forge-ivory sm:text-4xl">Preguntas sobre la forja física</h2>
        <div className="mt-8">
          <FaqList
            items={[
              {
                question: "¿Quién fabrica la pieza?",
                answer:
                  "Trabajamos con talleres de forja colaboradores. El presupuesto detalla material, acabado, medidas y plazo antes de cualquier pago.",
              },
              {
                question: "¿Puedo llevar el diseño a mi propio herrero?",
                answer:
                  "Sí. El Pack Digital incluye el SVG y el PNG en alta resolución para que cualquier taller pueda reproducirlo.",
              },
              {
                question: "¿Qué medidas se pueden forjar?",
                answer:
                  "Depende del uso: cierra de finca, portón, marca de transporte o pieza decorativa. Lo definimos en la revisión previa junto con el anclaje.",
              },
              {
                question: "¿El presupuesto incluye envío e instalación?",
                answer:
                  "El presupuesto indica transporte y, si procede, instalación. No se ocultan partidas: verás el desglose antes de aceptar.",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t border-forge-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl text-forge-ivory sm:text-4xl">Precios de referencia</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>
    </>
  );
}
