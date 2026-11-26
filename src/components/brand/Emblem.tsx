interface EmblemProps {
  className?: string;
  title?: string;
  strokeWidth?: number;
}

export function Emblem({ className, title, strokeWidth = 5 }: EmblemProps) {
  const decorative = !title;
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path d="M14 64 A46 46 0 0 1 106 64" strokeWidth={strokeWidth * 0.72} />
      <path d="M60 8 V26" strokeWidth={strokeWidth * 0.7} />
      <path d="M51 15 H69" strokeWidth={strokeWidth * 0.7} />
      <path d="M30 58 V100" />
      <path d="M90 58 V100" />
      <path d="M30 82 H90" />
      <path d="M23 58 H37" />
      <path d="M83 58 H97" />
      <path d="M30 100 L21 107" strokeWidth={strokeWidth * 0.8} />
      <path d="M90 100 L99 107" strokeWidth={strokeWidth * 0.8} />
      <path d="M56 58 H64" strokeWidth={strokeWidth * 0.55} />
    </svg>
  );
}
