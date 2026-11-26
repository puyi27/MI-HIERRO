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
      className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
        selected
          ? "border-forge-bronze bg-forge-bronze/12 text-forge-ivory"
          : "border-forge-line bg-transparent text-forge-muted hover:border-forge-bronze/60 hover:text-forge-ivory"
      }`}
    >
      {label}
    </button>
  );
}
