import { STATUS_META } from "@/lib/band-config";

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card/60 p-4">
      {(["S", "N", "C"] as const).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
            style={{
              backgroundColor: STATUS_META[s].color,
              color: "var(--background)",
            }}
          >
            {s}
          </span>
          <div className="text-sm">
            <div className="font-medium text-foreground">
              {STATUS_META[s].label}
            </div>
            <div className="text-xs text-muted-foreground">
              {STATUS_META[s].description}
            </div>
          </div>
        </div>
      ))}
      <p className="ml-auto text-xs text-muted-foreground">
        Clica num dia para alternar S → N → C → vazio.
      </p>
    </div>
  );
}
