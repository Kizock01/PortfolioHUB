"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  academicTitles,
  initialPlayer,
  initialSubjects,
  quests as initialQuests,
} from "@/data/mock-game";
import { useAuth } from "@/store/AuthContext";
import {
  loadAcademicProfile,
  loadAcademicProfileRemote,
  loadUserData,
  loadUserDataRemote,
  saveAcademicProfile,
  saveAcademicProfileRemote,
  saveUserData,
  saveUserDataRemote,
} from "@/services/userPersistenceService";
import type {
  AcademicProfile,
  AcademicTitle,
  CompletionFeedback,
  Player,
  Quest,
  QuestCategory,
  QuestReward,
  Subject,
  SubjectStatus,
} from "@/types/game";
import type { Question } from "@/types/question";

type GameContextValue = {
  player: Player;
  quests: Quest[];
  subjects: Subject[];
  profile: AcademicProfile;
  hydrated: boolean;
  completedQuestIds: string[];
  lastFeedback: CompletionFeedback | null;
  levelUpMessage: string | null;
  currentTitle: AcademicTitle;
  nextTitle: AcademicTitle | null;
  unlockedTitles: AcademicTitle[];
  selectedTitle: string;
  completeQuest: (questId: string) => void;
  clearFeedback: () => void;
  configureProfile: (weakSubjects: QuestCategory[], strongSubjects: QuestCategory[]) => void;
  resetProfile: () => void;
  isQuestCompleted: (questId: string) => boolean;
  getQuestReward: (quest: Quest) => QuestReward;
  getSubjectStatus: (subject: QuestCategory) => SubjectStatus;
  answerQuestion: (question: Question, correct: boolean) => QuestReward;
  chooseTitle: (title: string) => void;
};

const emptyProfile: AcademicProfile = {
  weakSubjects: [],
  strongSubjects: [],
  selectedTopics: [],
  configured: false,
};

const GameContext = createContext<GameContextValue | null>(null);

function getNextLevelXp(level: number) {
  return 250 + (level - 1) * 90;
}

function getSubjectNextLevelXp(level: number) {
  return 180 + (level - 1) * 60;
}

function getCurrentTitle(level: number) {
  return academicTitles.reduce((current, title) => {
    return level >= title.minLevel ? title : current;
  }, academicTitles[0]);
}

function getNextTitle(level: number) {
  return academicTitles.find((title) => title.minLevel > level) ?? null;
}

function applyPlayerXp(player: Player, xpGained: number) {
  let nextPlayer = { ...player, xp: player.xp + xpGained };
  let leveledUp = false;

  while (nextPlayer.xp >= nextPlayer.nextLevelXp) {
    const nextLevel = nextPlayer.level + 1;
    nextPlayer = {
      ...nextPlayer,
      level: nextLevel,
      xp: nextPlayer.xp - nextPlayer.nextLevelXp,
      nextLevelXp: getNextLevelXp(nextLevel),
      title: getCurrentTitle(nextLevel).name,
    };
    leveledUp = true;
  }

  return { player: nextPlayer, leveledUp };
}

function applySubjectXp(subject: Subject, xpGained: number) {
  let nextSubject = { ...subject, xp: subject.xp + xpGained };

  while (nextSubject.xp >= nextSubject.nextLevelXp) {
    const nextLevel = nextSubject.level + 1;
    nextSubject = {
      ...nextSubject,
      level: nextLevel,
      xp: nextSubject.xp - nextSubject.nextLevelXp,
      nextLevelXp: getSubjectNextLevelXp(nextLevel),
    };
  }

  return nextSubject;
}

function normalizeSubjects(profile: AcademicProfile, currentSubjects = initialSubjects) {
  return currentSubjects.map((subject) => {
    let status: SubjectStatus = "neutral";

    if (profile.weakSubjects.includes(subject.name)) {
      status = "weak";
    }

    if (profile.strongSubjects.includes(subject.name)) {
      status = "strong";
    }

    return { ...subject, status };
  });
}

