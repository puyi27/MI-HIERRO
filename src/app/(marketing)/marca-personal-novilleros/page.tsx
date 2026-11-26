import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Star } from "lucide-react";
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
      <section className="border-b border-forge-line">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">Para novilleros, toreros y cuadrillas</p>
            <h1 className="mt-5 font-display text-[2.5rem] leading-[1.05] text-forge-ivory sm:text-5xl">
              Una marca que se lea en el capote
              <span className="font-editorial italic text-forge-bronze"> y en el cartel.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-forge-muted sm:text-base">
              Tu nombre es el activo. MI HIERRO lo convierte en monograma, hierro personal o emblema de cuadrilla con
              lectura inmediata en bordado de capote, polo, faja y redes. Sin registro y sin tarjeta para empezar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/forjar?perfil=novillero" className="btn-primary">
                Crear mi marca
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="#estilos" className="btn-ghost">Ver estilos</Link>
            </div>
            <LegalNotice className="mt-8" />
          </div>

          <div className="panel grain p-7">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-forge-bronze" aria-hidden />
              <p className="eyebrow-muted">Pensado para el ruedo y la pantalla</p>
            </div>
            <ul className="mt-6 space-y-4 text-sm text-forge-muted">
              <li>
                <span className="block text-forge-ivory">Trazo legible a distancia</span>
                Grosor mínimo controlado y remates limpios para que la marca aguante escala de cartel.
              </li>
              <li>
                <span className="block text-forge-ivory">Bordado en capote y polo</span>
                Verás la propuesta sobre tela antes de decidir, con textura de bordado real.
              </li>
              <li>
                <span className="block text-forge-ivory">Story 9:16 gratuita</span>
                Tarjeta vertical con tu hierro y la firma MI HIERRO, lista para Instagram o TikTok.
              </li>
              <li>
                <span className="block text-forge-ivory">Pack Digital Premium</span>
                SVG limpio, PNG 2400 px y kit de redes por 9,99 €, sin suscripción.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Cómo funciona</p>
        <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Tu marca, forjada en cinco pasos</h2>
        <div className="mt-10">
          <HowItWorks />
        </div>
      </section>

      <section id="estilos" className="scroll-mt-24 border-y border-forge-line bg-forge-surface/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Estilos</p>
          <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Del hierro clásico al monograma de autor</h2>
          <div className="mt-10">
            <StyleShowcase />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-display text-3xl text-forge-ivory sm:text-4xl">Dudas habituales</h2>
        <div className="mt-8">
          <FaqList
            items={[
              {
                question: "¿Puedo usar mi marca en carteles y redes?",
                answer:
                  "Sí. La Story gratuita está pensada para redes y el Pack Digital permite usar la imagen en soportes personales. Para usos comerciales o registrales, solicita una revisión profesional.",
              },
              {
                question: "¿Qué diferencia hay con un logo genérico?",
                answer:
                  "La estética está construida sobre la tradición del hierro ganadero: proporción heráldica, remates de cruz o corona, lectura en bordado y una sola silueta forjable.",
              },
              {
                question: "¿Necesito registrar la marca?",
                answer:
                  "Crear un diseño no implica su registro ni garantiza exclusividad. MI HIERRO no certifica disponibilidad ante OEPM, EUIPO ni OMPI; si necesitas protección, consulta con un profesional.",
              },
              {
                question: "¿Cuánto tarda la entrega del pack?",
                answer:
                  "El Pack Digital se entrega por enlace firmado inmediatamente después del pago confirmado, además por email. El enlace caduca a las 72 horas.",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t border-forge-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Planes</p>
          <h2 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Empieza gratis</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>
    </>
  );
}
