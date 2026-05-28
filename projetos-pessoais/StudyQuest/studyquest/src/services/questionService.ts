import type { QuestionFilters, QuestionLoadResult } from "@/types/question";

export const enemYears = [
  2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011,
  2010, 2009,
];
const requestCache = new Map<string, Promise<QuestionLoadResult>>();

function buildCacheKey(filters: QuestionFilters) {
  return JSON.stringify({
    source: filters.source,
    year: filters.year ?? "all",
    area: filters.area ?? "all",
    subject: filters.subject ?? "all",
    topic: filters.topic ?? "all",
    difficulty: filters.difficulty ?? "all",
    limit: filters.limit ?? 15,
    offset: filters.offset ?? 0,
  });
}

export async function loadQuestions(
  filters: QuestionFilters,
): Promise<QuestionLoadResult> {
  const normalizedFilters = { ...filters, limit: filters.limit ?? 15, offset: filters.offset ?? 0 };
  const cacheKey = buildCacheKey(normalizedFilters);
  debugLog("[StudyQuest][questionService] provider solicitado", filters);

  const cached = requestCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const request = loadQuestionsInternal(filters, normalizedFilters);
  requestCache.set(cacheKey, request);
  return request;
}

async function loadQuestionsInternal(
  filters: QuestionFilters,
  normalizedFilters: QuestionFilters,
): Promise<QuestionLoadResult> {
  try {
    if (filters.source === "mock") {
      const { getMockQuestions } = await import("@/services/questionProviders/mockProvider");
      return {
        questions: await getMockQuestions(normalizedFilters),
        provider: "mock",
        usedFallback: false,
      };
    }

    if (filters.source === "enem") {
      const { getEnemQuestions } = await import("@/services/questionProviders/enemDevProvider");
      return {
        questions: await getEnemQuestions(normalizedFilters.year ?? 2023, normalizedFilters),
        provider: "enem",
        usedFallback: false,
      };
    }

    if (filters.source === "inep") {
      const { getInepQuestions } = await import("@/services/questionProviders/inepProvider");
      return {
        questions: await getInepQuestions(),
        provider: "inep",
        usedFallback: false,
      };
    }

    if (filters.source === "vestibular") {
      const { getVestibularQuestions } = await import("@/services/questionProviders/vestibularProvider");
      return {
        questions: await getVestibularQuestions(),
        provider: "vestibular",
        usedFallback: false,
      };
    }

    const { getOpenEducationQuestions } = await import("@/services/questionProviders/openEducationProvider");
    return {
      questions: await getOpenEducationQuestions(),
      provider: "open-education",
      usedFallback: false,
    };
  } catch (error) {
    debugWarn("[StudyQuest][questionService] falha ao carregar fonte externa", {
      source: filters.source,
      error,
    });
    const { getMockQuestions } = await import("@/services/questionProviders/mockProvider");
    const fallbackQuestions = await getMockQuestions(normalizedFilters);

    return {
      questions: fallbackQuestions,
      provider: "mock",
      usedFallback: true,
      error:
        error instanceof Error
          ? error.message
          : "Falha ao carregar fonte externa.",
    };
  } finally {
    const cacheKey = buildCacheKey(normalizedFilters);
    setTimeout(() => requestCache.delete(cacheKey), 25000);
  }
}

export async function loadAvailableEnemYears() {
  try {
    const { getAvailableEnemYears } = await import("@/services/questionProviders/enemDevProvider");
    return await getAvailableEnemYears();
  } catch (error) {
    debugWarn("[StudyQuest][questionService] anos ENEM indisponiveis", error);
    return enemYears;
  }
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
