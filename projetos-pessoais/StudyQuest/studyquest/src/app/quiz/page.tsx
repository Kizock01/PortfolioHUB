"use client";

/* eslint-disable @next/next/no-img-element */

import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Sparkles,
  Swords,
  XCircle,
  Zap,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { DevMountLog } from "@/components/DevMountLog";
import { GameFeedback } from "@/components/GameFeedback";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { subjectNames } from "@/data/mock-game";
import { getSubjectsForArea, getTopicsForSubject, studyAreas } from "@/data/studyTaxonomy";
import { enemYears, loadAvailableEnemYears, loadQuestions } from "@/services/questionService";
import { useGame } from "@/store/GameContext";
import type { QuestCategory } from "@/types/game";
import type { Question, QuestionDifficulty, QuestionProviderId } from "@/types/question";
const QUIZ_PAGE_SIZE = 15;

const sourceOptions: Array<{ label: string; value: QuestionProviderId }> = [
  { label: "Mock", value: "mock" },
  { label: "ENEM", value: "enem" },
  { label: "INEP", value: "inep" },
  { label: "Vestibulares", value: "vestibular" },
  { label: "Open Education", value: "open-education" },
];

const difficultyOptions: Array<{ label: string; value: QuestionDifficulty | "all" }> = [
  { label: "Todas", value: "all" },
  { label: "Facil", value: "easy" },
  { label: "Medio", value: "medium" },
  { label: "Dificil", value: "hard" },
  { label: "Lendario", value: "legendary" },
];

const sourceBadges = {
  mock: "Mock",
  "enem.dev": "ENEM",
  inep: "INEP",
  vestibular: "Vestibular",
  "open-education": "Open Source",
};

const difficultyLabels = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
  legendary: "Lendario",
};

