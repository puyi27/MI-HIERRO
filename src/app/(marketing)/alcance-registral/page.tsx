import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalList } from "@/components/marketing/LegalSection";
import { LegalNotice } from "@/components/layout/LegalNotice";

export const metadata: Metadata = {
  title: "Alcance registral",
  description:
    "Qué hace y qué no hace MI HIERRO: diferencia entre diseño creativo, identificación ganadera y registro de marcas ante OEPM, EUIPO y OMPI.",
  alternates: { canonical: "/alcance-registral" },
};

export default function AlcanceRegistralPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="eyebrow">Transparencia</p>
      <h1 className="mt-4 font-display text-3xl text-forge-ink sm:text-4xl">Alcance registral del servicio</h1>
      <p className="mt-4 text-sm leading-relaxed text-forge-graphite">
        Crear un diseño, identificar una ganadería y registrar una marca son tres cosas distintas. Esta página explica
        exactamente dónde llega MI HIERRO y dónde empieza el trabajo de un profesional.
      </p>

      <LegalNotice variant="full" className="mt-8" />

      <LegalSection title="1. Tres conceptos que no deben confundirse">
        <LegalList
          items={[
            "Hierro ganadero: marca gráfica tradicional vinculada a la identificación de una ganadería o a los sistemas tradicionales de identificación de la raza bovina de lidia.",
            "Identificación oficial del animal: sistema regulado de identificación y trazabilidad, cuya normativa varía según especie, raza, territorio y supuesto concreto.",
            "Marca o diseño protegido: un signo gráfico puede estar sujeto a derechos de propiedad industrial o intelectual. Crear un diseño no implica registrarlo ni garantiza exclusividad.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Qué sí hace MI HIERRO">
        <LegalList
          items={[
            "Propone combinaciones de iniciales y composiciones gráficas originales a partir de los datos que aportas.",
            "Convierte las letras en curvas y suelda iniciales, marcos y remates en una sola silueta vectorial.",
            "Genera vistas previas rasterizadas con marca de agua y un visor sobre distintos materiales.",
            "Entrega archivos vectoriales y rasterizados con el Pack Digital, y documenta observaciones en el Informe de Similitud.",
            "Pone en contacto al interesado con revisión profesional o talleres de forja, cuando lo solicita.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Qué no hace MI HIERRO">
        <LegalList
          items={[
            "No certifica que un hierro esté disponible ni que pueda inscribirse.",
            "No emite dictámenes jurídicos, no tramita registros y no representa al usuario ante administraciones.",
            "No consulta de forma automática catálogos oficiales ni bases de datos protegidas sin licencia.",
            "No garantiza que el diseño sea apto para fabricación física sin validación del taller.",
            "No atribuye derechos sobre signos distintivos de terceros ni sustituye una búsqueda registral profesional.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Marco normativo de referencia">
        <p>
          El Real Decreto 787/2023 regula determinados sistemas de identificación y trazabilidad, incluyendo previsiones
          específicas para animales de la raza bovina de lidia. Su contenido debe analizarse en el texto consolidado, con
          sus modificaciones y la normativa autonómica aplicable.
        </p>
        <p>
          Para comprobaciones complementarias pueden consultarse la OEPM (marcas y nombres comerciales nacionales), la
          EUIPO (marcas y diseños de la Unión Europea), la OMPI mediante la Global Brand Database y los procedimientos de
          las administraciones ganaderas competentes.
        </p>
      </LegalSection>

      <LegalSection title="5. Bases de datos y derechos de terceros">
        <p>
          La Ley de Propiedad Intelectual contempla la protección de determinadas bases de datos, incluida la protección
          sui generis cuando concurren sus requisitos. La extracción o reutilización sustancial de contenidos puede
          requerir autorización, incluso cuando los datos individuales sean consultables públicamente.
        </p>
        <p>
          MI HIERRO no realiza extracción automatizada masiva de catálogos sin licencia. El Informe de Similitud se apoya
          en fuentes autorizadas, aportaciones del usuario y procesos de verificación documentados.
        </p>
      </LegalSection>

      <LegalSection title="6. Protección de datos personales">
        <p>
          El nombre y los apellidos pueden ser datos personales. Aplicamos privacidad desde el diseño: la generación
          básica funciona sin crear cuenta, recogemos únicamente los datos necesarios y no conservamos el nombre de forma
          permanente más allá de lo imprescindible para entregar el diseño solicitado.
        </p>
      </LegalSection>

      <LegalSection title="7. Recomendación antes de fabricar o usar el hierro">
        <p>
          Antes de encargar una pieza física, inscribir un signo o usar el hierro en el ámbito ganadero, recomendamos una
          revisión profesional que valore similitudes, viabilidad y normativa aplicable. Si tienes dudas, solicita el
          Informe de Similitud y, cuando proceda, la revisión profesional de 49–99 €.
        </p>
        <p>
          <Link href="/forjar" className="text-forge-leather underline-offset-4 hover:underline">
            Volver a la fragua
          </Link>
        </p>
      </LegalSection>
    </article>
  );
}
