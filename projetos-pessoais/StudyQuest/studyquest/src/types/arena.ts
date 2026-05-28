import type { Question, QuestionDifficulty } from "@/types/question";
import type { CompetitiveRank } from "@/types/rank";

export type ArenaMode = "bot" | "local-2p" | "future-online";
export type ArenaPhase = "setup" | "countdown" | "question" | "result";

export type ArenaSettings = {
  mode: ArenaMode;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty | "all";
  questionCount: 5 | 10 | 15;
  timePerQuestion: 10 | 15 | 30 | 45;
  ranked: boolean;
};

export type ArenaPlayerStats = {
  name: string;
  score: number;
  hits: number;
  misses: number;
  combo: number;
  bestCombo: number;
  buzzWins: number;
  totalResponseMs: number;
  responses: number;
};

export type ArenaRoundState = {
  index: number;
  question: Question;
  msRemaining: number;
  responder: "p1" | "p2" | "bot" | null;
  locked: boolean;
};

export type ArenaHistoryItem = {
  id: string;
  createdAt: number;
  mode: ArenaMode;
  result: "win" | "loss" | "draw";
  score: string;
  pointsDelta: number;
  subject: string;
  xpGained: number;
};

export type ArenaCompetitiveState = {
  competitivePoints: number;
  wins: number;
  losses: number;
  draws: number;
  bestCombo: number;
  averageAccuracy: number;
  highestScore: number;
  mostPlayedSubject: string;
  history: ArenaHistoryItem[];
};

export type ArenaPreMatch = {
  years: number[];
  estimatedXp: number;
  estimatedGold: number;
};

export type ArenaResult = {
  winner: "p1" | "p2" | "draw";
  p1: ArenaPlayerStats;
  p2: ArenaPlayerStats;
  xpGained: number;
  goldGained: number;
  pointsDelta: number;
  rank: CompetitiveRank;
  state: ArenaCompetitiveState;
};
