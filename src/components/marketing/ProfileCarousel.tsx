"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

const PROFILES = [
  { key: "novillero", label: "Novillero / Torero", image: "/images/perfil-novillero.jpg", href: "/forjar?perfil=novillero" },
  { key: "ganaderia", label: "Ganadería", image: "/images/perfil-ganaderia.jpg", href: "/forjar?perfil=ganaderia" },
  { key: "yeguada", label: "Yeguada PRE", image: "/images/perfil-yeguada.jpg", href: "/forjar?perfil=ganaderia" },
  { key: "particular", label: "Finca / Particular", image: "/images/detalle-cuero.jpg", href: "/forjar?perfil=particular" },
];

export function ProfileCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const card = (p: (typeof PROFILES)[number]) => (
    <Link
      key={p.key}
      href={p.href}
      className="group relative block overflow-hidden rounded-[2px] border border-forge-border bg-forge-white transition hover:border-forge-grana"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={p.image}
          alt={p.label}
          fill
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 280px"
          className="photo-editorial object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between p-4">
        <span className="font-display text-sm tracking-[0.06em] text-forge-ink">{p.label}</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-forge-graphite transition group-hover:text-forge-grana" aria-hidden />
      </div>
    </Link>
  );

  return (
    <>
      <div className="mt-8 sm:hidden">
        <div className="overflow-hidden" ref={emblaRef} aria-label="Perfiles de hierro">
          <div className="flex gap-3">
            {PROFILES.map((p) => (
              <div key={p.key} className="min-w-0 flex-[0_0_78%]">
                {card(p)}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {PROFILES.map((p, idx) => (
              <button
                key={p.key}
                type="button"
                onClick={() => emblaApi?.scrollTo(idx)}
                aria-label={`Ver ${p.label}`}
                className={`h-1.5 transition ${idx === selectedIndex ? "w-6 bg-forge-grana" : "w-2 bg-forge-border"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.65rem] text-forge-graphite">
              {selectedIndex + 1} / {PROFILES.length}
            </span>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Perfil anterior"
              className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-forge-border bg-forge-white text-forge-ink"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Siguiente perfil"
              className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-forge-border bg-forge-white text-forge-ink"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {PROFILES.map((p) => card(p))}
      </div>
    </>
  );
}
