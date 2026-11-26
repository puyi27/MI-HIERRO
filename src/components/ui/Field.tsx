interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  type?: string;
  inputMode?: "text" | "email" | "tel";
  maxLength?: number;
  required?: boolean;
  optionalLabel?: string;
}

export function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  autoComplete,
  type = "text",
  inputMode,
  maxLength,
  required = false,
  optionalLabel,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-forge-graphite">
        <span>
          {label}
          {required ? <span className="ml-1 text-forge-leather">*</span> : null}
        </span>
        {optionalLabel ? <span className="text-[0.6rem] tracking-[0.12em] text-forge-graphite/70">{optionalLabel}</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className="field"
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-forge-grana">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-xs text-forge-graphite">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