function isQuestCategory(subject: string): subject is QuestCategory {
  return initialSubjects.some((item) => item.name === subject);
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<AcademicProfile>(emptyProfile);
  const [subjects, setSubjects] = useState<Subject[]>(normalizeSubjects(emptyProfile, initialSubjects));
  const [lastFeedback, setLastFeedback] = useState<CompletionFeedback | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState(getCurrentTitle(initialPlayer.level).name);
  const [hydrated, setHydrated] = useState(false);
  const completedQuestIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("GameProvider mounted");
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextPersisted = loadUserData(userId);
      const nextProfile = loadAcademicProfile(userId) ?? emptyProfile;
      const nextPlayer = nextPersisted?.player
        ? {
          ...initialPlayer,
          ...nextPersisted.player,
          title: getCurrentTitle(nextPersisted.player.level ?? initialPlayer.level).name,
        }
        : initialPlayer;
      setPlayer(nextPlayer);
      setCompletedQuestIds(nextPersisted?.completedQuestIds ?? []);
      setProfile(nextProfile);
      setSubjects(normalizeSubjects(nextProfile, nextPersisted?.subjects ?? initialSubjects));
      setSelectedTitle(nextPersisted?.selectedTitle ?? getCurrentTitle(nextPlayer.level).name);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [userId]);

  useEffect(() => {
    let active = true;
    loadUserDataRemote(userId).then((remote) => {
      if (!active || !remote) return;
      setPlayer({
        ...initialPlayer,
        ...remote.player,
        title: getCurrentTitle(remote.player.level ?? initialPlayer.level).name,
      });
      setCompletedQuestIds(remote.completedQuestIds ?? []);
      setSubjects(remote.subjects ?? initialSubjects);
      setSelectedTitle(remote.selectedTitle || getCurrentTitle(remote.player.level).name);
    });
    loadAcademicProfileRemote(userId).then((remoteProfile) => {
      if (!active || !remoteProfile) return;
      setProfile(remoteProfile);
      setSubjects((current) => normalizeSubjects(remoteProfile, current));
    });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    completedQuestIdsRef.current = completedQuestIds;
  }, [completedQuestIds]);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => {
      const payload = {
        player,
        completedQuestIds,
        subjects,
        selectedTitle,
        unlockedTitles: academicTitles.filter((title) => title.minLevel <= player.level).map((title) => title.name),
      };
      saveUserData(userId, payload);
      saveAcademicProfile(userId, profile);
      void saveUserDataRemote(userId, payload);
      void saveAcademicProfileRemote(userId, profile);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [completedQuestIds, hydrated, player, profile, selectedTitle, subjects, userId]);

  const getSubjectStatus = useCallback(
    (subject: QuestCategory): SubjectStatus => {
      if (profile.weakSubjects.includes(subject)) {
        return "weak";
      }

      if (profile.strongSubjects.includes(subject)) {
        return "strong";
      }

      return "neutral";
    },
    [profile],
  );

  const getQuestReward = useCallback(
    (quest: Quest): QuestReward => {
      const status = getSubjectStatus(quest.category);
      const multiplier = status === "weak" ? 1.5 : status === "strong" ? 0.9 : 1;
      const xp = Math.round(quest.xp * multiplier);
      const bonusLabel =
        status === "weak"
          ? "Ponto fraco +50%"
          : status === "strong"
            ? "Ponto forte -10%"
            : "XP padrao";

      return {
        xp,
        baseXp: quest.xp,
        gold: quest.gold,
        multiplier,
        bonusLabel,
      };
    },
    [getSubjectStatus],
  );

  const configureProfile = useCallback(
    (weakSubjects: QuestCategory[], strongSubjects: QuestCategory[]) => {
      const profileUpdate: AcademicProfile = {
        weakSubjects,
        strongSubjects: strongSubjects.filter((subject) => !weakSubjects.includes(subject)),
        selectedTopics: [],
        configured: true,
      };

      setProfile(profileUpdate);
      setSubjects((current) => normalizeSubjects(profileUpdate, current));
    },
    [],
  );

  const resetProfile = useCallback(() => {
    setProfile(emptyProfile);
    setSubjects((current) => normalizeSubjects(emptyProfile, current));
  }, []);

  const completeQuest = useCallback(
    (questId: string) => {
      if (completedQuestIdsRef.current.includes(questId)) {
        return;
      }

      const quest = initialQuests.find((item) => item.id === questId);

      if (!quest) {
        return;
      }

      const reward = getQuestReward(quest);

      completedQuestIdsRef.current = [...completedQuestIdsRef.current, questId];
      setCompletedQuestIds(completedQuestIdsRef.current);
      setLastFeedback({
        id: `${quest.id}-${Date.now()}`,
        xp: reward.xp,
        baseXp: reward.baseXp,
        gold: reward.gold,
        title: quest.title,
        bonusLabel: reward.bonusLabel,
      });

      setSubjects((current) =>
        current.map((subject) =>
          subject.name === quest.category ? applySubjectXp(subject, reward.xp) : subject,
        ),
      );

      setPlayer((current) => {
        const { player: nextPlayer, leveledUp } = applyPlayerXp(
          {
            ...current,
            gold: current.gold + reward.gold,
            completedQuests: current.completedQuests + 1,
            streak: Math.max(current.streak, initialPlayer.streak + 1),
            badge:
              current.completedQuests + 1 >= 30
                ? "Guild Master"
                : current.completedQuests + 1 >= 15
                  ? "Cacador de Quests"
                  : current.badge,
          },
          reward.xp,
        );

        if (leveledUp) {
          setLevelUpMessage(`LEVEL UP - NIVEL ${nextPlayer.level}`);
        }

        return nextPlayer;
      });
    },
    [getQuestReward],
  );

  const answerQuestion = useCallback(
    (question: Question, correct: boolean): QuestReward => {
      const subject = isQuestCategory(question.subject) ? question.subject : "Portugues";
      const status = getSubjectStatus(subject);
      const multiplier = status === "weak" ? 1.5 : status === "strong" ? 0.9 : 1;
      const baseXp = correct ? question.xp : 10;
      const xp = correct ? Math.round(question.xp * multiplier) : baseXp;
      const gold = correct ? Math.max(15, Math.round(xp / 4)) : 0;
      const bonusLabel = correct
        ? status === "weak"
          ? "Ponto fraco +50%"
          : status === "strong"
            ? "Ponto forte -10%"
            : "XP padrao"
        : "Participacao";

      const reward: QuestReward = {
        xp,
        baseXp,
        gold,
        multiplier: correct ? multiplier : 0,
        bonusLabel,
      };

      setLastFeedback({
        id: `${question.id}-${Date.now()}`,
        xp,
        baseXp,
        gold,
        title: question.exam ?? "Quiz",
        bonusLabel,
      });

      setSubjects((current) =>
        current.map((item) =>
          item.name === subject ? applySubjectXp(item, xp) : item,
        ),
      );

      setPlayer((current) => {
        const { player: nextPlayer, leveledUp } = applyPlayerXp(
          {
            ...current,
            gold: current.gold + gold,
            badge:
              current.completedQuests >= 30
                ? "Guild Master"
                : current.badge,
          },
          xp,
        );

        if (leveledUp) {
          setLevelUpMessage(`LEVEL UP - NIVEL ${nextPlayer.level}`);
        }

        return nextPlayer;
      });

      return reward;
    },
    [getSubjectStatus],
  );

  const clearFeedback = useCallback(() => {
    setLastFeedback(null);
    setLevelUpMessage(null);
  }, []);

  const isQuestCompleted = useCallback(
    (questId: string) => completedQuestIds.includes(questId),
    [completedQuestIds],
  );

  const currentTitle = useMemo(() => getCurrentTitle(player.level), [player.level]);
  const nextTitle = useMemo(() => getNextTitle(player.level), [player.level]);
  const unlockedTitles = useMemo(
    () => academicTitles.filter((title) => title.minLevel <= player.level),
    [player.level],
  );

  const chooseTitle = useCallback(
    (titleName: string) => {
      if (unlockedTitles.some((title) => title.name === titleName)) {
        setSelectedTitle(titleName);
      }
    },
    [unlockedTitles],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      player: { ...player, title: selectedTitle || currentTitle.name },
      quests: initialQuests,
      subjects,
      profile,
      hydrated,
      completedQuestIds,
      lastFeedback,
      levelUpMessage,
      currentTitle,
      nextTitle,
      unlockedTitles,
      selectedTitle,
      completeQuest,
      clearFeedback,
      configureProfile,
      resetProfile,
      isQuestCompleted,
      getQuestReward,
      getSubjectStatus,
      answerQuestion,
      chooseTitle,
    }),
    [
      answerQuestion,
      chooseTitle,
      clearFeedback,
      completeQuest,
      completedQuestIds,
      configureProfile,
      currentTitle,
      getQuestReward,
      getSubjectStatus,
      hydrated,
      isQuestCompleted,
      lastFeedback,
      levelUpMessage,
      nextTitle,
      player,
      profile,
      resetProfile,
      selectedTitle,
      subjects,
      unlockedTitles,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}
