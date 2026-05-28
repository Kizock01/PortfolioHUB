import { filterQuestions } from "@/services/questionProviders/mockProvider";
import type { Question, QuestionFilters } from "@/types/question";

function getCacheKey(year: number, limit: number, offset: number) {
  return `questions:enem:${year}:${limit}:${offset}`;
}

function getYearsCacheKey() {
  return "questions:enem:years";
}

function readCache(year: number, limit: number, offset: number): Question[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const cacheKey = getCacheKey(year, limit, offset);
  const raw = window.localStorage.getItem(cacheKey);

  if (!raw) {
    return null;
  }

  try {
    const questions = JSON.parse(raw) as Question[];

    if (!questions.every((question) => question.area && question.subject && question.difficulty)) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    return questions;
  } catch {
    window.localStorage.removeItem(cacheKey);
    return null;
  }
}

function writeCache(year: number, limit: number, offset: number, questions: Question[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getCacheKey(year, limit, offset), JSON.stringify(questions.slice(0, limit)));
}

export async function getEnemQuestions(
  year: number | "all",
  filters?: Partial<QuestionFilters>,
): Promise<Question[]> {
  debugLog("[StudyQuest][enem.dev] provider ativo", { year, filters });

  if (year === "all") {
    const years = await getAvailableEnemYears();
    const recentYear = years[0] ?? 2023;
    const recentQuestions = await getEnemQuestions(recentYear, { ...filters, year: recentYear });
    return recentQuestions.slice(0, Math.max(1, filters?.limit ?? 15));
  }

  const limit = Math.max(1, Math.min(15, filters?.limit ?? 15));
  const offset = Math.max(0, filters?.offset ?? 0);
  const cached = readCache(year, limit, offset);

  if (cached) {
    debugLog("[StudyQuest][enem.dev] cache hit", { year, count: cached.length });
    return filterQuestions(cached, { ...filters, offset: 0, limit });
  }

  const response = await fetchWithTimeout(`/api/questions/enem?year=${year}&limit=${limit}&offset=${offset}`, {
    headers: { Accept: "application/json" },
    retries: 2,
    timeoutMs: 8000,
  });

  if (!response.ok) {
    debugWarn("[StudyQuest][enem.dev] route handler falhou", response.status);
    throw new Error(`Route handler retornou status ${response.status}`);
  }

  const data = (await response.json()) as { questions: Question[]; debug?: unknown };
  debugLog("[StudyQuest][enem.dev] resposta normalizada", {
    year,
    count: data.questions?.length,
    sample: data.questions?.[0],
    debug: data.debug,
  });

  const questions = data.questions ?? [];

  writeCache(year, limit, offset, questions);

  return filterQuestions(questions, { ...filters, offset: 0, limit });
}

export async function getAvailableEnemYears(): Promise<number[]> {
  if (typeof window !== "undefined") {
    const cached = window.localStorage.getItem(getYearsCacheKey());

    if (cached) {
      try {
        return JSON.parse(cached) as number[];
      } catch {
        window.localStorage.removeItem(getYearsCacheKey());
      }
    }
  }

  const response = await fetchWithTimeout("/api/questions/enem", {
    headers: { Accept: "application/json" },
    retries: 2,
    timeoutMs: 12000,
  });

  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar anos ENEM: ${response.status}`);
  }

  const data = (await response.json()) as { years: number[] };
  const years = data.years ?? [];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(getYearsCacheKey(), JSON.stringify(years));
  }

  return years;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number; retries?: number } = {},
) {
  const { timeoutMs = 15000, retries = 1, ...requestInit } = init;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...requestInit,
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      return response;
    } catch (error) {
      window.clearTimeout(timeout);
      lastError = error;
      debugWarn("[StudyQuest][questions] fetch attempt failed", {
        attempt,
        input: input.toString(),
        error,
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Falha de rede");
}

function debugLog(message: string, payload?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.log(message, payload);
  }
}

function debugWarn(message: string, payload?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn(message, payload);
  }
}
