"use client";

import { useEffect, useState } from "react";

/** Press "G" to show the 12-column grid (72px margins, 32px gutters). */
export function GridOverlay() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "g" && !(e.target instanceof HTMLInputElement)) setOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!on) return null;
  return (
    <div className="grid-overlay" aria-hidden>
      <div className="page-container h-full">
        <div className="grid-12">
          {Array.from({ length: 12 }, (_, i) => <span key={i} className="max-xl:[&:nth-child(n+9)]:hidden max-md:[&:nth-child(n+5)]:hidden" />)}
        </div>
      </div>
    </div>
  );
}
