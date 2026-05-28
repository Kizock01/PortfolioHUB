"use client";

import { CheckCircle2, Clock3, Coins, Sparkles, Swords } from "lucide-react";
import type { Quest, QuestReward } from "@/types/game";

type QuestCardProps = {
  quest: Quest;
  completed?: boolean;
  reward?: QuestReward;
  onComplete?: (questId: string) => void;
};

const difficultyTone = {
  Facil: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  Media: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  Dificil: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100",
  Lendaria: "border-amber-300/30 bg-amber-300/10 text-amber-100",
};

export function QuestCard({
  quest,
  completed = false,
  reward,
  onComplete,
}: QuestCardProps) {
  const displayXp = reward?.xp ?? quest.xp;
  const bonusLabel = reward?.bonusLabel ?? "XP padrao";

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border p-5 backdrop-blur transition duration-300 ${
        completed
          ? "border-emerald-300/40 bg-emerald-300/[0.08]"
          : "border-white/10 bg-white/[0.055] hover:-translate-y-1 hover:border-cyan-200/50 hover:bg-white/[0.08] hover:shadow-[0_0_42px_rgba(34,211,238,0.13)]"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
      {completed ? (
        <div className="absolute right-4 top-4 rounded-full border border-emerald-200/30 bg-emerald-300/15 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">
          Completa
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-violet-100">
          {quest.category}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${difficultyTone[quest.difficulty]}`}>
          {quest.difficulty}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-black leading-7 text-white">{quest.title}</h3>
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-300">{quest.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-300">
        <span className="inline-flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-200" />
          +{displayXp} XP
        </span>
        <span className="inline-flex items-center gap-2">
          <Coins size={16} className="text-amber-200" />
          +{reward?.gold ?? quest.gold}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock3 size={16} className="text-amber-200" />
          {quest.duration}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-200/10 bg-slate-950/45 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
        {bonusLabel}
        {reward && reward.baseXp !== reward.xp ? (
          <span className="ml-2 text-slate-400">base {reward.baseXp}</span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onComplete?.(quest.id)}
        disabled={completed}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.25)] transition hover:bg-white disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:text-emerald-950"
      >
        {completed ? <CheckCircle2 size={18} /> : <Swords size={18} />}
        {completed ? "Quest concluida" : "Concluir Quest"}
      </button>
    </article>
  );
}
