import { ArrowRight, BookOpenCheck, Flame, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { DevMountLog } from "@/components/DevMountLog";
import { PlayerCard } from "@/components/PlayerCard";
import { QuestCard } from "@/components/QuestCard";
import { StatsCard } from "@/components/StatsCard";
import { initialPlayer, quests } from "@/data/mock-game";

export default function Home() {
  const featuredQuest = quests[0];

  return (
    <main className="quest-grid min-h-screen overflow-hidden bg-[#070813]">
      <DevMountLog label="Home rendered" />
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.24)]">
              <Sparkles size={20} />
            </span>
            <span>
              <span className="block text-lg font-black uppercase tracking-[0.22em] text-white">
                StudyQuest
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
                RPG Academy
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/quests"
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100"
            >
              Quests
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.35)] transition hover:bg-white"
            >
              Entrar
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.04fr_0.96fr] lg:py-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-2 text-sm font-bold text-fuchsia-100">
              <Flame size={16} />
              Streak, XP e quests para estudar melhor
            </div>
            <h1 className="text-balance text-5xl font-black leading-[0.96] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Transforme sua rotina de estudos em uma campanha epica.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Organize materias, conclua missoes diarias, ganhe XP e suba de
              nivel enquanto avanca nas suas metas reais de aprendizado.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 text-base font-black text-white shadow-[0_0_32px_rgba(139,92,246,0.36)] transition hover:bg-violet-400"
              >
                Abrir dashboard
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/quests"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-6 text-base font-black text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-300/20"
              >
                Ver quests
                <BookOpenCheck size={18} />
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <StatsCard label="Nivel atual" value={initialPlayer.level} icon={<ShieldCheck size={18} />} tone="violet" />
              <StatsCard label="Streak" value={`${initialPlayer.streak} dias`} icon={<Flame size={18} />} tone="amber" />
              <StatsCard label="Quests feitas" value={initialPlayer.completedQuests} icon={<BookOpenCheck size={18} />} tone="cyan" />
            </div>
          </div>

          <div className="grid gap-4">
            <PlayerCard player={initialPlayer} />
            <QuestCard quest={featuredQuest} />
          </div>
        </div>
      </section>
    </main>
  );
}
