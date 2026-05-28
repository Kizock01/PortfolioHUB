"use client";

import { Coins, Sparkles, Zap } from "lucide-react";
import { useEffect } from "react";
import type { CompletionFeedback } from "@/types/game";

type GameFeedbackProps = {
  feedback: CompletionFeedback | null;
  levelUpMessage: string | null;
  onDone: () => void;
};

export function GameFeedback({
  feedback,
  levelUpMessage,
  onDone,
}: GameFeedbackProps) {
  useEffect(() => {
    if (!feedback && !levelUpMessage) {
      return;
    }

    const timeout = window.setTimeout(onDone, 1800);
    return () => window.clearTimeout(timeout);
  }, [feedback, levelUpMessage, onDone]);

  if (!feedback && !levelUpMessage) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 top-5 z-50 flex justify-center">
      <div className="animate-xp-pop rounded-3xl border border-cyan-200/30 bg-slate-950/90 px-5 py-4 text-center shadow-[0_0_18px_rgba(34,211,238,0.16)] backdrop-blur">
        {levelUpMessage ? (
          <div className="animate-level-pulse flex items-center justify-center gap-2 text-xl font-black text-amber-100">
            <Zap size={22} />
            {levelUpMessage}
          </div>
        ) : null}
        {feedback ? (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm font-black text-white">
            <span className="inline-flex items-center gap-1 text-cyan-100">
              <Sparkles size={16} /> +{feedback.xp} XP
            </span>
            <span className="inline-flex items-center gap-1 text-amber-100">
              <Coins size={16} /> +{feedback.gold} gold
            </span>
            <span className="text-fuchsia-100">{feedback.bonusLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
