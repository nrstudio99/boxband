import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, FileText, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getCompleteness, type SiteSurveyData } from "@/lib/site-survey-types";
import { deleteSurvey, duplicateSurvey, listSurveys } from "@/lib/site-survey-storage";

export const Route = createFileRoute("/site-survey/")({
  head: () => ({
    meta: [
      { title: "Site Survey | Logitech + Barco" },
      {
        name: "description",
        content: "Ficha de site survey para salas de videoconferência Logitech + Barco.",
      },
    ],
  }),
  component: SiteSurveyList,
});

function SiteSurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<SiteSurveyData[]>([]);
  const [query, setQuery] = useState("");

  const refresh = () => setSurveys(listSurveys());

  useEffect(() => {
    refresh();
  }, []);

  const handleNew = () => {
    const id = crypto.randomUUID();
    navigate({ to: "/site-survey/$id", params: { id } });
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateSurvey(id);
    if (copy) {
      toast.success("Ficha duplicada");
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    deleteSurvey(id);
    toast.success("Ficha eliminada");
    refresh();
  };

  const filtered = surveys.filter((s) => {
    const haystack = `${s.cliente} ${s.edificio} ${s.salaId} ${s.tecnico}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-5">
          <h1 className="text-lg font-bold text-foreground">Site Survey — Logitech + Barco</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ficha de levantamento para salas de videoconferência.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <div className="flex gap-2">
          <Input
            placeholder="Pesquisar por cliente, edifício, sala ou técnico…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={handleNew} className="shrink-0">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova ficha
          </Button>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {surveys.length === 0
                ? "Ainda não existem fichas. Toca em “Nova ficha” para começar."
                : "Nenhuma ficha corresponde à pesquisa."}
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {filtered.map((survey) => {
            const completeness = getCompleteness(survey);
            return (
              <li key={survey.id}>
                <div className="rounded-2xl border border-border bg-card/40 p-4">
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => navigate({ to: "/site-survey/$id", params: { id: survey.id } })}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {survey.cliente || "(sem cliente / projeto)"}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {[survey.edificio, survey.salaId, survey.piso && `Piso ${survey.piso}`]
                            .filter(Boolean)
                            .join(" · ") || "Sem localização definida"}
                        </p>
                      </div>
                      {survey.tipologia && <Badge variant="secondary">{survey.tipologia}</Badge>}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${completeness}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {completeness}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Data: {survey.data || "—"} · Técnico: {survey.tecnico || "—"}
                    </p>
                  </button>

                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(survey.id)}
                      className="text-muted-foreground"
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Duplicar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar esta ficha?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A ficha de{" "}
                            {survey.cliente || "sem cliente definido"} será eliminada
                            permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(survey.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {surveys.length > 0 && (
          <p className="pt-2 text-center text-xs text-muted-foreground">
            As fichas ficam guardadas neste dispositivo (armazenamento local do browser).
          </p>
        )}
      </main>
    </div>
  );
}
