import { Coins, Flame, Medal, Trophy } from "lucide-react";
import { XPBar } from "@/components/XPBar";
import type { Player } from "@/types/game";

type PlayerCardProps = {
  player: Player;
};

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <section className="neon-ring rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl border border-violet-300/30 bg-violet-300/15 text-2xl font-black text-violet-100">
            {player.level}
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">
              Nivel {player.level}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">{player.name}</h2>
            <p className="text-sm text-slate-300">{player.title}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200/20 bg-amber-300/10 p-3 text-amber-100">
          <Trophy size={22} />
        </div>
      </div>

      <div className="mt-6">
        <XPBar current={player.xp} required={player.nextLevelXp} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <div className="flex items-center gap-2 text-amber-200">
            <Flame size={16} />
            <span className="text-xs font-black uppercase tracking-[0.18em]">Streak</span>
          </div>
          <p className="mt-2 text-2xl font-black">{player.streak} dias</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <div className="flex items-center gap-2 text-cyan-200">
            <Coins size={16} />
            <span className="text-xs font-black uppercase tracking-[0.18em]">Gold</span>
          </div>
          <p className="mt-2 text-2xl font-black">{player.gold}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-200">Quests</p>
          <p className="mt-2 text-2xl font-black">{player.completedQuests}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <div className="flex items-center gap-2 text-fuchsia-200">
            <Medal size={16} />
            <span className="text-xs font-black uppercase tracking-[0.18em]">Badge</span>
          </div>
          <p className="mt-2 text-sm font-black text-white">{player.badge}</p>
        </div>
      </div>
    </section>
  );
}
