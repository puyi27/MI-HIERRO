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
      <section className="border-b border-forge-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">Para yeguadas de Pura Raza Española</p>
            <h1 className="mt-4 font-display text-[2.2rem] leading-[1.08] text-forge-ink sm:text-5xl">
              Hierro de yeguada:{" "}
              <span className="font-editorial italic text-forge-leather">identidad y solera.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-forge-graphite sm:text-base">
              Un emblema sobrio con monograma y corona, pensado para leerse en hierro, cuero, guarnicionería y redes.
            </p>
            <Link href="/forjar?perfil=ganaderia" className="btn-primary mt-8">
              Forjar mi emblema
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <LegalNotice className="mt-6" />
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src="/images/perfil-yeguada.jpg"
              alt="Yeguada de Pura Raza Española"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="photo-editorial object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Proceso</p>
        <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Un emblema con criterio, no un logo al azar</h2>
        <div className="mt-10">
          <HowItWorks />
        </div>
      </section>

      <section id="estilos" className="scroll-mt-24 border-y border-forge-border bg-forge-stone">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Estilos</p>
          <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Cuatro caminos hacia el mismo emblema</h2>
          <div className="mt-10">
            <StyleShowcase />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-2xl text-forge-ink sm:text-3xl">Dudas sobre hierros de yeguada</h2>
        <div className="mt-8">
          <FaqList
            items={[
              {
                question: "¿El hierro de yeguada es lo mismo que una marca registrada?",
                answer:
                  "No. El hierro es una marca gráfica tradicional; el registro de marcas es un procedimiento distinto ante OEPM, EUIPO u OMPI.",
              },
              {
                question: "¿Puedo usarlo en guarnicionería y hierro físico?",
                answer:
                  "El SVG está preparado con trazos mínimos y una sola silueta. Valida el archivo con el artesano antes de encargar.",
              },
              {
                question: "¿Qué hago si quiero comprobar si ya existe?",
                answer:
                  "Solicita el Informe de Similitud (19,90 €). Documenta fuentes y coincidencias de forma orientativa.",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t border-forge-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-2xl text-forge-ink sm:text-3xl">Planes</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>
    </>
  );
}
