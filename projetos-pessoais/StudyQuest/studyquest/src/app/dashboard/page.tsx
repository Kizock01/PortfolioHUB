"use client";

import { BookOpenCheck, Coins, Flame, Medal, Sparkles, Timer } from "lucide-react";
import { useMemo } from "react";
import { PlayerCard } from "@/components/PlayerCard";
import { QuestCard } from "@/components/QuestCard";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { SubjectProgressCard } from "@/components/SubjectProgressCard";
import { useGame } from "@/store/GameContext";

export default function DashboardPage() {
  const {
    player,
    quests,
    subjects,
    completedQuestIds,
    completeQuest,
    isQuestCompleted,
    getQuestReward,
    currentTitle,
    nextTitle,
  } = useGame();
  const featuredQuest = useMemo(
    () => quests.find((quest) => !completedQuestIds.includes(quest.id)) ?? quests[0],
    [completedQuestIds, quests],
  );
  const featuredReward = getQuestReward(featuredQuest);
  const highlightedSubjects = useMemo(
    () => subjects.filter((item) => item.status !== "neutral").slice(0, 6),
    [subjects],
  );

  return (
    <main className="quest-grid min-h-screen bg-[#070813] lg:flex">
      <Sidebar />
      <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">
                Painel da campanha
              </p>
              <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
                Dashboard
              </h1>
            </div>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-black text-slate-950 shadow-[0_0_26px_rgba(34,211,238,0.28)] transition hover:bg-white">
              <Sparkles size={18} />
              Nova sessao de foco
            </button>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <PlayerCard player={player} />

            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard label="XP atual" value={player.xp} icon={<Sparkles size={18} />} tone="cyan" />
              <StatsCard label="Streak" value={`${player.streak} dias`} icon={<Flame size={18} />} tone="amber" />
              <StatsCard label="Gold" value={player.gold} icon={<Coins size={18} />} tone="emerald" />
              <StatsCard label="Titulo" value={currentTitle.name} icon={<Medal size={18} />} tone="violet" />
              <StatsCard label="Quests concluidas" value={player.completedQuests} icon={<BookOpenCheck size={18} />} tone="cyan" />
              <StatsCard label="Horas de foco" value="18h" icon={<Timer size={18} />} tone="emerald" />
            </div>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-black text-white">Perfil academico</h2>
                <span className="text-sm font-bold text-cyan-200">
                  Proximo: {nextTitle?.name ?? "maximo"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(highlightedSubjects.length > 0 ? highlightedSubjects : subjects.slice(0, 4)).map((subject) => (
                  <SubjectProgressCard key={subject.name} subject={subject} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-white">Proxima quest</h2>
                <span className="text-sm font-bold text-cyan-200">+{featuredReward.xp} XP</span>
              </div>
              <QuestCard
                quest={featuredQuest}
                completed={isQuestCompleted(featuredQuest.id)}
                onComplete={completeQuest}
                reward={featuredReward}
              />
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
