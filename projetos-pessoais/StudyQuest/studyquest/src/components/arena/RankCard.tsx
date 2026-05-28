"use client";

import {
  Brain,
  Crown,
  FlaskConical,
  GraduationCap,
  Shield,
  Star,
} from "lucide-react";
import { getPointsToNextRank } from "@/services/arenaService";
import type { ArenaCompetitiveState } from "@/types/arena";
import type { CompetitiveRank } from "@/types/rank";

const rankIcons = {
  "graduation-cap": GraduationCap,
  shield: Shield,
  flask: FlaskConical,
  star: Star,
  brain: Brain,
  crown: Crown,
} as const;

export function RankCard({
  rank,
  state,
}: {
  rank: CompetitiveRank;
  state: ArenaCompetitiveState;
}) {
  const Icon = rankIcons[rank.icon];
  const toNext = getPointsToNextRank(state.competitivePoints);
  const totalMatches = state.wins + state.losses + state.draws;
  const winRate = totalMatches ? Math.round((state.wins / totalMatches) * 100) : 0;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Rank competitivo</p>
      <div className={`mt-3 flex items-center gap-3 rounded-2xl border px-3 py-3 ${rank.colorClass}`}>
        <Icon size={20} />
        <div>
          <p className="text-sm font-black">{rank.name} {rank.division}</p>
          <p className="text-xs">CP: {state.competitivePoints}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">Vitorias: {state.wins}</div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">Derrotas: {state.losses}</div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">Winrate: {winRate}%</div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">Prox rank: {toNext}</div>
      </div>
    </section>
  );
}
