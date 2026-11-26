import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Crown } from "lucide-react";
import { StyleShowcase } from "@/components/marketing/StyleShowcase";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PlanGrid } from "@/components/marketing/PlanGrid";
import { FaqList } from "@/components/marketing/FaqList";
import { LegalNotice } from "@/components/layout/LegalNotice";

export const metadata: Metadata = {
  title: "Hierro para yeguada PRE",
  description:
    "Diseña el hierro de tu yeguada de Pura Raza Española: monograma, corona y emblema con entrega vectorial para hierro, cuero y papelería.",
  alternates: { canonical: "/hierro-yeguada-pre" },
  openGraph: {
    title: "Hierro para yeguada PRE · MI HIERRO",
    description: "Identidad y solera para yeguadas de Pura Raza Española.",
    url: "/hierro-yeguada-pre",
  },
};

export default function YeguadaLanding() {
  return (
    <>
      <section className="border-b border-forge-line">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">Para yeguadas de Pura Raza Española</p>
            <h1 className="mt-5 font-display text-[2.5rem] leading-[1.05] text-forge-ivory sm:text-5xl">
              Hierro de yeguada:
              <span className="font-editorial italic text-forge-bronze"> identidad y solera.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-forge-muted sm:text-base">
              El hierro de una yeguada PRE acompaña al caballo toda su vida y aparece en cuadras, guarnicionería, papelería
              y redes. MI HIERRO propone un emblema sobrio, con monograma y corona, pensado para leerse en hierro y en
              cuero.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/forjar?perfil=ganaderia" className="btn-primary">
                Forjar mi emblema
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="#estilos" className="btn-ghost">Ver estilos</Link>
            </div>
            <LegalNotice className="mt-8" />
          </div>

          <div className="panel grain p-7">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-forge-bronze" aria-hidden />
              <p className="eyebrow-muted">Pensado para la yeguada</p>
            </div>
            <ul className="mt-6 space-y-4 text-sm text-forge-muted">
              <li>
                <span className="block text-forge-ivory">Monograma y corona</span>
                Combinaciones de iniciales con remates de corona, arco o escudo, sin imitar escudos oficiales.
              </li>
              <li>
                <span className="block text-forge-ivory">Lectura en cuero y metal</span>
                Vista previa sobre hierro forjado y cuero quemado para validar el contraste real.
              </li>
              <li>
                <span className="block text-forge-ivory">Uso en papelería y redes</span>
                Avatar y Story incluidos, más PNG transparente en alta resolución en el pack.
              </li>
              <li>
                <span className="block text-forge-ivory">Coherencia de marca</span>
                Un único trazado para toda la explotación: cuadras, transporte, guarnicionería y web.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Proceso</p>
        <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Un emblema con criterio, no un logo al azar</h2>
        <div className="mt-10">
          <HowItWorks />
        </div>
      </section>

      <section id="estilos" className="scroll-mt-24 border-y border-forge-line bg-forge-surface/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Estilos</p>
          <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Cuatro caminos hacia el mismo emblema</h2>
          <div className="mt-10">
            <StyleShowcase />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-3xl text-forge-ivory sm:text-4xl">Dudas sobre hierros de yeguada</h2>
        <div className="mt-8">
          <FaqList
            items={[
              {
                question: "¿El hierro de yeguada es lo mismo que una marca registrada?",
                answer:
                  "No. El hierro es una marca gráfica tradicional vinculada a la explotación; el registro de marcas es un procedimiento distinto ante OEPM, EUIPO u OMPI. MI HIERRO no certifica disponibilidad registral.",
              },
              {
                question: "¿Puedo usar el diseño en guarnicionería y hierro físico?",
                answer:
                  "El SVG está preparado con trazos mínimos y una sola silueta. Antes de encargar la pieza, valida el archivo con el artesano o fabricante.",
              },
              {
                question: "¿Se puede usar para papelería y redes sociales?",
                answer:
                  "Sí. El pack incluye PNG transparente a 2400 px, avatar 1080x1080 y Story 9:16 con la firma MI HIERRO.",
              },
              {
                question: "¿Qué hago si quiero comprobar si ya existe?",
                answer:
                  "Puedes solicitar el Informe de Similitud (19,90 €). Documenta fuentes y coincidencias de forma orientativa y explica sus limitaciones; no sustituye una búsqueda registral profesional.",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t border-forge-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl text-forge-ivory sm:text-4xl">Planes</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>
    </>
  );
}
