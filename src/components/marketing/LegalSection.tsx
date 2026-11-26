export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl tracking-wide text-forge-ivory">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-forge-muted">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 bg-forge-bronze" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
