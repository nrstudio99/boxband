import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TIPOLOGIA_NOTA, TIPOLOGIA_REF, type Tipologia } from "@/lib/site-survey-types";

/** Resumo das necessidades por tipologia (secção 1 da ficha original) — referência informativa,
 * realça a linha correspondente à tipologia selecionada no cabeçalho. */
export function TipologiaReference({ tipologia }: { tipologia: Tipologia }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            1
          </span>
          Resumo das necessidades por tipologia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(Object.keys(TIPOLOGIA_REF) as Array<keyof typeof TIPOLOGIA_REF>).map((key) => {
          const ref = TIPOLOGIA_REF[key];
          const active = tipologia === key;
          return (
            <div
              key={key}
              className={`rounded-lg border p-3 text-sm transition-colors ${
                active ? "border-primary bg-primary/10" : "border-border bg-secondary/40"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {ref.label}
                </span>
                <span className="font-medium text-foreground">{ref.equipamento}</span>
                <span className="text-xs text-muted-foreground">· Qt. {ref.qt}</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">230 V</dt>
                  <dd className="text-foreground">{ref.v230}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">RJ45</dt>
                  <dd className="text-foreground">{ref.rj45}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">PoE</dt>
                  <dd className="text-foreground">{ref.poe}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cabo dedicado / caminho</dt>
                  <dd className="text-foreground">{ref.cabo}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Verificar no survey: </span>
                {ref.verificar}
              </p>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">{TIPOLOGIA_NOTA}</p>
      </CardContent>
    </Card>
  );
}
