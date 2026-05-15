import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEASON_END, SEASON_START, STATUS_META, type Status } from "@/lib/band-config";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = { member_name: string; date: string; status: Status };

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"]; // Sun..Sat

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function inSeason(d: Date) {
  return d >= SEASON_START && d <= SEASON_END;
}

export function MonthDashboard() {
  const [cursor, setCursor] = useState<Date>(startOfMonth(SEASON_START));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("member_name, date, status")
        .gte("date", ymd(SEASON_START))
        .lte("date", ymd(SEASON_END));
      if (!active) return;
      if (error) toast.error("Erro a carregar dashboard");
      else setRows((data ?? []) as Row[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("availability-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "availability" },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthRows = useMemo(
    () => rows.filter((r) => r.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)),
    [rows, year, month],
  );

  const members = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.member_name))).sort((a, b) =>
        a.localeCompare(b, "pt"),
      ),
    [rows],
  );

  // member -> day -> status
  const grid = useMemo(() => {
    const m = new Map<string, Map<number, Status>>();
    for (const r of monthRows) {
      const day = parseInt(r.date.slice(8, 10), 10);
      const cur = m.get(r.member_name) ?? new Map<number, Status>();
      cur.set(day, r.status);
      m.set(r.member_name, cur);
    }
    return m;
  }, [monthRows]);

  // Per-day totals
  const dayTotals = useMemo(() => {
    const t = new Map<number, Record<Status, number>>();
    for (const r of monthRows) {
      const day = parseInt(r.date.slice(8, 10), 10);
      const cur = t.get(day) ?? { S: 0, N: 0, C: 0 };
      cur[r.status]++;
      t.set(day, cur);
    }
    return t;
  }, [monthRows]);

  // Per-member totals (current month)
  const memberTotals = useMemo(() => {
    const t = new Map<string, Record<Status, number>>();
    for (const r of monthRows) {
      const cur = t.get(r.member_name) ?? { S: 0, N: 0, C: 0 };
      cur[r.status]++;
      t.set(r.member_name, cur);
    }
    return t;
  }, [monthRows]);

  const canPrev = startOfMonth(cursor) > startOfMonth(SEASON_START);
  const canNext = startOfMonth(cursor) < startOfMonth(SEASON_END);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          disabled={!canPrev}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold capitalize">
          {MONTHS_PT[month]} {year}
        </h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          disabled={!canNext}
          aria-label="Mês seguinte"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">A carregar…</p>
      ) : members.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Ainda não há marcações.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40">
                <th className="sticky left-0 z-10 border-b border-r border-border bg-muted/40 px-3 py-2 text-left font-medium text-muted-foreground">
                  Membro
                </th>
                {days.map((d) => {
                  const date = new Date(year, month, d);
                  const wk = WEEKDAY_LETTERS[date.getDay()];
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th
                      key={d}
                      className={cn(
                        "border-b border-border px-1 py-1 text-center font-medium",
                        isWeekend ? "bg-muted/60 text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <div className="text-[10px] leading-none">{wk}</div>
                      <div className="text-xs leading-tight tabular-nums">{d}</div>
                    </th>
                  );
                })}
                <th className="border-b border-l border-border bg-muted/40 px-2 py-2 text-center font-medium text-muted-foreground">
                  S
                </th>
                <th className="border-b border-border bg-muted/40 px-2 py-2 text-center font-medium text-muted-foreground">
                  N
                </th>
                <th className="border-b border-border bg-muted/40 px-2 py-2 text-center font-medium text-muted-foreground">
                  C
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((name) => {
                const memberDays = grid.get(name);
                const totals = memberTotals.get(name) ?? { S: 0, N: 0, C: 0 };
                return (
                  <tr key={name} className="border-b border-border last:border-0">
                    <td className="sticky left-0 z-10 border-r border-border bg-card px-3 py-1.5 font-medium text-foreground whitespace-nowrap">
                      {name}
                    </td>
                    {days.map((d) => {
                      const date = new Date(year, month, d);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const inside = inSeason(date);
                      const status = memberDays?.get(d);
                      return (
                        <td
                          key={d}
                          className={cn(
                            "border-l border-border p-0.5 text-center",
                            !inside && "bg-muted/20",
                            isWeekend && inside && !status && "bg-muted/30",
                          )}
                        >
                          {status ? (
                            <span
                              className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
                              style={{
                                backgroundColor: STATUS_META[status].color,
                                color: "var(--background)",
                              }}
                              title={`${name} — ${date.getDate()}: ${STATUS_META[status].label}`}
                            >
                              {status}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">·</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="border-l border-border bg-muted/20 px-2 py-1 text-center font-semibold tabular-nums">
                      {totals.S}
                    </td>
                    <td className="border-l border-border bg-muted/20 px-2 py-1 text-center font-semibold tabular-nums">
                      {totals.N}
                    </td>
                    <td className="border-l border-border bg-muted/20 px-2 py-1 text-center font-semibold tabular-nums">
                      {totals.C}
                    </td>
                  </tr>
                );
              })}

              {/* Totals per day */}
              {(["S", "N", "C"] as Status[]).map((s) => (
                <tr key={s} className="border-t border-border bg-muted/20">
                  <td className="sticky left-0 z-10 border-r border-border bg-muted/40 px-3 py-1.5 text-left font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_META[s].color }}
                      />
                      Total {s}
                    </span>
                  </td>
                  {days.map((d) => {
                    const count = dayTotals.get(d)?.[s] ?? 0;
                    return (
                      <td
                        key={d}
                        className="border-l border-border px-1 py-1 text-center text-xs font-semibold tabular-nums"
                        style={
                          count > 0
                            ? {
                                color: STATUS_META[s].color,
                              }
                            : { color: "var(--muted-foreground)" }
                        }
                      >
                        {count || ""}
                      </td>
                    );
                  })}
                  <td colSpan={3} className="border-l border-border bg-muted/40" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
