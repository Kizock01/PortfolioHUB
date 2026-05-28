"use client";

import { memo } from "react";

export const ArenaTimer = memo(function ArenaTimer({ msRemaining }: { msRemaining: number }) {
  const seconds = Math.max(0, Math.ceil(msRemaining / 1000));
  return (
    <div className="rounded-2xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-center text-2xl font-black text-violet-100">
      {seconds}s
    </div>
  );
});

