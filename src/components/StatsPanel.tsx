import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEASON_END, SEASON_START, STATUS_META, type Status } from "@/lib/band-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Row = { member_name: string; date: string; status: Status };

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const STATUSES: Status[] = ["S", "N", "C"];

export function StatsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("member_name, date, status")
        .gte("date", ymd(SEASON_START))
        .lte("date", ymd(SEASON_END));
      if (!active) return;
      if (error) toast.error("Erro a carregar estatísticas");
      else setRows((data ?? []) as Row[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel("availability-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "availability" },
        async () => {
          const { data } = await supabase
            .from("availability")
            .select("member_name, date, status")
            .gte("date", ymd(SEASON_START))
            .lte("date", ymd(SEASON_END));
          if (data) setRows(data as Row[]);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const months = useMemo(() => {
    const arr: { key: string; label: string }[] = [];
    const cur = new Date(SEASON_START.getFullYear(), SEASON_START.getMonth(), 1);
    const end = new Date(SEASON_END.getFullYear(), SEASON_END.getMonth(), 1);
    while (cur <= end) {
      arr.push({
        key: `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`,
        label: MONTHS_PT[cur.getMonth()],
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return arr;
  }, []);

  const members = useMemo(
    () => Array.from(new Set(rows.map((r) => r.member_name))).sort((a, b) => a.localeCompare(b, "pt")),
    [rows],
  );

  // member -> status -> count
  const memberTotals = useMemo(() => {
    const m = new Map<string, Record<Status, number>>();
    for (const r of rows) {
      const cur = m.get(r.member_name) ?? { S: 0, N: 0, C: 0 };
      cur[r.status]++;
      m.set(r.member_name, cur);
    }
    return m;
  }, [rows]);

  // monthKey -> status -> count
  const monthTotals = useMemo(() => {
    const m = new Map<string, Record<Status, number>>();
    for (const r of rows) {
      const key = r.date.slice(0, 7);
      const cur = m.get(key) ?? { S: 0, N: 0, C: 0 };
      cur[r.status]++;
      m.set(key, cur);
    }
    return m;
  }, [rows]);

  const maxMonth = useMemo(() => {
    let max = 0;
    for (const v of monthTotals.values()) {
      max = Math.max(max, v.S, v.N, v.C);
    }
    return Math.max(max, 1);
  }, [monthTotals]);

  if (loading) {
    return <p className="text-center text-sm text-muted-foreground">A carregar estatísticas…</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Ainda não há marcações para mostrar.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Per member */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Por membro</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Membro</th>
                {STATUSES.map((s) => (
                  <th key={s} className="px-3 py-2 text-center font-medium text-muted-foreground">
                    <span
                      className="inline-flex items-center gap-1.5"
                      title={STATUS_META[s].label}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_META[s].color }}
                      />
                      {s}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {members.map((name) => {
                const t = memberTotals.get(name) ?? { S: 0, N: 0, C: 0 };
                const total = t.S + t.N + t.C;
                return (
                  <tr key={name} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium text-foreground">{name}</td>
                    {STATUSES.map((s) => (
                      <td key={s} className="px-3 py-2 text-center tabular-nums">
                        {t[s]}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-semibold tabular-nums">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Per month */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Por mês</h3>
        <div className="space-y-4">
          {months.map((m) => {
            const t = monthTotals.get(m.key) ?? { S: 0, N: 0, C: 0 };
            return (
              <div key={m.key} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium capitalize text-foreground">
                    {m.label}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t.S + t.N + t.C} marcações
                  </span>
                </div>
                <div className="space-y-1.5">
                  {STATUSES.map((s) => {
                    const pct = (t[s] / maxMonth) * 100;
                    return (
                      <div key={s} className="flex items-center gap-2">
                        <span className="w-4 text-xs font-bold text-muted-foreground">{s}</span>
                        <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted/40">
                          <div
                            className={cn("h-full rounded transition-all")}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: STATUS_META[s].color,
                              minWidth: t[s] > 0 ? "4px" : 0,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs tabular-nums text-foreground">
                          {t[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
