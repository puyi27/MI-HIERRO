interface ChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export function Chip({ label, selected, onSelect }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
        selected
          ? "border-forge-leather bg-forge-leather/8 text-forge-ink"
          : "border-forge-border bg-transparent text-forge-graphite hover:border-forge-leather hover:text-forge-ink"
      }`}
    >
      {label}
    </button>
  );
}
