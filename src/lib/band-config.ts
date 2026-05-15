export const SITE_PASSWORD = "ensaios2026";
export const SEASON_START = new Date(2026, 5, 1); // 1 Junho 2026
export const SEASON_END = new Date(2026, 8, 13); // 13 Setembro 2026

export const STATUS_META = {
  S: { label: "Sim", color: "var(--status-yes)", description: "Disponível" },
  N: { label: "Não", color: "var(--status-no)", description: "Indisponível" },
  C: { label: "Confirmar", color: "var(--status-maybe)", description: "A confirmar" },
} as const;

export type Status = keyof typeof STATUS_META;
export const STATUS_CYCLE: (Status | null)[] = ["S", "N", "C", null];

export const BAND_MEMBERS = [
  "Sertório Calado",
  "Nuno Oliveira",
  "Paulo Rosa",
  "Paulo Carvalho",
  "Micael Pereira",
  "Pedro Jesus",
  "Eduardo Azevedo",
  "João",
  "Pedro Cartaxo",
  "Paulo Ramos",
  "TC",
] as const;
