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
  title: "Marca personal para novilleros y toreros",
  description:
    "Crea tu marca personal de novillero o torero con monograma, remate de cruz o corona y Story 9:16 para redes. Diseño orientativo con entrega vectorial.",
  alternates: { canonical: "/marca-personal-novilleros" },
  openGraph: {
    title: "Marca personal para novilleros · MI HIERRO",
    description: "Iniciales, remate y presencia: tu marca personal antes de la alternativa.",
    url: "/marca-personal-novilleros",
  },
};

export default function NovilleroLanding() {
  return (
    <>
      <section className="border-b border-forge-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">Para novilleros, toreros y cuadrillas</p>
            <h1 className="mt-4 font-display text-[2.2rem] leading-[1.08] text-forge-ink sm:text-5xl">
              Una marca que se lea en el capote{" "}
              <span className="font-editorial italic text-forge-leather">y en el cartel.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-forge-graphite sm:text-base">
              Tu nombre convertido en monograma o hierro personal con lectura inmediata en bordado, polo y redes. Sin registro.
            </p>
            <Link href="/forjar?perfil=novillero" className="btn-primary mt-8">
              Crear mi marca
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <LegalNotice className="mt-6" />
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src="/images/perfil-novillero.jpg"
              alt="Novillero en la plaza"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="photo-editorial object-cover"
            />
            {/* detalle-capote como apoyo secundario */}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Cómo funciona</p>
        <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Tu marca, forjada en cinco pasos</h2>
        <div className="mt-10">
          <HowItWorks />
        </div>
      </section>

      <section id="estilos" className="scroll-mt-24 border-y border-forge-border bg-forge-stone">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Estilos</p>
          <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Del hierro clásico al monograma de autor</h2>
          <div className="mt-10">
            <StyleShowcase />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-2xl text-forge-ink sm:text-3xl">Dudas habituales</h2>
        <div className="mt-8">
          <FaqList
            items={[
              {
                question: "¿Puedo usar mi marca en carteles y redes?",
                answer:
                  "Sí. La Story gratuita está pensada para redes y el Pack Digital permite usar la imagen en soportes personales.",
              },
              {
                question: "¿Necesito registrar la marca?",
                answer:
                  "MI HIERRO no certifica disponibilidad ante OEPM, EUIPO ni OMPI. Para protección legal, consulta con un profesional.",
              },
              {
                question: "¿Cuánto tarda la entrega del pack?",
                answer:
                  "El Pack Digital se entrega por enlace firmado tras el pago confirmado, además por email. El enlace caduca a las 72 h.",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t border-forge-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Planes</p>
          <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Empieza gratis</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>
    </>
  );
}
