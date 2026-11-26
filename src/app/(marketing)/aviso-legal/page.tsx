import type { Metadata } from "next";
import { LegalSection, LegalList } from "@/components/marketing/LegalSection";
import { LegalNotice } from "@/components/layout/LegalNotice";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Condiciones de uso, propiedad intelectual y limitación de responsabilidad de MI HIERRO.",
  alternates: { canonical: "/aviso-legal" },
  robots: { index: true, follow: true },
};

export default function AvisoLegalPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="eyebrow">Información legal</p>
      <h1 className="mt-4 font-display text-3xl text-forge-ivory sm:text-4xl">Aviso legal</h1>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-forge-muted">Última actualización: noviembre de 2026</p>

      <LegalNotice variant="full" className="mt-8" />

      <LegalSection title="1. Titular del sitio">
        <p>
          MI HIERRO es un proyecto de diseño de hierros ganaderos, marcas personales y emblemas de yeguada. El titular
          completará y publicará sus datos identificativos completos (denominación social, NIF y domicilio) antes de la
          apertura comercial del servicio.
        </p>
        <p>
          Contacto: <a className="text-forge-bronze underline-offset-4 hover:underline" href="mailto:hola@mihierro.es">hola@mihierro.es</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto">
        <p>
          Este sitio ofrece una herramienta de generación de propuestas gráficas orientativas para hierros ganaderos y
          marcas personales, un visor de simulación y servicios de entrega de archivos, informes documentales y
          solicitudes de revisión o forja física.
        </p>
        <p>
          El uso del sitio atribuye la condición de usuario e implica la aceptación de este aviso legal, de la política de
          privacidad y de las condiciones particulares mostradas en el flujo de compra.
        </p>
      </LegalSection>

      <LegalSection title="3. Naturaleza orientativa del servicio">
        <p>
          MI HIERRO propone y orienta; no certifica disponibilidad ni viabilidad registral ante la RUCTL, la OEPM, la
          EUIPO, la OMPI ni ninguna administración competente. Tampoco tramita inscripciones, autorizaciones ni
          identificaciones oficiales de animales.
        </p>
        <LegalList
          items={[
            "La generación de un diseño no implica su registro ni garantiza exclusividad.",
            "Las puntuaciones de legibilidad, equilibrio y aptitud de forja son estimaciones técnicas orientativas.",
            "La fabricación física requiere validación previa con el taller y no se garantiza por la mera generación digital.",
            "Las referencias normativas, incluido el RD 787/2023, se ofrecen con carácter informativo y deben contrastarse con el texto consolidado y la normativa autonómica aplicable.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Propiedad intelectual e industrial">
        <p>
          La estructura, textos, ilustraciones, componentes y código de este sitio pertenecen a su titular o se utilizan
          con licencia. Las tipografías empleadas en el motor vectorial están publicadas bajo licencias abiertas que
          permiten su uso comercial.
        </p>
        <p>
          El usuario conserva la titularidad sobre los datos que aporta. La utilización comercial del diseño generado
          requiere el Pack Digital o un acuerdo específico, y en ningún caso atribuye derechos sobre signos distintivos de
          terceros.
        </p>
        <p>
          Se prohíbe la extracción masiva de contenidos, la reproducción no autorizada de la herramienta y el uso del
          servicio para generar signos que imiten emblemas oficiales, escudos de organismos públicos o marcas registradas
          por terceros.
        </p>
      </LegalSection>

      <LegalSection title="5. Condiciones económicas">
        <p>
          Los importes mostrados (0 €, 9,99 €, 19,90 € y horquilla 49–99 €) son tarifas orientativas para validar el
          mercado y pueden ajustarse antes de la contratación. El precio aplicable es el que figura en la pasarela de pago
          en el momento de la compra e incluye los impuestos que correspondan.
        </p>
        <p>
          El Pack Digital es un pago único sin suscripción. El Informe de Similitud se presta bajo pedido y su entrega
          orientativa es de 24 a 48 horas laborables. La forja física se presupuesta de forma individual y no se cobra
          hasta la aceptación expresa del presupuesto.
        </p>
      </LegalSection>

      <LegalSection title="6. Responsabilidad">
        <p>
          El titular no responde de decisiones de fabricación, registro o uso comercial adoptadas a partir de propuestas
          orientativas sin la oportuna revisión profesional. Tampoco garantiza la disponibilidad continua del sitio, aunque
          adoptará medidas razonables para restablecer el servicio.
        </p>
        <p>
          El usuario es responsable de la veracidad de los datos aportados y de no utilizar el servicio para fines
          ilícitos o contrarios a la buena fe.
        </p>
      </LegalSection>

      <LegalSection title="7. Enlaces y legislación aplicable">
        <p>
          Los enlaces a sitios de terceros se ofrecen como referencia. La relación con el usuario se rige por la
          legislación española. Para consumidores, la resolución de conflictos puede acudir a los organismos de consumo
          competentes y al sistema europeo de resolución de litigios en línea.
        </p>
      </LegalSection>
    </article>
  );
}
