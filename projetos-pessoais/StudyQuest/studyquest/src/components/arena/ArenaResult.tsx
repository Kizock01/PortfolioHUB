"use client";

import type { ArenaResult } from "@/types/arena";
import { ActionButton } from "@/components/ui/ActionButton";

export function ArenaResult({
  result,
  onRestart,
  onRematch,
}: {
  result: ArenaResult;
  onRestart: () => void;
  onRematch: () => void;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <h2 className="text-2xl font-black text-white">
        {result.winner === "draw" ? "Empate" : result.winner === "p1" ? "Vitoria" : "Derrota"}
      </h2>
      <p className="mt-1 text-sm text-slate-400">Placar: {result.p1.score} x {result.p2.score}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Stat label="XP ganho" value={result.xpGained} />
        <Stat label="Gold ganho" value={result.goldGained} />
        <Stat label="CP da partida" value={result.pointsDelta > 0 ? `+${result.pointsDelta}` : `${result.pointsDelta}`} />
        <Stat label="Rank atual" value={`${result.rank.name} ${result.rank.division}`} />
      </div>
      <ActionButton onClick={onRestart} className="mt-5 h-12 px-5">
        Nova partida
      </ActionButton>
      <ActionButton onClick={onRematch} variant="ghost" className="mt-3 h-12 px-5">
        Jogar revanche
      </ActionButton>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
