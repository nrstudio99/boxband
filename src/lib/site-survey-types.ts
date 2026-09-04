// Modelo de dados da Ficha de Site Survey — Salas de Videoconferência | Logitech + Barco
// Espelha as secções do formulário original (PDF "Ficha de Site Survey").

export type Tipologia = "A1" | "A2" | "B" | "";

export interface EnergiaDadosZona {
  zona: string;
  v230Existentes: string;
  v230Novos: string;
  rj45Existentes: string;
  rj45Novos: string;
  poe: string;
  acao: string;
}

export interface SiteSurveyData {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Cabeçalho
  cliente: string;
  edificio: string;
  salaId: string;
  piso: string;
  data: string;
  tecnico: string;
  tipologia: Tipologia;
  capacidade: string;

  // 2. Levantamento da sala
  dimC: string;
  dimL: string;
  dimH: string;
  tvDimensao: string;
  distanciaMesaTv: string;
  alturaCentroTv: string;
  paredeTv: string;
  paredeTvOutro: string;
  mesaFormato: string;
  falsoTeto: string;
  chaoTecnico: string;
  acessoZonaTv: string;
  espacoFontes: string;
  grommet: string;
  obra: string;

  // 3. Energia e dados
  energiaDados: EnergiaDadosZona[];

  // 4. Caminhos de cabos
  percurso: string[];
  percursoOutro: string;
  diametro: string;
  distanciaCabo: string;
  energiaDadosOk: string;
  caboDedicado: string;
  origem: string;
  destino: string;
  comprimento: string;
  passagens: string;
  separacao: string;
  reservaFutura: string;
  acaoCabos: string;

  // 5. Rede e conclusão
  rackIdf: string;
  switchPortas: string;
  vlan: string;
  nac8021x: string;
  dhcpInternet: string;
  poeBudget: string;
  wifi: string;
  salaPronta: string;
  acoesCondicionantes: string;
  fotos: string[];
  tecnicoConclusao: string;
  dataConclusao: string;
}

export const ZONAS_ENERGIA = ["TV / frontal", "Mesa / pavimento", "Exterior da sala"] as const;

export const PERCURSO_OPCOES = ["Tubagem", "Calha", "Falso teto", "Chão técnico", "Outro"] as const;
export const FOTOS_OPCOES = ["Geral", "TV", "Mesa", "Exterior"] as const;

interface TipologiaRef {
  label: Exclude<Tipologia, "">;
  qt: string;
  equipamento: string;
  v230: string;
  rj45: string;
  poe: string;
  cabo: string;
  verificar: string;
}

export const TIPOLOGIA_REF: Record<Exclude<Tipologia, "">, TipologiaRef> = {
  A1: {
    label: "A1",
    qt: "1",
    equipamento: "Rally Bar + Tap IP + Tap Scheduler + CX-20",
    v230: "3 mín. / 4 rec.*",
    rj45: "4",
    poe: "2 PoE",
    cabo: "Não",
    verificar: "Tomadas TV; RJ45 mesa; RJ45 exterior; espaço atrás TV",
  },
  A2: {
    label: "A2",
    qt: "4",
    equipamento: "A1 + Logitech Sight",
    v230: "3 mín. / 4 rec.*",
    rj45: "5",
    poe: "2 PoE + 1 PoE+",
    cabo: "Cat6A SFTP/SSTP Sight a Rally Bar, máx. 40 m",
    verificar: "PoE+ e Cat6A dedicado na zona do Sight; percurso até TV",
  },
  B: {
    label: "B",
    qt: "6",
    equipamento: "Rally Bar Huddle + Extend + CX-20",
    v230: "4 mín. / 5 rec.*",
    rj45: "2",
    poe: "Não",
    cabo: "Cat6A U/FTP Extend TX a RX, máx. 100 m",
    verificar: "Percurso mesa a TV; TX sob mesa; RX e fonte junto TV",
  },
};

export const TIPOLOGIA_NOTA =
  "* 1 TV por sala e ClickShare alimentado por AC. Na tipologia B, para charging do portátil via Extend, prever mais 1 tomada 230 V junto à mesa.";

function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `ss-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptySurvey(): SiteSurveyData {
  const now = new Date().toISOString();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,

    cliente: "",
    edificio: "",
    salaId: "",
    piso: "",
    data: todayISO(),
    tecnico: "",
    tipologia: "",
    capacidade: "",

    dimC: "",
    dimL: "",
    dimH: "",
    tvDimensao: "",
    distanciaMesaTv: "",
    alturaCentroTv: "",
    paredeTv: "",
    paredeTvOutro: "",
    mesaFormato: "",
    falsoTeto: "",
    chaoTecnico: "",
    acessoZonaTv: "",
    espacoFontes: "",
    grommet: "",
    obra: "",

    energiaDados: ZONAS_ENERGIA.map((zona) => ({
      zona,
      v230Existentes: "",
      v230Novos: "",
      rj45Existentes: "",
      rj45Novos: "",
      poe: "",
      acao: "",
    })),

    percurso: [],
    percursoOutro: "",
    diametro: "",
    distanciaCabo: "",
    energiaDadosOk: "",
    caboDedicado: "",
    origem: "",
    destino: "",
    comprimento: "",
    passagens: "",
    separacao: "",
    reservaFutura: "",
    acaoCabos: "",

    rackIdf: "",
    switchPortas: "",
    vlan: "",
    nac8021x: "",
    dhcpInternet: "",
    poeBudget: "",
    wifi: "",
    salaPronta: "",
    acoesCondicionantes: "",
    fotos: [],
    tecnicoConclusao: "",
    dataConclusao: "",
  };
}

/** Percentagem (0-100) de campos de texto/escolha preenchidos, como indicador de progresso. */
export function getCompleteness(survey: SiteSurveyData): number {
  const { id, createdAt, updatedAt, energiaDados, percurso, fotos, ...rest } = survey;
  const scalarValues = Object.values(rest);
  const total = scalarValues.length + energiaDados.length * 6 + 2; // +2 para os grupos multi-escolha
  let filled = scalarValues.filter((v) => v !== "").length;
  filled += percurso.length > 0 ? 1 : 0;
  filled += fotos.length > 0 ? 1 : 0;
  for (const zona of energiaDados) {
    const { zona: _z, ...campos } = zona;
    filled += Object.values(campos).filter((v) => v !== "").length;
  }
  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
}
