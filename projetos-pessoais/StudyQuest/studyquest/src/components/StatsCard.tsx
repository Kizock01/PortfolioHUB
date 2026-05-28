import type { ReactNode } from "react";

type StatsCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: "cyan" | "violet" | "amber" | "emerald";
};

const tones = {
  cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  violet: "border-violet-300/20 bg-violet-300/10 text-violet-100",
  amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
};

export function StatsCard({ label, value, icon, tone = "cyan" }: StatsCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
      <div className={`mb-4 grid size-10 place-items-center rounded-2xl border ${tones[tone]}`}>
        {icon}
      </div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </article>
  );
}
