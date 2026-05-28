import type { Subject } from "@/types/game";

const statusLabel = {
  weak: "Ponto fraco",
  strong: "Ponto forte",
  neutral: "Neutra",
};

const statusTone = {
  weak: "text-fuchsia-100 border-fuchsia-300/20 bg-fuchsia-300/10",
  strong: "text-cyan-100 border-cyan-300/20 bg-cyan-300/10",
  neutral: "text-slate-200 border-white/10 bg-white/[0.06]",
};

export function SubjectProgressCard({ subject }: { subject: Subject }) {
  const progress = Math.min(Math.round((subject.xp / subject.nextLevelXp) * 100), 100);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white">{subject.name}</h3>
          <p className="mt-1 text-sm font-bold text-slate-400">Nivel {subject.level}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusTone[subject.status]}`}>
          {statusLabel[subject.status]}
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-950/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">
        <span>{subject.xp} XP</span>
        <span>{subject.nextLevelXp} XP</span>
      </div>
    </article>
  );
}
