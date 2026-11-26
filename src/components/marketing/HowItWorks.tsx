const STEPS = [
  {
    title: "Datos y perfil",
    body: "Elige si forjas para una ganadería, una marca personal de novillero o una finca particular. Nombre y apellidos, sin registro.",
  },
  {
    title: "Iniciales",
    body: "Normalizamos acentos y generamos combinaciones válidas de dos y tres letras, más el monograma principal.",
  },
  {
    title: "Estilo y propuestas",
    body: "Cuatro estilos y tres propuestas por estilo, con explicación del trazo y puntuaciones orientativas.",
  },
  {
    title: "Visor realista",
    body: "Tu hierro sobre metal forjado, bordado en capote y cuero quemado. Cambia de material en un toque.",
  },
  {
    title: "Entrega",
    body: "Story 9:16 gratuita. Pack vectorial, informe de similitud o revisión profesional cuando los necesites.",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {STEPS.map((step, index) => (
        <li key={step.title} className="border-t border-forge-line pt-5">
          <p className="numeral text-sm">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-3 font-display text-base tracking-wide text-forge-ivory">{step.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-forge-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
