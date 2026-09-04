import { TIPOLOGIA_REF, type SiteSurveyData } from "@/lib/site-survey-types";

function fmt(v: string | undefined): string {
  return v && v.trim() !== "" ? v : "—";
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "3px 0",
        fontSize: 11.5,
      }}
    >
      <span style={{ color: "#555" }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{fmt(value)}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ breakInside: "avoid", marginBottom: 14 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          borderBottom: "1.5px solid #000",
          paddingBottom: 4,
          marginBottom: 6,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Resumo em texto simples, pensado apenas para impressão / exportação em PDF (via impressão do browser). */
export function PrintSummary({ survey }: { survey: SiteSurveyData }) {
  const ref = survey.tipologia ? TIPOLOGIA_REF[survey.tipologia] : undefined;

  return (
    <div
      className="hidden print:block"
      style={{
        color: "#000",
        background: "#fff",
        padding: "12mm",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 2 }}>
        FICHA DE SITE SURVEY
      </h1>
      <p style={{ fontSize: 11, textAlign: "center", color: "#444", marginBottom: 12 }}>
        Salas de Videoconferência | Logitech + Barco
      </p>

      <Block title="Identificação">
        <Row label="Cliente / Projeto" value={survey.cliente} />
        <Row label="Edifício" value={survey.edificio} />
        <Row label="Sala / ID" value={survey.salaId} />
        <Row label="Piso" value={survey.piso} />
        <Row label="Data" value={survey.data} />
        <Row label="Técnico" value={survey.tecnico} />
        <Row label="Tipologia" value={survey.tipologia} />
        <Row
          label="Capacidade"
          value={survey.capacidade ? `${survey.capacidade} pessoas` : undefined}
        />
      </Block>

      {ref && (
        <Block title="1. Resumo das necessidades por tipologia">
          <Row label="Equipamento" value={ref.equipamento} />
          <Row label="Quantidade" value={ref.qt} />
          <Row label="230 V" value={ref.v230} />
          <Row label="RJ45" value={ref.rj45} />
          <Row label="PoE" value={ref.poe} />
          <Row label="Cabo dedicado / caminho" value={ref.cabo} />
          <Row label="Verificar no survey" value={ref.verificar} />
        </Block>
      )}

      <Block title="2. Levantamento da sala">
        <Row
          label="Dimensões C x L x H"
          value={
            [survey.dimC, survey.dimL, survey.dimH].some(Boolean)
              ? `${survey.dimC || "?"} x ${survey.dimL || "?"} x ${survey.dimH || "?"}`
              : undefined
          }
        />
        <Row label="TV / dimensão" value={survey.tvDimensao} />
        <Row label="Distância mesa a TV" value={survey.distanciaMesaTv} />
        <Row label="Altura centro TV" value={survey.alturaCentroTv} />
        <Row
          label="Parede TV"
          value={survey.paredeTv === "Outro" ? survey.paredeTvOutro || "Outro" : survey.paredeTv}
        />
        <Row label="Mesa / formato" value={survey.mesaFormato} />
        <Row label="Falso teto" value={survey.falsoTeto} />
        <Row label="Chão técnico" value={survey.chaoTecnico} />
        <Row label="Acesso zona TV" value={survey.acessoZonaTv} />
        <Row label="Espaço fontes" value={survey.espacoFontes} />
        <Row label="Grommet / caixa mesa" value={survey.grommet} />
        <Row label="Obra" value={survey.obra} />
      </Block>

      <Block title="3. Energia e dados">
        {survey.energiaDados.map((z) => (
          <div key={z.zona} style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700 }}>{z.zona}</p>
            <Row label="230 V existentes" value={z.v230Existentes} />
            <Row label="230 V novos" value={z.v230Novos} />
            <Row label="RJ45 existentes" value={z.rj45Existentes} />
            <Row label="RJ45 novos" value={z.rj45Novos} />
            <Row label="PoE / PoE+" value={z.poe} />
            <Row label="Ação / observação" value={z.acao} />
          </div>
        ))}
      </Block>

      <Block title="4. Caminhos de cabos">
        <Row
          label="Percurso"
          value={survey.percurso.length ? survey.percurso.join(", ") : undefined}
        />
        <Row label="Diâmetro (mm)" value={survey.diametro} />
        <Row label="Distância (m)" value={survey.distanciaCabo} />
        <Row label="Energia / dados" value={survey.energiaDadosOk} />
        <Row label="Cabo dedicado" value={survey.caboDedicado} />
        <Row label="Origem" value={survey.origem} />
        <Row label="Destino" value={survey.destino} />
        <Row label="Comprimento (m)" value={survey.comprimento} />
        <Row label="Passagens / furos / obra" value={survey.passagens} />
        <Row label="Separação / obstáculos" value={survey.separacao} />
        <Row label="Reserva futura" value={survey.reservaFutura} />
        <Row label="Ação" value={survey.acaoCabos} />
      </Block>

      <Block title="5. Rede e conclusão">
        <Row label="Rack / IDF" value={survey.rackIdf} />
        <Row label="Switch / portas" value={survey.switchPortas} />
        <Row label="VLAN" value={survey.vlan} />
        <Row label="802.1X / NAC" value={survey.nac8021x} />
        <Row label="DHCP / Internet" value={survey.dhcpInternet} />
        <Row label="PoE budget" value={survey.poeBudget} />
        <Row label="Wi-Fi" value={survey.wifi} />
        <Row label="Sala pronta" value={survey.salaPronta} />
        <Row label="Ações / condicionantes" value={survey.acoesCondicionantes} />
        <Row label="Fotos" value={survey.fotos.length ? survey.fotos.join(", ") : undefined} />
        <Row label="Técnico" value={survey.tecnicoConclusao} />
        <Row label="Data" value={survey.dataConclusao} />
      </Block>
    </div>
  );
}
