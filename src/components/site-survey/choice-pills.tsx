import { cn } from "@/lib/utils";

/** Botão de escolha única em formato "pill" — alvo de toque grande, pensado para uso em campo/mobile. */
export function ChoicePills({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? "" : opt)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors active:scale-95",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-transparent text-foreground hover:bg-accent",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** Botões de escolha múltipla em formato "pill". */
export function MultiChoicePills({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  ariaLabel?: string;
}) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={active}
            onClick={() => toggle(opt)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors active:scale-95",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-transparent text-foreground hover:bg-accent",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
