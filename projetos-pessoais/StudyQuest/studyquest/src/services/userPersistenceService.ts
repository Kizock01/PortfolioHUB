"use client";

import type { AcademicProfile, Player, Subject } from "@/types/game";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type UserProgressData = {
  player: Player;
  subjects: Subject[];
  completedQuestIds: string[];
  selectedTitle: string;
  unlockedTitles: string[];
};

const progressKey = (userId: string) => `studyquest:user:${userId}:progress`;
const profileKey = (userId: string) => `studyquest:user:${userId}:academicProfile`;
const syncPendingKey = "studyquest:sync-pending";
const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function setSyncPending(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(syncPendingKey, value ? "1" : "0");
}

function canSyncRemote(userId: string) {
  return uuidLike.test(userId);
}

export function isOnlineSyncPending() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(syncPendingKey) === "1";
}

// Provider unico de persistencia. Hoje usa localStorage.
// Futuro: trocar implementacao para Supabase sem mudar chamadas do app.
export function loadUserData(userId: string): UserProgressData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(progressKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as UserProgressData;
  } catch {
    return null;
  }
}

export function saveUserData(userId: string, data: UserProgressData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(progressKey(userId), JSON.stringify(data));
}

export function loadAcademicProfile(userId: string): AcademicProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(profileKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as AcademicProfile;
  } catch {
    return null;
  }
}

export function saveAcademicProfile(userId: string, profile: AcademicProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(profileKey(userId), JSON.stringify(profile));
}

export async function loadUserDataRemote(userId: string) {
  if (!canSyncRemote(userId)) return null;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("player,subjects,completed_quest_ids,selected_title,unlocked_titles")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      setSyncPending(true);
      if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] load user_progress", error.message);
      return null;
    }
    if (!data) return null;
    setSyncPending(false);
    return {
      player: data.player as Player,
      subjects: data.subjects as Subject[],
      completedQuestIds: (data.completed_quest_ids as string[]) ?? [],
      selectedTitle: (data.selected_title as string) ?? "",
      unlockedTitles: (data.unlocked_titles as string[]) ?? [],
    } satisfies UserProgressData;
  } catch (error) {
    setSyncPending(true);
    if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] load user_progress", error);
    return null;
  }
}

export async function saveUserDataRemote(userId: string, data: UserProgressData) {
  if (!canSyncRemote(userId)) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("user_progress").upsert({
      user_id: userId,
      player: data.player,
      subjects: data.subjects,
      completed_quest_ids: data.completedQuestIds,
      selected_title: data.selectedTitle,
      unlocked_titles: data.unlockedTitles,
    });
    if (error) {
      setSyncPending(true);
      if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] save user_progress", error.message);
      return;
    }
    setSyncPending(false);
  } catch (error) {
    setSyncPending(true);
    if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] save user_progress", error);
  }
}

export async function loadAcademicProfileRemote(userId: string) {
  if (!canSyncRemote(userId)) return null;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("user_academic_profile")
      .select("weak_subjects,strong_subjects,selected_topics,onboarding_completed")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      setSyncPending(true);
      if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] load academic", error.message);
      return null;
    }
    if (!data) return null;
    setSyncPending(false);
    return {
      weakSubjects: (data.weak_subjects as AcademicProfile["weakSubjects"]) ?? [],
      strongSubjects: (data.strong_subjects as AcademicProfile["strongSubjects"]) ?? [],
      selectedTopics: (data.selected_topics as string[]) ?? [],
      configured: Boolean(data.onboarding_completed),
    } satisfies AcademicProfile;
  } catch (error) {
    setSyncPending(true);
    if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] load academic", error);
    return null;
  }
}

export async function saveAcademicProfileRemote(userId: string, profile: AcademicProfile) {
  if (!canSyncRemote(userId)) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("user_academic_profile").upsert({
      user_id: userId,
      weak_subjects: profile.weakSubjects,
      strong_subjects: profile.strongSubjects,
      selected_topics: profile.selectedTopics,
      onboarding_completed: profile.configured,
    });
    if (error) {
      setSyncPending(true);
      if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] save academic", error.message);
      return;
    }
    setSyncPending(false);
  } catch (error) {
    setSyncPending(true);
    if (process.env.NODE_ENV === "development") console.warn("[StudyQuest][supabase] save academic", error);
  }
}
