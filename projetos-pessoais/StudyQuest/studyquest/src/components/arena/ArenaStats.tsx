"use client";

import type { ArenaCompetitiveState } from "@/types/arena";

export function ArenaStats({ state }: { state: ArenaCompetitiveState }) {
  const games = state.wins + state.losses + state.draws;
  const winRate = games ? Math.round((state.wins / games) * 100) : 0;
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Estatisticas Arena</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
        <Card label="Vitorias" value={state.wins} />
        <Card label="Derrotas" value={state.losses} />
        <Card label="Winrate" value={`${winRate}%`} />
        <Card label="Melhor combo" value={state.bestCombo} />
        <Card label="Maior pontuacao" value={state.highestScore} />
        <Card label="Precisao media" value={`${state.averageAccuracy}%`} />
        <Card label="Materia mais jogada" value={state.mostPlayedSubject} />
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  );
}

