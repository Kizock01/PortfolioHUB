export type QuestionSource =
  | "mock"
  | "enem.dev"
  | "inep"
  | "vestibular"
  | "open-education";

export type QuestionDifficulty = "easy" | "medium" | "hard" | "legendary";

export type QuestionAlternative = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  source: QuestionSource;
  sourceUrl?: string;
  exam?: string;
  year?: number;
  area: string;
  subject: string;
  topic?: string;
  difficulty: QuestionDifficulty;
  statement: string;
  alternatives: QuestionAlternative[];
  correctAlternativeId?: string;
  explanation?: string;
  xp: number;
  images?: string[];
};

export type QuestionProviderId =
  | "mock"
  | "enem"
  | "inep"
  | "vestibular"
  | "open-education";

export type QuestionFilters = {
  source: QuestionProviderId;
  year?: number | "all";
  area?: string;
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty | "all";
  limit?: number;
  offset?: number;
};

export type QuestionLoadResult = {
  questions: Question[];
  provider: QuestionProviderId;
  usedFallback: boolean;
  error?: string;
};
