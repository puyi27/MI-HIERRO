import type { Metadata } from "next";
import { LegalSection, LegalList } from "@/components/marketing/LegalSection";

export const metadata: Metadata = {
  title: "Política de privacidad y RGPD",
  description: "Tratamiento de datos personales en MI HIERRO: finalidades, base jurídica, conservación, destinatarios y derechos.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="eyebrow">Protección de datos</p>
      <h1 className="mt-4 font-display text-3xl text-forge-ink sm:text-4xl">Política de privacidad y RGPD</h1>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-forge-graphite">Última actualización: noviembre de 2026</p>

      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable es el titular de MI HIERRO, cuyos datos identificativos completos se publicarán antes de la
          apertura comercial del servicio. Para cualquier cuestión de privacidad puedes escribir a{" "}
          <a className="text-forge-leather underline-offset-4 hover:underline" href="mailto:hola@mihierro.es">hola@mihierro.es</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que tratamos">
        <LegalList
          items={[
            "Datos identificativos y de contacto: nombre, apellidos, procedencia, email y, si lo facilitas, teléfono.",
            "Preferencias de diseño: perfil, carácter del trazo, remate e iniciales seleccionadas.",
            "Datos del pedido: producto contratado, importe, estado del pago y referencias de la pasarela.",
            "Contenido de solicitudes: mensajes enviados en revisiones profesionales o encargos de forja física.",
            "Datos técnicos mínimos: dirección IP y marcas de tiempo para limitar abuso del servicio y garantizar seguridad.",
          ]}
        />
        <p>
          No solicitamos datos especialmente protegidos. Te pedimos que no incluyas información sensible en el campo de
          mensaje.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidades y bases jurídicas">
        <LegalList
          items={[
            "Generar propuestas de diseño y mostrarlas en el visor: ejecución de la relación solicitada y consentimiento al enviar el formulario.",
            "Gestionar compras, pagos y entregas: ejecución de contrato y cumplimiento de obligaciones legales y fiscales.",
            "Atender solicitudes de revisión, informes o forja física: consentimiento y medidas precontractuales.",
            "Prevenir abuso y proteger la plataforma: interés legítimo en la seguridad del servicio.",
            "Cumplir requerimientos de autoridades: obligación legal.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Conservación">
        <p>
          Los datos de generación se conservan el tiempo necesario para prestar el servicio y permitir la entrega. Los
          datos asociados a pedidos se conservan durante los plazos legales aplicables (incluidos los fiscales y
          contables). Las solicitudes profesionales se conservan mientras exista relación o hasta que solicites su
          supresión, salvo obligación legal de conservación.
        </p>
        <p>
          La generación básica funciona sin crear cuenta y sin conservar de forma permanente el nombre introducido más allá
          de lo necesario para componer y entregar el diseño.
        </p>
      </LegalSection>

      <LegalSection title="5. Destinatarios y encargados">
        <p>
          Para prestar el servicio utilizamos proveedores tecnológicos que actúan como encargados del tratamiento o
          responsables independientes según el caso:
        </p>
        <LegalList
          items={[
            "Stripe: procesamiento de pagos. Los datos de tarjeta se introducen en su entorno seguro y no pasan por nuestros servidores.",
            "Resend: envío de correos transaccionales de entrega y avisos operativos.",
            "Vercel u otro proveedor de alojamiento: infraestructura de la aplicación.",
            "Upstash: limitación de peticiones y protección frente a abuso.",
            "Google Gemini: generación asistida de propuestas cuando la funcionalidad de IA está activa.",
          ]}
        />
        <p>
          Algunos proveedores pueden implicar transferencias internacionales amparadas en cláusulas contractuales tipo o
          mecanismos equivalentes.
        </p>
      </LegalSection>

      <LegalSection title="6. Derechos">
        <p>
          Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo
          a{" "}
          <a className="text-forge-leather underline-offset-4 hover:underline" href="mailto:hola@mihierro.es">hola@mihierro.es</a>,
          indicando el derecho que deseas ejercer y acreditando tu identidad. También puedes retirar tu consentimiento en
          cualquier momento y presentar una reclamación ante la Agencia Española de Protección de Datos.
        </p>
      </LegalSection>

      <LegalSection title="7. Seguridad y decisiones automatizadas">
        <p>
          Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito, límites de peticiones, control de
          acceso a datos y minimización. La generación de propuestas es asistida por IA, pero no adoptamos decisiones
          automatizadas con efectos jurídicos sobre ti; la selección final siempre es tuya.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies">
        <p>
          Este sitio no utiliza cookies publicitarias ni de seguimiento de terceros. Las tecnologías estrictamente
          necesarias para el funcionamiento del flujo (por ejemplo, el almacenamiento de sesión del navegador para no
          perder tus datos entre pasos) no requieren consentimiento y se eliminan al cerrar la pestaña.
        </p>
      </LegalSection>
    </article>
  );
}
