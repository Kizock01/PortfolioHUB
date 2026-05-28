"use client";

import type { ArenaHistoryItem } from "@/types/arena";

export function ArenaHistory({ items }: { items: ArenaHistoryItem[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Ultimas 5 partidas</p>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? <p className="text-xs text-slate-500">Sem historico ainda.</p> : null}
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-200">
            <p className="font-black uppercase">{item.result} | {item.score}</p>
            <p className="text-slate-400">{item.subject} | XP {item.xpGained} | CP {item.pointsDelta >= 0 ? `+${item.pointsDelta}` : item.pointsDelta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

