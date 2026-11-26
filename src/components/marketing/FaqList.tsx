interface FaqItem {
  question: string;
  answer: string;
}

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-forge-line border-y border-forge-line">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold text-forge-ivory">
            <span>{item.question}</span>
            <span className="mt-0.5 text-forge-bronze transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-forge-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
