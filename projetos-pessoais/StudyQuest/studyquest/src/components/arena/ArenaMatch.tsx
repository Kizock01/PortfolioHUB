"use client";

import type { ArenaPlayerStats } from "@/types/arena";
import type { Question } from "@/types/question";
import { ArenaTimer } from "@/components/arena/ArenaTimer";

export function ArenaMatch({
  phase,
  question,
  currentIndex,
  totalRounds,
  countdown,
  secondsRemaining,
  player,
  bot,
  message,
  selectedAnswer,
  botAnswer,
  answerStatus,
  locked,
  onAlternative,
}: {
  phase: "countdown" | "playing" | "feedback";
  question: Question;
  currentIndex: number;
  totalRounds: number;
  countdown: number;
  secondsRemaining: number;
  player: ArenaPlayerStats;
  bot: ArenaPlayerStats;
  message: string;
  selectedAnswer: string | null;
  botAnswer: string | null;
  answerStatus: "correct" | "wrong" | null;
  locked: boolean;
  onAlternative: (id: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
          Rodada {currentIndex + 1}/{totalRounds}
        </p>
        {phase === "countdown" ? (
          <p className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm font-black text-cyan-100">
            {countdown}
          </p>
        ) : (
          <ArenaTimer msRemaining={secondsRemaining * 1000} />
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Score name={player.name} score={player.score} hits={player.hits} misses={player.misses} combo={player.combo} />
        <Score name={bot.name} score={bot.score} hits={bot.hits} misses={bot.misses} combo={bot.combo} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <p className="text-lg font-black text-white">{question.exam ?? "Questao Arena"}</p>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-200">{question.statement}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-center text-lg font-black text-cyan-100">
        <span
          key={phase === "countdown" ? countdown : "go"}
          className="inline-block animate-[arena-pop_260ms_ease-out]"
        >
          {phase === "countdown" ? countdown : "RESPONDA!"}
        </span>
      </div>

      <p className="mt-3 min-h-6 text-sm font-bold text-slate-300">{message}</p>

      <div className="mt-4 grid gap-2">
        {question.alternatives.map((alternative) => {
          const isSelected = selectedAnswer === alternative.id;
          const isBotAnswer = botAnswer === alternative.id;
          const isCorrectAnswer = phase === "feedback" && alternative.id === question.correctAlternativeId;
          const selectedCorrect = isSelected && answerStatus === "correct";
          const selectedWrong = isSelected && answerStatus === "wrong";
          const botWrong = isBotAnswer && answerStatus === "wrong";

          return (
            <button
              key={alternative.id}
              type="button"
              onClick={() => onAlternative(alternative.id)}
              disabled={locked}
              className={`rounded-2xl border p-3 text-left text-sm font-bold transition-transform transition-colors duration-100 active:scale-[0.97] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${
                selectedCorrect || isCorrectAnswer
                  ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-100"
                  : selectedWrong || botWrong
                    ? "border-rose-300/50 bg-rose-300/15 text-rose-100"
                    : isBotAnswer
                      ? "border-amber-300/45 bg-amber-300/10 text-amber-100"
                      : "border-white/10 bg-slate-950/40 text-slate-200 hover:border-cyan-200/30"
              }`}
            >
              <span className="mr-2 text-cyan-200">{alternative.id}</span>
              {alternative.text}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Score({
  name,
  score,
  hits,
  misses,
  combo,
}: {
  name: string;
  score: number;
  hits: number;
  misses: number;
  combo: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{name}</p>
      <p className="mt-1 text-2xl font-black text-white">{score}</p>
      <p className="text-xs font-bold text-slate-300">Acertos {hits} | Erros {misses} | Combo {combo}</p>
    </div>
  );
}
