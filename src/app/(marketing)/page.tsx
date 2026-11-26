import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Emblem } from "@/components/brand/Emblem";
import { StyleShowcase } from "@/components/marketing/StyleShowcase";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PlanGrid } from "@/components/marketing/PlanGrid";
import { LegalNotice } from "@/components/layout/LegalNotice";
import { PROFILE_META, PROFILE_TYPES } from "@/types/forge";

export const metadata: Metadata = {
  title: "Tu hierro, tu marca, tu legado",
  description:
    "Forja tu hierro ganadero con IA y criterio editorial: cuatro estilos, visor realista sobre hierro, capote y cuero, y entrega vectorial forjable.",
  alternates: { canonical: "/" },
};

const TRUST = ["3 propuestas gratuitas", "Sin registro obligatorio", "Vector forjable"];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-forge-line">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div>
            <p className="eyebrow">Heráldica ganadera · Forja digital</p>
            <h1 className="mt-5 font-display text-[2.7rem] leading-[1.02] tracking-tight text-forge-ivory sm:text-6xl">
              Tu hierro,
              <br />
              tu marca,
              <br />
              <span className="font-editorial italic text-forge-bronze">tu legado.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-forge-muted sm:text-base">
              Transformamos tu nombre, apellidos y procedencia en propuestas de hierro ganadero, marca personal de
              novillero o emblema de yeguada. Cuatro estilos, tres propuestas y un visor que lo enseña en tu mundo.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/forjar" className="btn-primary">
                Forjar mi hierro
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="#estilos" className="btn-ghost">
                Ver los cuatro estilos
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.68rem] uppercase tracking-[0.16em] text-forge-muted">
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-forge-bronze" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 translate-x-3 translate-y-3 border border-forge-line" aria-hidden />
            <div className="grain panel relative px-8 py-10 text-center">
              <p className="eyebrow-muted">MI HIERRO · Pieza de referencia</p>
              <Emblem className="mx-auto mt-8 h-40 w-40 text-forge-bronze" />
              <p className="mt-8 font-display text-2xl tracking-[0.3em] text-forge-ivory">MI HIERRO</p>
              <p className="mt-2 font-editorial text-base italic tracking-[0.08em] text-forge-muted">Forja tu legado</p>
              <div className="rule my-6" />
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-forge-muted/80">
                Diseño orientativo · RD 787/2023
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="estilos" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Los cuatro temples</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-forge-ivory sm:text-4xl">
              Cuatro estilos, una misma firma
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-forge-muted">
            Del hierro histórico de la ganadería al monograma contemporáneo. Todos los estilos se compilan en una sola
            silueta apta para forja y bordado.
          </p>
        </div>

        <div className="mt-10">
          <StyleShowcase />
        </div>

        <div className="mt-8">
          <Link href="/forjar" className="btn-ghost">
            Probar con mis iniciales
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="border-y border-forge-line bg-forge-surface/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="eyebrow">Cómo se forja</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-forge-ivory sm:text-4xl">
            Cinco pasos, sin registro y sin tarjeta
          </h2>
          <div className="mt-10">
            <HowItWorks />
          </div>
          <LegalNotice className="mt-10" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Para quién forjamos</p>
        <h2 className="mt-4 font-display text-3xl leading-tight text-forge-ivory sm:text-4xl">Tres oficios, tres hierros</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PROFILE_TYPES.map((profile) => {
            const meta = PROFILE_META[profile];
            return (
              <Link
                key={profile}
                href={`/forjar?perfil=${profile}`}
                className="panel group flex flex-col justify-between p-6 transition hover:border-forge-bronze/60"
              >
                <div>
                  <p className="eyebrow-muted">{meta.short}</p>
                  <h3 className="mt-3 font-display text-xl tracking-wide text-forge-ivory">{meta.label}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-forge-muted">{meta.description}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-forge-bronze">
                  Empezar
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-forge-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">Planes</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-forge-ivory sm:text-4xl">Empieza gratis, paga lo justo</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forge-muted">
            La primera experiencia no cuesta nada. El archivo vectorial, el informe documental y la revisión profesional
            son servicios independientes, sin suscripciones.
          </p>
          <div className="mt-10">
            <PlanGrid />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grain panel relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
          <Emblem className="mx-auto h-16 w-16 text-forge-bronze" />
          <h2 className="mt-8 font-display text-3xl leading-tight text-forge-ivory sm:text-5xl">
            Tu nombre ya tiene <span className="font-editorial italic text-forge-bronze">forma.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-forge-muted">
            Forja tres propuestas en menos de un minuto y míralas sobre hierro, capote y cuero antes de decidir.
          </p>
          <Link href="/forjar" className="btn-primary mt-8">
            Forjar mi hierro
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <LegalNotice className="mx-auto mt-10 max-w-2xl" />
        </div>
      </section>
    </>
  );
}
