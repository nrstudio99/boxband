import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Copy, Printer, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

import { Field, Section } from "@/components/site-survey/field";
import { ChoicePills, MultiChoicePills } from "@/components/site-survey/choice-pills";
import { TipologiaReference } from "@/components/site-survey/tipologia-reference";
import { PrintSummary } from "@/components/site-survey/print-summary";
import {
  createEmptySurvey,
  getCompleteness,
  FOTOS_OPCOES,
  PERCURSO_OPCOES,
  type EnergiaDadosZona,
  type SiteSurveyData,
} from "@/lib/site-survey-types";
import { deleteSurvey, duplicateSurvey, getSurvey, saveSurvey } from "@/lib/site-survey-storage";

export const Route = createFileRoute("/site-survey/$id")({
  head: () => ({
    meta: [{ title: "Ficha de Site Survey" }],
  }),
  component: SiteSurveyForm,
});

function SiteSurveyForm() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<SiteSurveyData | null>(null);

  // Carrega a ficha existente ou cria uma nova com este id (gerado pela lista).
  useEffect(() => {
    const existing = getSurvey(id);
    if (existing) {
      setSurvey(existing);
      return;
    }
    const fresh: SiteSurveyData = { ...createEmptySurvey(), id };
    saveSurvey(fresh);
    setSurvey(fresh);
  }, [id]);

  // Guarda automaticamente (debounced) sempre que algo muda.
  useEffect(() => {
    if (!survey) return;
    const timeout = setTimeout(() => saveSurvey(survey), 400);
    return () => clearTimeout(timeout);
  }, [survey]);

  const update = <K extends keyof SiteSurveyData>(key: K, value: SiteSurveyData[K]) => {
    setSurvey((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateZona = (index: number, key: keyof EnergiaDadosZona, value: string) => {
    setSurvey((prev) => {
      if (!prev) return prev;
      const energiaDados = prev.energiaDados.map((z, i) =>
        i === index ? { ...z, [key]: value } : z,
      );
      return { ...prev, energiaDados };
    });
  };

  const completeness = useMemo(() => (survey ? getCompleteness(survey) : 0), [survey]);

  if (!survey) return null;

  const handleDelete = () => {
    deleteSurvey(survey.id);
    toast.success("Ficha eliminada");
    navigate({ to: "/site-survey" });
  };

  const handleDuplicate = () => {
    const copy = duplicateSurvey(survey.id);
    if (copy) {
      toast.success("Ficha duplicada");
      navigate({ to: "/site-survey/$id", params: { id: copy.id } });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Toaster />
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/site-survey" })}
            aria-label="Voltar à lista"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {survey.cliente || "Nova ficha"}
              {survey.salaId && ` · ${survey.salaId}`}
            </p>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.print()}
            aria-label="Exportar / imprimir"
          >
            <Printer className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5 print:hidden">
        <Section number={0} title="Identificação">
          <Field label="Cliente / Projeto" full>
            <Input
              value={survey.cliente}
              onChange={(e) => update("cliente", e.target.value)}
              placeholder="Ex.: HIKMA"
            />
          </Field>
          <Field label="Edifício">
            <Input value={survey.edificio} onChange={(e) => update("edificio", e.target.value)} />
          </Field>
          <Field label="Sala / ID">
            <Input value={survey.salaId} onChange={(e) => update("salaId", e.target.value)} />
          </Field>
          <Field label="Piso">
            <Input value={survey.piso} onChange={(e) => update("piso", e.target.value)} />
          </Field>
          <Field label="Data">
            <Input
              type="date"
              value={survey.data}
              onChange={(e) => update("data", e.target.value)}
            />
          </Field>
          <Field label="Técnico">
            <Input value={survey.tecnico} onChange={(e) => update("tecnico", e.target.value)} />
          </Field>
          <Field label="Capacidade (pessoas)">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={survey.capacidade}
              onChange={(e) => update("capacidade", e.target.value)}
            />
          </Field>
          <Field label="Tipologia" full>
            <ChoicePills
              options={["A1", "A2", "B"]}
              value={survey.tipologia}
              onChange={(v) => update("tipologia", v as SiteSurveyData["tipologia"])}
              ariaLabel="Tipologia"
            />
          </Field>
        </Section>

        <TipologiaReference tipologia={survey.tipologia} />

        <Section number={2} title="Levantamento da sala">
          <Field label="Dimensões C x L x H (m)" full>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="C"
                value={survey.dimC}
                onChange={(e) => update("dimC", e.target.value)}
              />
              <Input
                placeholder="L"
                value={survey.dimL}
                onChange={(e) => update("dimL", e.target.value)}
              />
              <Input
                placeholder="H"
                value={survey.dimH}
                onChange={(e) => update("dimH", e.target.value)}
              />
            </div>
          </Field>
          <Field label="TV / dimensão">
            <Input
              value={survey.tvDimensao}
              onChange={(e) => update("tvDimensao", e.target.value)}
              placeholder='Ex.: 65"'
            />
          </Field>
          <Field label="Distância mesa a TV (m)">
            <Input
              value={survey.distanciaMesaTv}
              onChange={(e) => update("distanciaMesaTv", e.target.value)}
            />
          </Field>
          <Field label="Altura centro TV (m)">
            <Input
              value={survey.alturaCentroTv}
              onChange={(e) => update("alturaCentroTv", e.target.value)}
            />
          </Field>
          <Field label="Parede TV" full>
            <ChoicePills
              options={["Alvenaria", "Pladur", "Vidro", "Outro"]}
              value={survey.paredeTv}
              onChange={(v) => update("paredeTv", v)}
              ariaLabel="Parede TV"
            />
            {survey.paredeTv === "Outro" && (
              <Input
                className="mt-2"
                placeholder="Especificar"
                value={survey.paredeTvOutro}
                onChange={(e) => update("paredeTvOutro", e.target.value)}
              />
            )}
          </Field>
          <Field label="Mesa / formato">
            <Input
              value={survey.mesaFormato}
              onChange={(e) => update("mesaFormato", e.target.value)}
            />
          </Field>
          <Field label="Falso teto">
            <ChoicePills
              options={["Sim", "Não"]}
              value={survey.falsoTeto}
              onChange={(v) => update("falsoTeto", v)}
            />
          </Field>
          <Field label="Chão técnico">
            <ChoicePills
              options={["Sim", "Não"]}
              value={survey.chaoTecnico}
              onChange={(v) => update("chaoTecnico", v)}
            />
          </Field>
          <Field label="Acesso zona TV">
            <ChoicePills
              options={["OK", "Limitado"]}
              value={survey.acessoZonaTv}
              onChange={(v) => update("acessoZonaTv", v)}
            />
          </Field>
          <Field label="Espaço fontes">
            <ChoicePills
              options={["OK", "Limitado"]}
              value={survey.espacoFontes}
              onChange={(v) => update("espacoFontes", v)}
            />
          </Field>
          <Field label="Grommet / caixa mesa">
            <ChoicePills
              options={["Sim", "Não"]}
              value={survey.grommet}
              onChange={(v) => update("grommet", v)}
            />
          </Field>
          <Field label="Obra">
            <ChoicePills
              options={["Sim", "Não"]}
              value={survey.obra}
              onChange={(v) => update("obra", v)}
            />
          </Field>
        </Section>

        <div className="rounded-xl border bg-card text-card-foreground shadow" id="seccao-3">
          <div className="flex flex-col space-y-1.5 p-6 pb-3">
            <h3 className="flex items-center gap-2.5 text-base font-semibold leading-none tracking-tight">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              Energia e dados
            </h3>
          </div>
          <div className="space-y-4 p-6 pt-0">
            {survey.energiaDados.map((zona, index) => (
              <div key={zona.zona} className="rounded-lg border border-border p-3">
                <p className="mb-3 text-sm font-medium text-foreground">{zona.zona}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="230 V existentes">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={zona.v230Existentes}
                      onChange={(e) => updateZona(index, "v230Existentes", e.target.value)}
                    />
                  </Field>
                  <Field label="230 V novos">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={zona.v230Novos}
                      onChange={(e) => updateZona(index, "v230Novos", e.target.value)}
                    />
                  </Field>
                  <Field label="RJ45 existentes">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={zona.rj45Existentes}
                      onChange={(e) => updateZona(index, "rj45Existentes", e.target.value)}
                    />
                  </Field>
                  <Field label="RJ45 novos">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={zona.rj45Novos}
                      onChange={(e) => updateZona(index, "rj45Novos", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="PoE / PoE+">
                    <Input
                      value={zona.poe}
                      onChange={(e) => updateZona(index, "poe", e.target.value)}
                    />
                  </Field>
                  <Field label="Ação / observação">
                    <Input
                      value={zona.acao}
                      onChange={(e) => updateZona(index, "acao", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Section number={4} title="Caminhos de cabos">
          <Field label="Percurso" full>
            <MultiChoicePills
              options={PERCURSO_OPCOES}
              value={survey.percurso}
              onChange={(v) => update("percurso", v)}
              ariaLabel="Percurso"
            />
            {survey.percurso.includes("Outro") && (
              <Input
                className="mt-2"
                placeholder="Especificar"
                value={survey.percursoOutro}
                onChange={(e) => update("percursoOutro", e.target.value)}
              />
            )}
          </Field>
          <Field label="Diâmetro (mm)">
            <Input value={survey.diametro} onChange={(e) => update("diametro", e.target.value)} />
          </Field>
          <Field label="Distância (m)">
            <Input
              value={survey.distanciaCabo}
              onChange={(e) => update("distanciaCabo", e.target.value)}
            />
          </Field>
          <Field label="Energia / dados">
            <ChoicePills
              options={["OK", "Rever"]}
              value={survey.energiaDadosOk}
              onChange={(v) => update("energiaDadosOk", v)}
            />
          </Field>
          <Field label="Cabo dedicado" full>
            <ChoicePills
              options={["Não", "Sight Cat6A blindado", "Extend Cat6A U/FTP"]}
              value={survey.caboDedicado}
              onChange={(v) => update("caboDedicado", v)}
              ariaLabel="Cabo dedicado"
            />
          </Field>
          <Field label="Origem">
            <Input value={survey.origem} onChange={(e) => update("origem", e.target.value)} />
          </Field>
          <Field label="Destino">
            <Input value={survey.destino} onChange={(e) => update("destino", e.target.value)} />
          </Field>
          <Field label="Comprimento (m)">
            <Input
              value={survey.comprimento}
              onChange={(e) => update("comprimento", e.target.value)}
            />
          </Field>
          <Field label="Passagens / furos / obra" full>
            <Textarea
              value={survey.passagens}
              onChange={(e) => update("passagens", e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Separação / obstáculos" full>
            <Textarea
              value={survey.separacao}
              onChange={(e) => update("separacao", e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Reserva futura">
            <ChoicePills
              options={["Sim", "Não"]}
              value={survey.reservaFutura}
              onChange={(v) => update("reservaFutura", v)}
            />
          </Field>
          <Field label="Ação">
            <Input value={survey.acaoCabos} onChange={(e) => update("acaoCabos", e.target.value)} />
          </Field>
        </Section>

        <Section number={5} title="Rede e conclusão">
          <Field label="Rack / IDF">
            <Input value={survey.rackIdf} onChange={(e) => update("rackIdf", e.target.value)} />
          </Field>
          <Field label="Switch / portas">
            <Input
              value={survey.switchPortas}
              onChange={(e) => update("switchPortas", e.target.value)}
            />
          </Field>
          <Field label="VLAN">
            <Input value={survey.vlan} onChange={(e) => update("vlan", e.target.value)} />
          </Field>
          <Field label="802.1X / NAC">
            <ChoicePills
              options={["Sim", "Não", "N/A"]}
              value={survey.nac8021x}
              onChange={(v) => update("nac8021x", v)}
            />
          </Field>
          <Field label="DHCP / Internet">
            <ChoicePills
              options={["OK", "Validar"]}
              value={survey.dhcpInternet}
              onChange={(v) => update("dhcpInternet", v)}
            />
          </Field>
          <Field label="PoE budget">
            <ChoicePills
              options={["OK", "Validar"]}
              value={survey.poeBudget}
              onChange={(v) => update("poeBudget", v)}
            />
          </Field>
          <Field label="Wi-Fi">
            <ChoicePills
              options={["OK", "Rever"]}
              value={survey.wifi}
              onChange={(v) => update("wifi", v)}
            />
          </Field>
          <Field label="Sala pronta">
            <ChoicePills
              options={["Sim", "Não", "Cond."]}
              value={survey.salaPronta}
              onChange={(v) => update("salaPronta", v)}
            />
          </Field>
          <Field label="Ações / condicionantes" full>
            <Textarea
              value={survey.acoesCondicionantes}
              onChange={(e) => update("acoesCondicionantes", e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Fotos" full>
            <MultiChoicePills
              options={FOTOS_OPCOES}
              value={survey.fotos}
              onChange={(v) => update("fotos", v)}
              ariaLabel="Fotos"
            />
          </Field>
          <Field label="Técnico">
            <Input
              value={survey.tecnicoConclusao}
              onChange={(e) => update("tecnicoConclusao", e.target.value)}
            />
          </Field>
          <Field label="Data">
            <Input
              type="date"
              value={survey.dataConclusao}
              onChange={(e) => update("dataConclusao", e.target.value)}
            />
          </Field>
        </Section>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar ficha
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar ficha
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar esta ficha?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      <PrintSummary survey={survey} />
    </div>
  );
}
