"use client";

import { BookOpenCheck, Coins, Flame, Medal, Sparkles } from "lucide-react";
import { GameFeedback } from "@/components/GameFeedback";
import { PlayerCard } from "@/components/PlayerCard";
import { QuestSection } from "@/components/QuestSection";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { useGame } from "@/store/GameContext";
import type { QuestCadence } from "@/types/game";

const sections: Array<{
  cadence: QuestCadence;
  title: string;
  subtitle: string;
}> = [
  {
    cadence: "diarias",
    title: "Quests Diarias",
    subtitle: "Missoes rapidas para manter o streak e aquecer o cerebro.",
  },
  {
    cadence: "semanais",
    title: "Quests Semanais",
    subtitle: "Desafios maiores para consolidar progresso real.",
  },
  {
    cadence: "epicas",
    title: "Quests Epicas",
    subtitle: "Raids longas com recompensas altas e clima de boss fight.",
  },
  {
    cadence: "redacao",
    title: "Quests de Redacao",
    subtitle: "Treino especial para repertorio, estrutura e texto completo ENEM.",
  },
];

export default function QuestsPage() {
  const {
    player,
    quests,
    completedQuestIds,
    lastFeedback,
    levelUpMessage,
    completeQuest,
    clearFeedback,
    getQuestReward,
  } = useGame();

  const totalGoldAvailable = quests.reduce((total, quest) => total + quest.gold, 0);
  const earnedGold = quests
    .filter((quest) => completedQuestIds.includes(quest.id))
    .reduce((total, quest) => total + quest.gold, 0);

  return (
    <main className="quest-grid min-h-screen bg-[#070813] lg:flex">
      <GameFeedback
        feedback={lastFeedback}
        levelUpMessage={levelUpMessage}
        onDone={clearFeedback}
      />
      <Sidebar />
      <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">
                Central de missoes
              </p>
              <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
                Quests
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Complete estudos como missoes, ganhe XP, avance de nivel e acumule gold para futuras recompensas.
              </p>
            </div>
            <div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/10 px-5 py-4 text-sm font-black text-fuchsia-100 shadow-[0_0_32px_rgba(217,70,239,0.12)]">
              Bônus ativo: streak {player.streak} dias
            </div>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[360px_1fr]">
            <aside className="space-y-5">
              <PlayerCard player={player} />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <StatsCard
                  label="Concluidas"
                  value={`${completedQuestIds.length}/${quests.length}`}
                  icon={<BookOpenCheck size={18} />}
                  tone="emerald"
                />
                <StatsCard
                  label="Gold da rodada"
                  value={`${earnedGold}/${totalGoldAvailable}`}
                  icon={<Coins size={18} />}
                  tone="amber"
                />
                <StatsCard
                  label="Streak fake"
                  value={`${player.streak} dias`}
                  icon={<Flame size={18} />}
                  tone="violet"
                />
                <StatsCard
                  label="Conquista"
                  value={player.badge}
                  icon={<Medal size={18} />}
                  tone="cyan"
                />
              </div>
            </aside>

            <div className="space-y-10">
              <section className="relative overflow-hidden rounded-3xl border border-cyan-200/20 bg-cyan-300/[0.06] p-5 shadow-[0_0_42px_rgba(34,211,238,0.12)]">
                <div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
                      Status da campanha
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-white">
                      Estudo convertido em progresso real
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200/20 bg-slate-950/55 px-4 py-3 text-sm font-black text-cyan-100">
                    <Sparkles size={18} />
                    {player.xp} XP agora
                  </div>
                </div>
              </section>

              {sections.map((section) => (
                <QuestSection
                  key={section.cadence}
                  title={section.title}
                  subtitle={section.subtitle}
                  quests={quests.filter((quest) => quest.cadence === section.cadence)}
                  completedQuestIds={completedQuestIds}
                  onComplete={completeQuest}
                  getReward={getQuestReward}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
