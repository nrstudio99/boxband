import { type SiteSurveyData } from "@/lib/site-survey-types";

const STORAGE_KEY = "boxband:site-surveys:v1";

function readAll(): Record<string, SiteSurveyData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SiteSurveyData>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, SiteSurveyData>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Armazenamento indisponível ou cheio — ignorar silenciosamente.
  }
}

export function listSurveys(): SiteSurveyData[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getSurvey(id: string): SiteSurveyData | undefined {
  return readAll()[id];
}

export function saveSurvey(survey: SiteSurveyData): SiteSurveyData {
  const all = readAll();
  const saved: SiteSurveyData = { ...survey, updatedAt: new Date().toISOString() };
  all[survey.id] = saved;
  writeAll(all);
  return saved;
}

export function deleteSurvey(id: string): void {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

export function duplicateSurvey(id: string): SiteSurveyData | undefined {
  const original = readAll()[id];
  if (!original) return undefined;
  const now = new Date().toISOString();
  const copy: SiteSurveyData = {
    ...original,
    id: crypto.randomUUID(),
    salaId: original.salaId ? `${original.salaId} (cópia)` : original.salaId,
    createdAt: now,
    updatedAt: now,
  };
  const all = readAll();
  all[copy.id] = copy;
  writeAll(all);
  return copy;
}
