import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  SEASON_END,
  SEASON_START,
  STATUS_CYCLE,
  STATUS_META,
  type Status,
} from "@/lib/band-config";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  member_name: string;
  date: string;
  status: Status;
};

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAYS_PT = ["S", "T", "Q", "Q", "S", "S", "D"]; // Mon..Sun

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function inSeason(d: Date) {
  return d >= SEASON_START && d <= SEASON_END;
}

export function AvailabilityCalendar({ memberName }: { memberName: string }) {
  const [cursor, setCursor] = useState<Date>(startOfMonth(SEASON_START));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("id, member_name, date, status")
        .gte("date", ymd(SEASON_START))
        .lte("date", ymd(SEASON_END))
        .order("date");
      if (!active) return;
      if (error) {
        toast.error("Erro a carregar disponibilidades");
      } else {
        setRows((data ?? []) as Row[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel("availability-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "availability" },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as Row;
              return prev.filter((r) => r.id !== old.id);
            }
            const next = payload.new as Row;
            const idx = prev.findIndex((r) => r.id === next.id);
            if (idx === -1) return [...prev, next];
            const copy = [...prev];
            copy[idx] = next;
            return copy;
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      const arr = map.get(r.date) ?? [];
      arr.push(r);
      map.set(r.date, arr);
    }
    return map;
  }, [rows]);

  const cycle = async (date: Date) => {
    if (!inSeason(date)) return;
    const dateStr = ymd(date);
    const existing = rows.find(
      (r) => r.member_name === memberName && r.date === dateStr,
    );
    const currentIdx = STATUS_CYCLE.indexOf(existing?.status ?? null);
    const next = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];

    if (next === null) {
      if (!existing) return;
      const prev = rows;
      setRows((p) => p.filter((r) => r.id !== existing.id));
      const { error } = await supabase
        .from("availability")
        .delete()
        .eq("id", existing.id);
      if (error) {
        setRows(prev);
        toast.error("Erro a remover");
      }
      return;
    }

    if (existing) {
      const prev = rows;
      setRows((p) =>
        p.map((r) => (r.id === existing.id ? { ...r, status: next } : r)),
      );
      const { error } = await supabase
        .from("availability")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) {
        setRows(prev);
        toast.error("Erro a guardar");
      }
    } else {
      const { data, error } = await supabase
        .from("availability")
        .insert({ member_name: memberName, date: dateStr, status: next })
        .select()
        .single();
      if (error) {
        toast.error("Erro a guardar");
      } else if (data) {
        setRows((p) => {
          if (p.some((r) => r.id === data.id)) return p;
          return [...p, data as Row];
        });
      }
    }
  };

  const monthStart = startOfMonth(cursor);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const firstWeekday = (monthStart.getDay() + 6) % 7; // Mon=0..Sun=6

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const canPrev = startOfMonth(cursor) > startOfMonth(SEASON_START);
  const canNext = startOfMonth(cursor) < startOfMonth(SEASON_END);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          disabled={!canPrev}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold capitalize">
          {MONTHS_PT[cursor.getMonth()]} {cursor.getFullYear()}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          disabled={!canNext}
          aria-label="Mês seguinte"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS_PT.map((d, i) => (
          <div key={i} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const dateStr = ymd(date);
          const inside = inSeason(date);
          const dayRows = byDate.get(dateStr) ?? [];
          const mine = dayRows.find((r) => r.member_name === memberName);
          const others = dayRows.filter((r) => r.member_name !== memberName);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => cycle(date)}
              disabled={!inside}
              className={cn(
                "group relative flex aspect-square flex-col rounded-lg border p-1.5 text-left transition-all",
                inside
                  ? "border-border bg-card hover:border-primary/50 hover:shadow-md"
                  : "border-transparent bg-muted/30 cursor-not-allowed opacity-40",
              )}
              style={
                mine
                  ? {
                      backgroundColor: `color-mix(in oklab, ${STATUS_META[mine.status].color} 22%, var(--card))`,
                      borderColor: STATUS_META[mine.status].color,
                    }
                  : undefined
              }
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {date.getDate()}
                </span>
                {mine && (
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: STATUS_META[mine.status].color,
                      color: "var(--background)",
                    }}
                  >
                    {mine.status}
                  </span>
                )}
              </div>

              {others.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-0.5">
                  {others.slice(0, 6).map((r) => (
                    <span
                      key={r.id}
                      title={`${r.member_name}: ${STATUS_META[r.status].label}`}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: STATUS_META[r.status].color }}
                    />
                  ))}
                  {others.length > 6 && (
                    <span className="text-[9px] text-muted-foreground">
                      +{others.length - 6}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-sm text-muted-foreground">A carregar…</p>
      )}
    </div>
  );
}
