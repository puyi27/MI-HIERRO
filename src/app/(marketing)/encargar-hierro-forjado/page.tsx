import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PlanGrid } from "@/components/marketing/PlanGrid";
import { FaqList } from "@/components/marketing/FaqList";
import { LegalNotice } from "@/components/layout/LegalNotice";

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
      <section className="border-b border-forge-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">De la pantalla al taller</p>
            <h1 className="mt-4 font-display text-[2.2rem] leading-[1.08] text-forge-ink sm:text-5xl">
              Encargar hierro forjado,{" "}
              <span className="font-editorial italic text-forge-leather">con criterio previo.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-forge-graphite sm:text-base">
              Diseñamos el hierro, comprobamos su lectura y lo dejamos listo para taller. La forja física se presupuesta caso por caso.
            </p>
            <Link href="/forjar?perfil=particular" className="btn-primary mt-8">
              Diseñar y pedir presupuesto
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <LegalNotice variant="full" className="mt-6" />
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src="/images/taller-forja.jpg"
              alt="Taller de forja artesanal"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="photo-editorial object-cover"
            />
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Servicios</p>
        <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Tres formas de llevarlo al hierro</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="panel p-6">
            <p className="numeral text-sm">01</p>
            <h3 className="mt-3 font-display text-lg text-forge-ink">Archivo para tu taller</h3>
            <p className="mt-2 text-sm leading-relaxed text-forge-graphite">
              SVG limpio y PNG a 2400 px, listo para fabricante.
            </p>
            <p className="mt-4 font-display text-lg text-forge-leather">9,99 €</p>
          </article>
          <article className="panel p-6">
            <p className="numeral text-sm">02</p>
            <h3 className="mt-3 font-display text-lg text-forge-ink">Revisión profesional</h3>
            <p className="mt-2 text-sm leading-relaxed text-forge-graphite">
              Similitudes, legibilidad y viabilidad antes de fabricar.
            </p>
            <p className="mt-4 font-display text-lg text-forge-leather">49–99 €</p>
          </article>
          <article className="panel p-6">
            <p className="numeral text-sm">03</p>
            <h3 className="mt-3 font-display text-lg text-forge-ink">Forja física</h3>
            <p className="mt-2 text-sm leading-relaxed text-forge-graphite">
              Presupuesto a medida: dimensiones, acabado y plazo.
            </p>
            <p className="mt-4 font-display text-lg text-forge-leather">A presupuesto</p>
          </article>
        </div>
      </section>

      <section className="border-y border-forge-border bg-forge-stone">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Camino completo</p>
          <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Diseño, comprobación y encargo</h2>
          <div className="mt-10">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-2xl text-forge-ink sm:text-3xl">Preguntas sobre la forja física</h2>
        <div className="mt-8">
          <FaqList
            items={[
              {
                question: "¿Quién fabrica la pieza?",
                answer: "Talleres de forja colaboradores. El presupuesto detalla material, acabado, medidas y plazo.",
              },
              {
                question: "¿Puedo llevar el diseño a mi propio herrero?",
                answer: "Sí. El Pack Digital incluye SVG y PNG en alta resolución.",
              },
              {
                question: "¿El presupuesto incluye envío e instalación?",
                answer: "Sí, transporte y, si procede, instalación. Verás el desglose antes de aceptar.",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t border-forge-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-2xl text-forge-ink sm:text-3xl">Precios de referencia</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>
    </>
  );
}