export default function QuizPage() {
  const {
    answerQuestion,
    clearFeedback,
    getSubjectStatus,
    lastFeedback,
    levelUpMessage,
  } = useGame();
  const [source, setSource] = useState<QuestionProviderId>("mock");
  const [year, setYear] = useState<number | "all">("all");
  const [availableYears, setAvailableYears] = useState(enemYears);
  const [area, setArea] = useState("all");
  const [subject, setSubject] = useState("all");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | "all">("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingCopy, setLoadingCopy] = useState("Sincronizando questoes...");
  const [batchOffset, setBatchOffset] = useState(0);
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    xp: 0,
    gold: 0,
    streak: 0,
    bestStreak: 0,
  });

  useEffect(() => {
    let active = true;

    loadAvailableEnemYears().then((years) => {
      if (!active || years.length === 0) {
        return;
      }

      setAvailableYears(years);
      setYear((current) => (current === "all" || years.includes(current) ? current : years[0]));
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setMessage(null);
      setLoadingCopy(getLoadingCopy());
      setAnswered(false);
      setSelectedAlternativeId(null);

      const result = await loadQuestions({
        source,
        year,
        area,
        subject,
        topic,
        difficulty,
        limit: QUIZ_PAGE_SIZE,
        offset: batchOffset,
      });

      if (!active) {
        return;
      }

      setQuestions(result.questions);
      setCurrentIndex(0);
      setLoading(false);

      if (result.usedFallback) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[StudyQuest][quiz] fallback silencioso ativado", result.error);
        }
        setMessage("Algumas questoes nao puderam ser sincronizadas agora. Carregando desafios disponiveis.");
      } else if (result.questions.length === 0) {
        setMessage("Nenhuma questao encontrada para estes filtros.");
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [area, batchOffset, difficulty, source, subject, topic, year]);

  const visibleSubjects = useMemo(() => getSubjectsForArea(area), [area]);
  const visibleTopics = useMemo(
    () => (subject === "all" ? [] : getTopicsForSubject(subject)),
    [subject],
  );

  const currentQuestion = questions[currentIndex];
  const activeSubjectStatus = currentQuestion
    ? getSubjectStatus(toQuestCategory(currentQuestion.subject))
    : "neutral";

  const progressLabel = useMemo(() => {
    if (!questions.length) {
      return "0/0";
    }

    return `${currentIndex + 1}/${questions.length}`;
  }, [currentIndex, questions.length]);

  const submitAnswer = useCallback((alternativeId: string) => {
    if (!currentQuestion || answered) {
      return;
    }

    const correct = currentQuestion.correctAlternativeId === alternativeId;
    const reward = answerQuestion(currentQuestion, correct);
    const nextStreak = correct ? stats.streak + 1 : 0;

    setSelectedAlternativeId(alternativeId);
    setAnswered(true);
    setStats((current) => ({
      hits: current.hits + (correct ? 1 : 0),
      misses: current.misses + (correct ? 0 : 1),
      xp: current.xp + reward.xp,
      gold: current.gold + reward.gold,
      streak: nextStreak,
      bestStreak: Math.max(current.bestStreak, nextStreak),
    }));
  }, [answerQuestion, answered, currentQuestion, stats.streak]);

  const nextQuestion = useCallback(() => {
    setAnswered(false);
    setSelectedAlternativeId(null);
    setCurrentIndex((current) => (current + 1 < questions.length ? current + 1 : current));
  }, [questions.length]);

  const loadNextBatch = useCallback(() => {
    setBatchOffset((current) => current + QUIZ_PAGE_SIZE);
  }, []);

  const resetBatch = useCallback(() => {
    setBatchOffset(0);
  }, []);

  return (
    <main className="quest-grid min-h-screen bg-[#070813] lg:flex">
      <DevMountLog label="Quiz mounted" />
      <GameFeedback
        feedback={lastFeedback}
        levelUpMessage={levelUpMessage}
        onDone={clearFeedback}
      />
      <Sidebar />
      <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">
                Banco de questoes
              </p>
              <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
                Quiz RPG
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Carregue questoes abertas, responda em modo campanha e converta acertos em XP, gold e progresso por materia.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-sm font-black text-cyan-100">
              {progressLabel} questoes
            </div>
          </div>

          <section className="mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur md:grid-cols-2 xl:grid-cols-6">
            <Select label="Fonte" value={source} onChange={(value) => {
              resetBatch();
              setSource(value as QuestionProviderId);
            }}>
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <Select
              label="Area"
              value={area}
              onChange={(value) => {
                resetBatch();
                setArea(value);
                setSubject("all");
                setTopic("all");
              }}
            >
              <option value="all">Todas as areas</option>
              {studyAreas.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </Select>
            <Select
              label="Materia"
              value={subject}
              onChange={(value) => {
                resetBatch();
                setSubject(value);
                setTopic("all");
              }}
            >
              <option value="all">Todas as materias</option>
              {visibleSubjects.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select label="Conteudo" value={topic} disabled={subject === "all"} onChange={(value) => {
              resetBatch();
              setTopic(value);
            }}>
              <option value="all">Todos os conteudos</option>
              {visibleTopics.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select
              label="Ano"
              value={year.toString()}
              disabled={source !== "enem"}
              onChange={(value) => {
                resetBatch();
                setYear(value === "all" ? "all" : Number(value));
              }}
            >
              <option value="all">Todos os anos</option>
              {availableYears.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select label="Dificuldade" value={difficulty} onChange={(value) => {
              resetBatch();
              setDifficulty(value as QuestionDifficulty | "all");
            }}>
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-100">Bonus ativo</p>
              <p className="mt-1 text-sm font-black text-white">{activeSubjectStatus}</p>
            </div>
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <StatsCard label="Acertos" value={stats.hits} icon={<CheckCircle2 size={18} />} tone="emerald" />
            <StatsCard label="Erros" value={stats.misses} icon={<XCircle size={18} />} tone="violet" />
            <StatsCard label="XP ganho" value={stats.xp} icon={<Sparkles size={18} />} tone="cyan" />
            <StatsCard label="Gold" value={stats.gold} icon={<Coins size={18} />} tone="amber" />
            <StatsCard label="Sequencia" value={stats.streak} icon={<Zap size={18} />} tone="emerald" />
            <StatsCard label="Melhor seq." value={stats.bestStreak} icon={<Swords size={18} />} tone="violet" />
          </div>

          {message ? (
            <div className="mt-6 flex gap-3 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
              <AlertTriangle size={20} />
              <span>{message}</span>
            </div>
          ) : null}

          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
            {loading ? (
              <QuizSkeleton copy={loadingCopy} />
            ) : currentQuestion ? (
            <QuestionPlayCard
                question={currentQuestion}
                selectedAlternativeId={selectedAlternativeId}
                answered={answered}
                onAnswer={submitAnswer}
                onNext={nextQuestion}
              />
            ) : (
              <div className="grid min-h-80 place-items-center text-center text-slate-400">
                Nenhuma questao disponivel. Tente outra fonte ou filtro.
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={loadNextBatch}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-300/10 px-4 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-300/20"
              >
                Carregar proximo lote
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

const Select = memo(function Select({
  label,
  children,
  value,
  disabled,
  onChange,
}: {
  label: string;
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none transition focus:border-cyan-200/50 disabled:opacity-40"
      >
        {children}
      </select>
    </label>
  );
});

const QuizSkeleton = memo(function QuizSkeleton({ copy }: { copy: string }) {
  return (
    <div className="min-h-80 space-y-6">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-8 w-24 animate-pulse rounded-full border border-cyan-200/10 bg-cyan-300/10"
          />
        ))}
      </div>
      <div>
        <div className="h-8 w-2/3 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-11/12 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="grid gap-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-2xl border border-white/10 bg-slate-950/45"
          />
        ))}
      </div>
      <div className="rounded-3xl border border-cyan-200/20 bg-cyan-300/10 p-4 text-sm font-black text-cyan-100 shadow-[0_0_36px_rgba(34,211,238,0.12)]">
        {copy}
      </div>
    </div>
  );
});

const QuestionPlayCard = memo(function QuestionPlayCard({
  question,
  selectedAlternativeId,
  answered,
  onAnswer,
  onNext,
}: {
  question: Question;
  selectedAlternativeId: string | null;
  answered: boolean;
  onAnswer: (alternativeId: string) => void;
  onNext: () => void;
}) {
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{sourceBadges[question.source]}</Badge>
        {question.year ? <Badge>{question.year}</Badge> : null}
        <Badge>{question.area}</Badge>
        <Badge>{question.subject}</Badge>
        {question.topic ? <Badge>{question.topic}</Badge> : null}
        <Badge>{difficultyLabels[question.difficulty]}</Badge>
        <Badge>+{question.xp} XP</Badge>
      </div>

      <h2 className="mt-5 text-2xl font-black text-white">{question.exam ?? "Questao"}</h2>
      <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-200">
        {question.statement}
      </p>

      {question.images?.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {question.images.map((image) => (
            <img
              key={image}
              src={image}
              alt="Imagem da questao"
              className="max-h-80 rounded-2xl border border-white/10 object-contain"
            />
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {question.alternatives.map((alternative) => {
          const isCorrect = answered && alternative.id === question.correctAlternativeId;
          const isWrongSelection =
            answered &&
            alternative.id === selectedAlternativeId &&
            selectedAlternativeId !== question.correctAlternativeId;

          return (
            <button
              key={alternative.id}
              type="button"
              disabled={answered}
              onClick={() => onAnswer(alternative.id)}
              className={`rounded-2xl border p-4 text-left text-sm font-bold leading-6 transition ${
                isCorrect
                  ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-50"
                  : isWrongSelection
                    ? "border-rose-300/50 bg-rose-300/15 text-rose-50"
                    : "border-white/10 bg-slate-950/45 text-slate-200 hover:border-cyan-200/40 hover:bg-cyan-300/10"
              }`}
            >
              <span className="mr-3 font-black text-cyan-200">{alternative.id}</span>
              {alternative.text}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className="mt-6 rounded-3xl border border-cyan-200/20 bg-cyan-300/10 p-4">
          <p className="text-sm font-black text-white">
            {selectedAlternativeId === question.correctAlternativeId
              ? "Resposta correta."
              : `Resposta incorreta. Correta: ${question.correctAlternativeId ?? "indisponivel"}.`}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {question.explanation ?? "Explicacao ainda nao disponivel para esta questao."}
          </p>
          <button
            type="button"
            onClick={onNext}
            className="mt-4 inline-flex h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-black text-slate-950 transition hover:bg-white"
          >
            Proxima questao
          </button>
        </div>
      ) : null}
    </article>
  );
});

const Badge = memo(function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
      {children}
    </span>
  );
});

function toQuestCategory(subject: string): QuestCategory {
  return subjectNames.includes(subject as QuestCategory)
    ? (subject as QuestCategory)
    : "Portugues";
}

function getLoadingCopy() {
  const copies = [
    "Sincronizando questoes...",
    "Preparando seu desafio...",
    "Atualizando banco academico...",
    "Carregando missao...",
    "Buscando novos desafios...",
  ];

  return copies[Math.floor(Math.random() * copies.length)];
}
