"use client";

import { QuestCard } from "@/components/QuestCard";
import type { Quest, QuestReward } from "@/types/game";

type QuestSectionProps = {
  title: string;
  subtitle: string;
  quests: Quest[];
  completedQuestIds: string[];
  onComplete: (questId: string) => void;
  getReward: (quest: Quest) => QuestReward;
};

export function QuestSection({
  title,
  subtitle,
  quests,
  completedQuestIds,
  onComplete,
  getReward,
}: QuestSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">{subtitle}</p>
        </div>
        <span className="text-sm font-black text-cyan-200">
          {quests.filter((quest) => completedQuestIds.includes(quest.id)).length}/{quests.length}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            completed={completedQuestIds.includes(quest.id)}
            onComplete={onComplete}
            reward={getReward(quest)}
          />
        ))}
      </div>
    </section>
  );
}
