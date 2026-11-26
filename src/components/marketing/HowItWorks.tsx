const STEPS = [
  { title: "Datos y perfil", body: "Nombre, apellidos y tipo de hierro. Sin registro." },
  { title: "Iniciales", body: "Combinaciones de dos y tres letras, más el monograma principal." },
  { title: "Estilo y propuestas", body: "Cuatro estilos, tres propuestas con puntuaciones orientativas." },
  { title: "Visor realista", body: "Tu hierro sobre metal, capote y cuero quemado." },
  { title: "Entrega", body: "Story gratuita, pack vectorial o informe cuando los necesites." },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {STEPS.map((step, index) => (
        <li key={step.title} className="border-t border-forge-border pt-5">
          <p className="numeral text-sm">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-3 font-display text-base tracking-wide text-forge-ink">{step.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-forge-graphite">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
