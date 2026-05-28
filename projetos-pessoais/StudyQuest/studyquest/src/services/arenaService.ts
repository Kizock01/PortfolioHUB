import { competitiveRanks } from "@/data/competitiveRanks";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ArenaCompetitiveState,
  ArenaHistoryItem,
  ArenaMode,
  ArenaPlayerStats,
} from "@/types/arena";

const storageKey = (userId: string) => `studyquest:user:${userId}:competitive`;
const syncPendingKey = "studyquest:sync-pending";
const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function setSyncPending(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(syncPendingKey, value ? "1" : "0");
}

function canSyncRemote(userId: string) {
  return uuidLike.test(userId);
}

const initialArenaState: ArenaCompetitiveState = {
  competitivePoints: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  bestCombo: 0,
  averageAccuracy: 0,
  highestScore: 0,
  mostPlayedSubject: "all",
  history: [],
};

export function getArenaState(userId: string): ArenaCompetitiveState {
  if (typeof window === "undefined") {
    return initialArenaState;
  }

  const raw = window.localStorage.getItem(storageKey(userId));
  if (!raw) {
    return initialArenaState;
  }

  try {
    const parsed = JSON.parse(raw) as ArenaCompetitiveState;
    return {
      ...initialArenaState,
      ...parsed,
      history: (parsed.history ?? []).slice(0, 5),
    };
  } catch {
    return initialArenaState;
  }
}

export function saveArenaState(userId: string, state: ArenaCompetitiveState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    storageKey(userId),
    JSON.stringify({ ...state, history: state.history.slice(0, 5) }),
  );
}

export async function loadArenaStateRemote(userId: string) {
  if (!canSyncRemote(userId)) return null;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("user_competitive")
      .select("competitive_points,wins,losses,draws,best_combo,average_accuracy,highest_score,most_played_subject,history")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      setSyncPending(true);
      if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] load competitive", error.message);
      return null;
    }
    if (!data) return null;
    setSyncPending(false);
    return {
      competitivePoints: data.competitive_points ?? 0,
      wins: data.wins ?? 0,
      losses: data.losses ?? 0,
      draws: data.draws ?? 0,
      bestCombo: data.best_combo ?? 0,
      averageAccuracy: data.average_accuracy ?? 0,
      highestScore: data.highest_score ?? 0,
      mostPlayedSubject: data.most_played_subject ?? "all",
      history: (data.history as ArenaHistoryItem[]) ?? [],
    } satisfies ArenaCompetitiveState;
  } catch (error) {
    setSyncPending(true);
    if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] load competitive", error);
    return null;
  }
}

export async function saveArenaStateRemote(userId: string, state: ArenaCompetitiveState) {
  if (!canSyncRemote(userId)) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("user_competitive").upsert({
      user_id: userId,
      competitive_points: state.competitivePoints,
      wins: state.wins,
      losses: state.losses,
      draws: state.draws,
      best_combo: state.bestCombo,
      average_accuracy: state.averageAccuracy,
      highest_score: state.highestScore,
      most_played_subject: state.mostPlayedSubject,
      history: state.history,
    });
    if (error) {
      setSyncPending(true);
      if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] save competitive", error.message);
      return;
    }
    setSyncPending(false);
  } catch (error) {
    setSyncPending(true);
    if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] save competitive", error);
  }
}

export function getRankByPoints(points: number) {
  return competitiveRanks.reduce((current, rank) => {
    return points >= rank.minPoints ? rank : current;
  }, competitiveRanks[0]);
}

export function getPointsToNextRank(points: number) {
  const next = competitiveRanks.find((rank) => rank.minPoints > points);
  if (!next) {
    return 0;
  }
  return next.minPoints - points;
}

export function computeBotReactionMs(seed: string, timePerQuestion: number) {
  const hash = seed.split("").reduce((acc, item) => acc + item.charCodeAt(0), 0);
  return 900 + (hash % 1300) + Math.round(timePerQuestion * 7);
}

export function shouldBotAnswerCorrectly(
  seed: string,
  difficulty: "easy" | "medium" | "hard" | "legendary",
) {
  const table = {
    easy: 0.58,
    medium: 0.68,
    hard: 0.76,
    legendary: 0.84,
  };
  const hash = seed.split("").reduce((acc, item) => acc + item.charCodeAt(0), 0);
  const threshold = hash % 100;
  return threshold < table[difficulty] * 100;
}

export function calculateMatchDelta(params: {
  result: "win" | "loss" | "draw";
  accuracy: number;
  avgResponseMs: number;
  bestCombo: number;
}) {
  const base = params.result === "win" ? 25 : params.result === "loss" ? -18 : 5;
  const accuracyBonus = Math.round((params.accuracy - 50) / 6);
  const speedBonus = params.avgResponseMs > 0 ? (params.avgResponseMs < 4000 ? 4 : -2) : 0;
  const comboBonus = Math.min(6, Math.floor(params.bestCombo / 2));
  const raw = base + accuracyBonus + speedBonus + comboBonus;

  if (params.result === "win") {
    return Math.max(25, Math.min(40, raw));
  }
  if (params.result === "loss") {
    return Math.max(-25, Math.min(-10, raw));
  }
  return Math.max(5, raw);
}

export function updateArenaState(params: {
  current: ArenaCompetitiveState;
  mode: ArenaMode;
  p1: ArenaPlayerStats;
  p2: ArenaPlayerStats;
  pointsDelta: number;
  subject: string;
  xpGained: number;
}): ArenaCompetitiveState {
  const result =
    params.p1.score === params.p2.score ? "draw" : params.p1.score > params.p2.score ? "win" : "loss";
  const totalAnswers = params.p1.hits + params.p1.misses;
  const accuracy = totalAnswers > 0 ? Math.round((params.p1.hits / totalAnswers) * 100) : 0;
  const updatedGames = params.current.wins + params.current.losses + params.current.draws + 1;
  const averagedAccuracy = Math.round(
    (params.current.averageAccuracy * (updatedGames - 1) + accuracy) / updatedGames,
  );

  const historyItem: ArenaHistoryItem = {
    id: `${Date.now()}`,
    createdAt: Date.now(),
    mode: params.mode,
    result,
    score: `${params.p1.score} x ${params.p2.score}`,
    pointsDelta: params.pointsDelta,
    subject: params.subject,
    xpGained: params.xpGained,
  };
  const subjects = [params.subject, ...params.current.history.map((item) => item.subject)];
  const countBySubject = subjects.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
  const mostPlayedSubject = Object.keys(countBySubject).sort(
    (a, b) => countBySubject[b] - countBySubject[a],
  )[0] ?? "all";

  return {
    competitivePoints: Math.max(0, params.current.competitivePoints + params.pointsDelta),
    wins: params.current.wins + (result === "win" ? 1 : 0),
    losses: params.current.losses + (result === "loss" ? 1 : 0),
    draws: params.current.draws + (result === "draw" ? 1 : 0),
    bestCombo: Math.max(params.current.bestCombo, params.p1.bestCombo),
    averageAccuracy: averagedAccuracy,
    highestScore: Math.max(params.current.highestScore, params.p1.score),
    mostPlayedSubject,
    history: [historyItem, ...params.current.history].slice(0, 5),
  };
}
