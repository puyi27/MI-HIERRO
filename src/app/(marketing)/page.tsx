import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { StyleShowcase } from "@/components/marketing/StyleShowcase";
import { PlanGrid } from "@/components/marketing/PlanGrid";
import { LegalNotice } from "@/components/layout/LegalNotice";
import { ForgeCompareSlider } from "@/components/marketing/ForgeCompareSlider";
import { ProfileCarousel } from "@/components/marketing/ProfileCarousel";

export const metadata: Metadata = {
  title: "Tu hierro, tu marca, tu legado",
  description:
    "Forja tu hierro ganadero con IA y criterio editorial: cuatro estilos, visor realista sobre hierro, capote y cuero, y entrega vectorial forjable.",
  alternates: { canonical: "/" },
};

const PROCESS_STEPS = [
  { num: "I", title: "Filiación y perfil", body: "Sin registro. Solo tu nombre, apellidos y tipo de hierro." },
  { num: "II", title: "Lámina de prueba", body: "Cuatro estirpes de trazo, tres propuestas con puntuaciones orientativas." },
  { num: "III", title: "Avíos y entrega", body: "Míralo sobre hierro, capote y cuero. Descarga tu Story 9:16 gratis." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-forge-border">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:pb-24 lg:pt-20">
          <div>
            <p className="eyebrow">Taller digital de hierros y marcas</p>
            <h1 className="mt-4 font-display text-[2.5rem] leading-[1.05] tracking-tight text-forge-ink sm:text-5xl lg:text-[3.4rem]">
              Tu hierro,{" "}
              <span className="font-editorial italic text-forge-grana">tu legado.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-forge-graphite">
              Diseña tu hierro ganadero, marca de novillero o emblema de yeguada PRE en menos de un minuto. Gratis, sin registro.
            </p>
            <Link href="/forjar" className="btn-primary mt-8">
              Forjar mi hierro
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-4 flex items-center gap-2 text-xs text-forge-graphite">
              <Lock className="h-3.5 w-3.5 text-forge-leather" aria-hidden />
              Tus bocetos son privados y no se publican en galerías abiertas.
            </p>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden border border-forge-border">
            <Image
              src="/images/hero-dehesa.jpg"
              alt="Dehesa española al atardecer"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="photo-editorial object-cover object-[35%_center] scale-[1.08]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">¿Para quién forjamos?</p>
        <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Elige tu perfil y empieza</h2>
        <ProfileCarousel />
      </section>

      <section className="border-y-2 border-forge-gold bg-forge-ink text-forge-paper">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <ForgeCompareSlider />
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-forge-gold">Oficio y proceso</p>
            <h2 className="mt-3 font-display text-2xl text-forge-paper sm:text-3xl">Tres pasos, sin registro y sin tarjeta</h2>
            <ol className="mt-8 space-y-6">
              {PROCESS_STEPS.map((s) => (
                <li key={s.num} className="flex gap-4 border-b border-forge-paper/15 pb-4 last:border-0 last:pb-0">
                  <span className="font-display text-sm tracking-[0.08em] text-forge-gold">{s.num}.</span>
                  <div>
                    <p className="font-display text-base text-forge-paper">{s.title}</p>
                    <p className="mt-1 text-sm text-forge-paper/75">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="estilos" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Cuatro estirpes</p>
        <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Una misma firma, cuatro lecturas</h2>
        <div className="mt-10">
          <StyleShowcase />
        </div>
        <Link href="/forjar" className="btn-ghost mt-8">
          Probar con mis iniciales
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      <section className="border-t border-forge-border bg-forge-stone/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Pliego de encargos</p>
          <h2 className="mt-3 font-display text-2xl text-forge-ink sm:text-3xl">Empieza gratis, paga lo justo</h2>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12 sm:px-8">
        <div className="relative overflow-hidden border border-forge-border bg-forge-white p-1.5">
          <div className="border border-forge-border px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden border border-forge-border">
              <Image
                src="/images/hero-plaza.jpg"
                alt="Plaza de tientas"
                fill
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="photo-editorial object-cover"
              />
            </div>
            <h2 className="font-display text-2xl text-forge-ink sm:text-4xl">
              Tu nombre ya tiene <span className="font-editorial italic text-forge-grana">forma.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-forge-graphite">
              Tres propuestas en menos de un minuto. Míralas sobre hierro, capote y cuero antes de decidir.
            </p>
            <Link href="/forjar" className="btn-primary mt-8">
              Forjar mi hierro
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <LegalNotice className="mx-auto mt-8 max-w-lg" />
          </div>
        </div>
      </section>
    </>
  );
}
