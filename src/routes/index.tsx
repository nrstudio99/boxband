import { createFileRoute } from "@tanstack/react-router";
import { PasswordGate } from "@/components/PasswordGate";
import { MemberGate, useMemberName } from "@/components/MemberGate";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { Legend } from "@/components/DayDetails";
import { StatsPanel } from "@/components/StatsPanel";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LogOut, Music2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ensaios da Banda" },
      { name: "description", content: "Marca a tua disponibilidade para os ensaios." },
    ],
  }),
  component: Index,
});

function Inner() {
  const { name, save, clear } = useMemberName();
  if (!name) return <MemberGate onSubmit={save} />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Music2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight text-foreground">
                Ensaios da Banda
              </h1>
              <p className="text-xs text-muted-foreground">
                1 Junho — 13 Setembro 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Olá, <span className="font-medium text-foreground">{name}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={clear}>
              <LogOut className="mr-2 h-4 w-4" />
              Trocar nome
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <Legend />
        <div className="rounded-2xl border border-border bg-card/40 p-4 sm:p-6">
          <AvailabilityCalendar memberName={name} />
        </div>
      </main>
    </div>
  );
}

function Index() {
  return (
    <PasswordGate>
      <Inner />
      <Toaster />
    </PasswordGate>
  );
}
