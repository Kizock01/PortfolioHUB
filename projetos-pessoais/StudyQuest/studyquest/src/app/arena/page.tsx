"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DevMountLog } from "@/components/DevMountLog";
import { Sidebar } from "@/components/Sidebar";
import { ArenaHistory } from "@/components/arena/ArenaHistory";
import { ArenaMatch } from "@/components/arena/ArenaMatch";
import { ArenaResult } from "@/components/arena/ArenaResult";
import { ArenaSetup } from "@/components/arena/ArenaSetup";
import { ArenaStats } from "@/components/arena/ArenaStats";
import { RankCard } from "@/components/arena/RankCard";
import { mockArenaQuestions } from "@/data/mockArenaQuestions";
import { subjectNames } from "@/data/mock-game";
import {
  playCorrectSound,
  playCountdownFinal,
  playCountdownTick,
  playVictorySound,
  playWrongSound,
  preloadArenaSounds,
} from "@/lib/audio/arenaSounds";
import { getArenaState, getRankByPoints, saveArenaState, updateArenaState } from "@/services/arenaService";
import { useAuth } from "@/store/AuthContext";
import type { ArenaCompetitiveState, ArenaPlayerStats, ArenaResult as ArenaResultType, ArenaSettings } from "@/types/arena";
import type { Question } from "@/types/question";

type ArenaAlphaPhase = "setup" | "countdown" | "playing" | "feedback" | "result";
type Scores = {
  player: ArenaPlayerStats;
  bot: ArenaPlayerStats;
};

const initialSettings: ArenaSettings = {
  mode: "bot",
  subject: "all",
  topic: "all",
  difficulty: "all",
  questionCount: 5,
  timePerQuestion: 15,
  ranked: true,
};

const COUNTDOWN_START = 3;
const FEEDBACK_DELAY_MS = 800;
const BOT_REACTION_MS = 2600;
const BOT_TIMEOUT_CHANCE = 0.2;
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

