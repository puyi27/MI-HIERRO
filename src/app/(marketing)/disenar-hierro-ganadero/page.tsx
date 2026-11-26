import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Shield } from "lucide-react";
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
      <section className="border-b border-forge-line">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">Para ganaderías de lidia y explotaciones</p>
            <h1 className="mt-5 font-display text-[2.5rem] leading-[1.05] text-forge-ivory sm:text-5xl">
              Diseñar un hierro ganadero,
              <span className="font-editorial italic text-forge-bronze"> sin estudio de diseño.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-forge-muted sm:text-base">
              El hierro de una ganadería es una firma que se hereda. MI HIERRO parte de tu nombre y apellidos para
              proponer combinaciones de iniciales con proporción heráldica, remates tradicionales y lectura clara en
              portón, jeep y cierra de finca.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/forjar?perfil=ganaderia" className="btn-primary">
                Forjar mi hierro
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="#estilos" className="btn-ghost">Ver estilos</Link>
            </div>
            <LegalNotice className="mt-8" />
          </div>

          <div className="panel grain p-7">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-forge-bronze" aria-hidden />
              <p className="eyebrow-muted">Qué obtiene tu ganadería</p>
            </div>
            <ul className="mt-6 space-y-4 text-sm text-forge-muted">
              <li>
                <span className="block text-forge-ivory">Tres propuestas por estilo</span>
                Con explicación del trazo y puntuaciones orientativas de legibilidad, equilibrio y aptitud de forja.
              </li>
              <li>
                <span className="block text-forge-ivory">Una sola silueta</span>
                Iniciales y remates soldados con operaciones booleanas: sin piezas sueltas ni tipografías incrustadas.
              </li>
              <li>
                <span className="block text-forge-ivory">Archivo vectorial forjable</span>
                SVG limpio y PNG a 2400 px en el Pack Digital, listos para taller o bordado.
              </li>
              <li>
                <span className="block text-forge-ivory">Aviso legal claro</span>
                No certificamos disponibilidad registral. Para eso existe el informe documental y la revisión humana.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">El proceso</p>
        <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">De los apellidos al hierro, en cinco pasos</h2>
        <div className="mt-10">
          <HowItWorks />
        </div>
      </section>

      <section id="estilos" className="scroll-mt-24 border-y border-forge-line bg-forge-surface/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Templos del hierro</p>
          <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Cuatro lecturas para un mismo apellido</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forge-muted">
            El tradicional mira a la historia. El monograma condensa las iniciales. El geométrico prioriza la
            reproducción fiel. El heráldico construye emblema sin imitar escudos oficiales.
          </p>
          <div className="mt-10">
            <StyleShowcase />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Antes de fabricar</p>
        <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Preguntas que conviene resolver</h2>
        <div className="mt-8">
          <FaqList
            items={[
              {
                question: "¿El diseño sirve directamente para forjar?",
                answer:
                  "El SVG se compila con trazos mínimos pensados para forja y bordado, pero cada taller tiene sus límites. Recomendamos validar el archivo con el fabricante antes de encargar la pieza física.",
              },
              {
                question: "¿Comprobáis si el hierro ya existe?",
                answer:
                  "La generación básica no realiza búsqueda documental. El Informe de Similitud de 19,90 € revisa fuentes y coincidencias de forma orientativa, con entrega en 24-48 horas laborables.",
              },
              {
                question: "¿MI HIERRO registra el hierro?",
                answer:
                  "No. MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI ni tramita registros. Cualquier inscripción debe validarse con un profesional.",
              },
              {
                question: "¿Puedo usar el resultado en la puerta de la finca?",
                answer:
                  "Sí, el Pack Digital incluye el archivo vectorial y un PNG de alta resolución. Para usos comerciales o registrales, solicita una revisión profesional previa.",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t border-forge-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Planes</p>
          <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Sin suscripciones ni permanencia</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
          <Link href="/encargar-hierro-forjado" className="mt-10 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-forge-bronze">
            ¿Buscas forja física?
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
