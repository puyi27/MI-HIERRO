"use client";

import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

export function ForgeCompareSlider() {
  return (
    <div className="border border-forge-gold/50 bg-forge-void p-1.5">
      <div className="overflow-hidden border border-forge-gold/30">
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src="/images/taller-forja.jpg"
              alt="Forja artesanal en taller"
              className="photo-editorial h-full w-full object-cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src="/images/detalle-cuero.jpg"
              alt="Marca en cuero y guarnicionería"
              className="photo-editorial h-full w-full object-cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          }
          className="aspect-[4/3] w-full"
        />
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-forge-paper/80">
        <span>Trazado en taller</span>
        <span className="text-forge-gold">Del trazado al oficio</span>
        <span>Cuño en piel</span>
      </div>
    </div>
  );
}
