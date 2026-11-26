import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { StyleShowcase } from "@/components/marketing/StyleShowcase";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PlanGrid } from "@/components/marketing/PlanGrid";
import { FaqList } from "@/components/marketing/FaqList";
import { LegalNotice } from "@/components/layout/LegalNotice";

export const metadata: Metadata = {
  title: "Diseñar hierro ganadero online",
  description:
    "Diseña el hierro de tu ganadería con iniciales reales, cuatro estilos tradicionales y entrega vectorial forjable. Prueba gratuita y revisión profesional opcional.",
  alternates: { canonical: "/disenar-hierro-ganadero" },
  openGraph: {
    title: "Diseñar hierro ganadero online · MI HIERRO",
    description: "Del apellido al hierro: propuestas tradicionales, visor realista y archivo vectorial forjable.",
    url: "/disenar-hierro-ganadero",
  },
};

export default function GanaderoLanding() {
  return (
    <>
      <section className="border-b border-forge-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">Para ganaderías de lidia y explotaciones</p>
            <h1 className="mt-4 font-display text-[2.2rem] leading-[1.08] text-forge-ink sm:text-5xl">
              Diseña un hierro ganadero,{" "}
              <span className="font-editorial italic text-forge-leather">sin estudio de diseño.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-forge-graphite sm:text-base">
              Partimos de tu nombre y apellidos para proponer combinaciones con proporción heráldica, remates tradicionales y lectura clara en portón y finca.
            </p>
            <Link href="/forjar?perfil=ganaderia" className="btn-primary mt-8">
              Forjar mi hierro
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <LegalNotice className="mt-6" />
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src="/images/perfil-ganaderia.jpg"
              alt="Ganadería de lidia"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="photo-editorial object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">El proceso</p>
        <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">De los apellidos al hierro, en cinco pasos</h2>
        <div className="mt-10">
          <HowItWorks />
        </div>
      </section>

      <section id="estilos" className="scroll-mt-24 border-y border-forge-border bg-forge-stone">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Cuatro estilos</p>
          <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Cuatro lecturas para un mismo apellido</h2>
          <div className="mt-10">
            <StyleShowcase />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-2xl text-forge-ink sm:text-3xl">Preguntas frecuentes</h2>
        <div className="mt-8">
          <FaqList
            items={[
              {
                question: "¿El diseño sirve directamente para forjar?",
                answer:
                  "El SVG se compila con trazos pensados para forja y bordado, pero cada taller tiene sus límites. Valida el archivo con el fabricante.",
              },
              {
                question: "¿Comprobáis si el hierro ya existe?",
                answer:
                  "La generación básica no busca coincidencias. El Informe de Similitud (19,90 €) revisa fuentes de forma orientativa en 24-48 h.",
              },
              {
                question: "¿MI HIERRO registra el hierro?",
                answer:
                  "No. MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI.",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t border-forge-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Planes</p>
          <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Sin suscripciones ni permanencia</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>
    </>
  );
}