function emptyStats(name: string): ArenaPlayerStats {
  return {
    name,
    score: 0,
    hits: 0,
    misses: 0,
    combo: 0,
    bestCombo: 0,
    buzzWins: 0,
    totalResponseMs: 0,
    responses: 0,
  };
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function getBotAccuracy(difficulty: Question["difficulty"]) {
  if (difficulty === "easy") return 0.45;
  if (difficulty === "medium") return 0.55;
  if (difficulty === "hard") return 0.65;
  return 0.72;
}

function pickBotAnswer(question: Question) {
  const alternatives = question.alternatives;
  const shouldHit = Math.random() < getBotAccuracy(question.difficulty);
  if (shouldHit) return question.correctAlternativeId;
  const wrongAlternatives = alternatives.filter((alternative) => alternative.id !== question.correctAlternativeId);
  return shuffle(wrongAlternatives)[0]?.id ?? alternatives[0]?.id ?? "";
}

function updateStats(current: ArenaPlayerStats, correct: boolean) {
  if (!correct) {
    return {
      ...current,
      score: Math.max(0, current.score - 50),
      misses: current.misses + 1,
      combo: 0,
      responses: current.responses + 1,
    };
  }

  const combo = current.combo + 1;
  const comboBonus = combo > 0 && combo % 3 === 0 ? 100 : 0;
  return {
    ...current,
    score: current.score + 100 + comboBonus,
    hits: current.hits + 1,
    combo,
    bestCombo: Math.max(current.bestCombo, combo),
    responses: current.responses + 1,
  };
}

function buildResult(scores: Scores, arenaState: ArenaCompetitiveState, settings: ArenaSettings): ArenaResultType {
  const winner = scores.player.score === scores.bot.score
    ? "draw"
    : scores.player.score > scores.bot.score
      ? "p1"
      : "p2";
  const xpGained = scores.player.hits * 35;
  const goldGained = scores.player.hits * 10;
  const nextState = updateArenaState({
    current: arenaState,
    mode: "bot",
    p1: scores.player,
    p2: scores.bot,
    pointsDelta: 0,
    subject: settings.subject,
    xpGained,
  });

  return {
    winner,
    p1: scores.player,
    p2: scores.bot,
    xpGained,
    goldGained,
    pointsDelta: 0,
    rank: getRankByPoints(nextState.competitivePoints),
    state: nextState,
  };
}

export default function ArenaPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";

  const [settings, setSettings] = useState<ArenaSettings>(initialSettings);
  const [phase, setPhase] = useState<ArenaAlphaPhase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSettings.timePerQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [botAnswer, setBotAnswer] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("Prepare-se.");
  const [answerStatus, setAnswerStatus] = useState<"correct" | "wrong" | null>(null);
  const [locked, setLocked] = useState(false);
  const [scores, setScores] = useState<Scores>({
    player: emptyStats("Voce"),
    bot: emptyStats("Bot"),
  });
  const [arenaState, setArenaState] = useState<ArenaCompetitiveState>(initialArenaState);
  const [result, setResult] = useState<ArenaResultType | null>(null);

  const countdownTimerRef = useRef<number | null>(null);
  const roundTimerRef = useRef<number | null>(null);
  const botTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const scoresRef = useRef(scores);
  const currentIndexRef = useRef(currentIndex);

  const currentQuestion = questions[currentIndex] ?? null;
  const currentRank = useMemo(() => getRankByPoints(arenaState.competitivePoints), [arenaState.competitivePoints]);
  const rankLabel = `${currentRank.name} ${currentRank.division}`;

  const clearTimers = useCallback(() => {
    if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
    if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
    if (botTimerRef.current) window.clearTimeout(botTimerRef.current);
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    countdownTimerRef.current = null;
    roundTimerRef.current = null;
    botTimerRef.current = null;
    feedbackTimerRef.current = null;
  }, []);

  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setArenaState(getArenaState(userId));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [userId]);

  useEffect(() => clearTimers, [clearTimers]);

  const resetRoundState = useCallback(() => {
    lockedRef.current = false;
    setLocked(false);
    setSelectedAnswer(null);
    setBotAnswer(null);
    setAnswerStatus(null);
    setFeedbackMessage("Responda antes do bot.");
    setSecondsRemaining(settings.timePerQuestion);
    setCountdown(COUNTDOWN_START);
  }, [settings.timePerQuestion]);

  const advanceRound = useCallback((nextScores = scoresRef.current) => {
    clearTimers();
    resetRoundState();

    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= questions.length) {
      const nextResult = buildResult(nextScores, arenaState, settings);
      setResult(nextResult);
      setArenaState(nextResult.state);
      saveArenaState(userId, nextResult.state);
      playVictorySound();
      setPhase("result");
      return;
    }

    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    setPhase("countdown");
  }, [arenaState, clearTimers, questions.length, resetRoundState, settings, userId]);

  const scheduleAdvance = useCallback((nextScores?: Scores) => {
    feedbackTimerRef.current = window.setTimeout(() => {
      advanceRound(nextScores);
    }, FEEDBACK_DELAY_MS);
  }, [advanceRound]);

  const lockWithFeedback = useCallback((params: {
    actor: "player" | "bot" | "timeout";
    answerId?: string;
    correct?: boolean;
  }) => {
    if (lockedRef.current || !currentQuestion) return;
    lockedRef.current = true;
    setLocked(true);
    clearTimers();
    setPhase("feedback");

    if (params.actor === "timeout") {
      setFeedbackMessage("Tempo esgotado.");
      setAnswerStatus(null);
      playWrongSound();
      scheduleAdvance();
      return;
    }

    const correct = Boolean(params.correct);
    const nextScores: Scores = {
      player: params.actor === "player" ? updateStats(scoresRef.current.player, correct) : scoresRef.current.player,
      bot: params.actor === "bot" ? updateStats(scoresRef.current.bot, correct) : scoresRef.current.bot,
    };

    scoresRef.current = nextScores;
    setScores(nextScores);
    setAnswerStatus(correct ? "correct" : "wrong");
    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    if (params.actor === "player") {
      setSelectedAnswer(params.answerId ?? null);
      setFeedbackMessage(correct ? "Voce acertou." : "Voce errou.");
    } else {
      setBotAnswer(params.answerId ?? null);
      setFeedbackMessage(correct ? "Bot acertou." : "Bot errou.");
    }

    scheduleAdvance(nextScores);
  }, [clearTimers, currentQuestion, scheduleAdvance]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      countdownTimerRef.current = window.setTimeout(() => {
        setPhase("playing");
        setFeedbackMessage("Responda antes do bot.");
      }, 0);
      return () => {
        if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
      };
    }

    if (countdown === 1) {
      playCountdownFinal();
    } else {
      playCountdownTick();
    }

    countdownTimerRef.current = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 700);

    return () => {
      if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
    };
  }, [countdown, phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (secondsRemaining <= 0) {
      feedbackTimerRef.current = window.setTimeout(() => {
        lockWithFeedback({ actor: "timeout" });
      }, 0);
      return () => {
        if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
      };
    }

    roundTimerRef.current = window.setTimeout(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
    };
  }, [lockWithFeedback, phase, secondsRemaining]);

  useEffect(() => {
    if (phase !== "playing" || !currentQuestion) return;
    const botReactionMs = Math.random() < BOT_TIMEOUT_CHANCE
      ? settings.timePerQuestion * 1000 + 500
      : BOT_REACTION_MS;
    botTimerRef.current = window.setTimeout(() => {
      const answerId = pickBotAnswer(currentQuestion);
      lockWithFeedback({
        actor: "bot",
        answerId,
        correct: answerId === currentQuestion.correctAlternativeId,
      });
    }, botReactionMs);

    return () => {
      if (botTimerRef.current) window.clearTimeout(botTimerRef.current);
    };
  }, [currentQuestion, lockWithFeedback, phase, settings.timePerQuestion]);

  const startMatch = useCallback(() => {
    preloadArenaSounds();
    clearTimers();
    const pool = settings.subject === "all"
      ? mockArenaQuestions
      : mockArenaQuestions.filter((question) => question.subject === settings.subject);
    const selectedQuestions = shuffle(pool.length ? pool : mockArenaQuestions).slice(0, settings.questionCount);

    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setScores({ player: emptyStats("Voce"), bot: emptyStats("Bot") });
    scoresRef.current = { player: emptyStats("Voce"), bot: emptyStats("Bot") };
    setResult(null);
    resetRoundState();
    setFeedbackMessage("Prepare-se.");
    setPhase("countdown");
  }, [clearTimers, resetRoundState, settings.questionCount, settings.subject]);

  const answerPlayer = useCallback((answerId: string) => {
    if (phase !== "playing" || !currentQuestion || lockedRef.current) return;
    lockWithFeedback({
      actor: "player",
      answerId,
      correct: answerId === currentQuestion.correctAlternativeId,
    });
  }, [currentQuestion, lockWithFeedback, phase]);

  const newSetup = useCallback(() => {
    clearTimers();
    resetRoundState();
    setPhase("setup");
  }, [clearTimers, resetRoundState]);

  return (
    <main className="quest-grid min-h-screen bg-[#070813] lg:flex">
      <DevMountLog label="Arena mounted" />
      <Sidebar />

      <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              {phase === "setup" ? (
                <ArenaSetup
                  settings={settings}
                  subjects={subjectNames}
                  topics={[]}
                  onChange={setSettings}
                  onStart={startMatch}
                  loading={false}
                  preMatch={{
                    years: [],
                    estimatedXp: settings.questionCount * 35,
                    estimatedGold: settings.questionCount * 10,
                  }}
                  rankLabel={rankLabel}
                />
              ) : null}

              {phase !== "setup" && phase !== "result" && currentQuestion ? (
                <ArenaMatch
                  phase={phase}
                  question={currentQuestion}
                  currentIndex={currentIndex}
                  totalRounds={questions.length}
                  countdown={countdown}
                  secondsRemaining={secondsRemaining}
                  player={scores.player}
                  bot={scores.bot}
                  message={feedbackMessage}
                  selectedAnswer={selectedAnswer}
                  botAnswer={botAnswer}
                  answerStatus={answerStatus}
                  locked={phase !== "playing" || locked}
                  onAlternative={answerPlayer}
                />
              ) : null}

              {phase === "result" && result ? (
                <ArenaResult result={result} onRestart={newSetup} onRematch={startMatch} />
              ) : null}
            </div>

            <div className="space-y-4">
              <RankCard rank={currentRank} state={arenaState} />
              <ArenaStats state={arenaState} />
              <ArenaHistory items={arenaState.history} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
