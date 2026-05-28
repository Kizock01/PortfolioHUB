import { NextResponse } from "next/server";
import { getAreaForSubject } from "@/data/studyTaxonomy";
import type { Question, QuestionDifficulty } from "@/types/question";

const ENEM_API_BASE = "https://api.enem.dev/v1";

type EnemExam = {
  title?: string;
  year: number;
};

type EnemAlternative = {
  letter: string;
  text?: string;
  file?: string;
  isCorrect?: boolean;
};

type EnemQuestion = {
  title?: string;
  index: number;
  discipline?: string;
  language?: string;
  year: number;
  context?: string;
  files?: string[];
  correctAlternative?: string;
  alternativesIntroduction?: string;
  alternatives?: EnemAlternative[];
};

type EnemQuestionsPayload = {
  metadata?: {
    limit?: number;
    offset?: number;
    total?: number;
    hasMore?: boolean;
  };
  questions?: EnemQuestion[];
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = url.searchParams.get("year");
  const limit = clampNumber(Number(url.searchParams.get("limit") ?? 15), 1, 15);
  const offset = clampNumber(Number(url.searchParams.get("offset") ?? 0), 0, 500);

  try {
    if (!year) {
      const exams = await fetchJson<EnemExam[]>(`${ENEM_API_BASE}/exams`);
      const years = exams
        .map((exam) => exam.year)
        .filter((item): item is number => Number.isFinite(item))
        .sort((a, b) => b - a);

      debugLog("[StudyQuest][api/enem] anos carregados", years);

      return NextResponse.json({ years });
    }

    const rawQuestions = await fetchQuestionPage(year, limit, offset);
    const questions = rawQuestions.map(normalizeEnemQuestion);

    debugLog("[StudyQuest][api/enem] questoes carregadas", {
      year,
      total: rawQuestions.length,
      normalized: questions.length,
      sample: questions[0],
    });

    return NextResponse.json({
      questions,
      debug: {
        year: Number(year),
        total: rawQuestions.length,
        normalized: questions.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    debugWarn("[StudyQuest][api/enem] erro real", error);

    return NextResponse.json(
      {
        error: "Nao foi possivel sincronizar questoes do ENEM agora.",
      },
      { status: 502 },
    );
  }
}

async function fetchQuestionPage(year: string, limit: number, offset: number) {
  const payload = await fetchJson<EnemQuestionsPayload>(
    `${ENEM_API_BASE}/exams/${year}/questions?limit=${limit}&offset=${offset}`,
  );

  debugLog("[StudyQuest][api/enem] pagina carregada", {
    year,
    limit: payload.metadata?.limit,
    offset: payload.metadata?.offset,
    received: payload.questions?.length ?? 0,
    hasMore: payload.metadata?.hasMore,
  });

  return payload.questions ?? [];
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "StudyQuest/1.0",
      },
      next: { revalidate: 60 * 60 },
      signal: controller.signal,
    });

    debugLog("[StudyQuest][api/enem] resposta externa", {
      url,
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      throw new Error(`enem.dev status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function inferDifficulty(question: EnemQuestion): QuestionDifficulty {
  const length = `${question.context ?? ""} ${question.alternativesIntroduction ?? ""}`.length;
  const imageCount = (question.files?.length ?? 0) + (question.alternatives?.filter((alt) => alt.file).length ?? 0);
  const supportTextCount = (question.context?.match(/\*\*TEXTO|TEXTO\s+[IVX]+/gi) ?? []).length;
  const alternativesComplexity =
    question.alternatives?.reduce((total, alternative) => total + (alternative.text?.length ?? 0), 0) ?? 0;

  if (length > 2600 || imageCount >= 2 || supportTextCount >= 3 || alternativesComplexity > 1400) {
    return "legendary";
  }

  if (imageCount > 0 || length > 1400 || supportTextCount >= 2 || alternativesComplexity > 800) {
    return "hard";
  }

  if (length > 550 || alternativesComplexity > 420) {
    return "medium";
  }

  return "easy";
}

function mapSubject(question: EnemQuestion) {
  if (question.language === "ingles") {
    return "Ingles";
  }

  switch (question.discipline) {
    case "matematica":
      return "Matematica";
    case "ciencias-natureza":
      return "Biologia";
    case "ciencias-humanas":
      return "Historia";
    case "linguagens":
      return "Portugues";
    default:
      return "Portugues";
  }
}

function inferTopic(question: EnemQuestion, subject: string) {
  const text = `${question.context ?? ""} ${question.alternativesIntroduction ?? ""}`.toLowerCase();

  if (subject === "Matematica") {
    if (text.includes("porcent")) return "Porcentagem";
    if (text.includes("probab")) return "Probabilidade";
    if (text.includes("func")) return "Funcoes";
    if (text.includes("geometr") || text.includes("area") || text.includes("volume")) return "Geometria";
    if (text.includes("media") || text.includes("grafico") || text.includes("tabela")) return "Estatistica";
    if (text.includes("razao") || text.includes("propor")) return "Razao e proporcao";
    return "Algebra";
  }

  if (subject === "Portugues") {
    if (text.includes("figura")) return "Figuras de linguagem";
    if (text.includes("concord")) return "Concordancia";
    if (text.includes("regenc")) return "Regencia";
    return "Interpretacao de texto";
  }

  if (subject === "Ingles") return "Text interpretation";
  if (subject === "Historia") return "Republica";
  if (subject === "Biologia") return "Ecologia";

  return question.discipline ?? subject;
}

function getXp(difficulty: QuestionDifficulty) {
  return {
    easy: 80,
    medium: 120,
    hard: 170,
    legendary: 260,
  }[difficulty];
}

function normalizeEnemQuestion(question: EnemQuestion): Question {
  const subject = mapSubject(question);
  const difficulty = inferDifficulty(question);
  const images = [
    ...(question.files ?? []),
    ...(question.alternatives?.flatMap((alternative) =>
      alternative.file ? [alternative.file] : [],
    ) ?? []),
  ];

  return {
    id: `enem-${question.year}-${question.index}`,
    source: "enem.dev",
    sourceUrl: `https://enem.dev/${question.year}/questions/${question.index}`,
    exam: question.title ?? `ENEM ${question.year}`,
    year: question.year,
    area: getAreaForSubject(subject),
    subject,
    topic: inferTopic(question, subject),
    difficulty,
    statement: [question.context, question.alternativesIntroduction].filter(Boolean).join("\n\n"),
    alternatives:
      question.alternatives?.map((alternative) => ({
        id: alternative.letter,
        text:
          alternative.text ||
          (alternative.file ? "Alternativa com imagem" : "Alternativa sem texto"),
      })) ?? [],
    correctAlternativeId:
      question.correctAlternative ??
      question.alternatives?.find((alternative) => alternative.isCorrect)?.letter,
    explanation: "Explicacao ainda nao disponivel para esta questao.",
    xp: getXp(difficulty),
    images: Array.from(new Set(images)),
  };
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
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
