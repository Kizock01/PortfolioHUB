export type QuestDifficulty = "Facil" | "Media" | "Dificil" | "Lendaria";

export type QuestCadence = "diarias" | "semanais" | "epicas" | "redacao";

export type QuestCategory =
  | "Matematica"
  | "Portugues"
  | "Redacao"
  | "Historia"
  | "Geografia"
  | "Biologia"
  | "Fisica"
  | "Quimica"
  | "Ingles"
  | "Filosofia"
  | "Sociologia"
  | "Literatura";

export type SubjectStatus = "weak" | "strong" | "neutral";

export type Quest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  gold: number;
  difficulty: QuestDifficulty;
  category: QuestCategory;
  cadence: QuestCadence;
  duration: string;
};

export type Subject = {
  name: QuestCategory;
  level: number;
  xp: number;
  nextLevelXp: number;
  status: SubjectStatus;
};

export type Player = {
  name: string;
  title: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  completedQuests: number;
  gold: number;
  badge: string;
};

export type CompletionFeedback = {
  id: string;
  xp: number;
  baseXp: number;
  gold: number;
  title: string;
  bonusLabel: string;
};

export type AcademicProfile = {
  weakSubjects: QuestCategory[];
  strongSubjects: QuestCategory[];
  selectedTopics: string[];
  configured: boolean;
};

export type AcademicTitle = {
  name: string;
  requirement: string;
  minLevel: number;
};

export type QuestReward = {
  xp: number;
  baseXp: number;
  gold: number;
  multiplier: number;
  bonusLabel: string;
};
