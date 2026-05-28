"use client";

import { useEffect } from "react";

export function DevMountLog({ label }: { label: string }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(label);
    }
  }, [label]);

  return null;
}

