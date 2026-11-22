"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./newsletter.module.css";

const COLS = 72;
const ROWS = 8;
const CYCLE_MS = 5000;

/** blue is the base in every layout; configs 2 & 3 sprinkle ~10% of an accent
    colour (lime / pink) over that blue. */
const BLUE = ["var(--color-indigo)", "#7d86f1", "var(--color-periwinkle)"];
const ACCENT_RATIO = 0.1;

/** three distinct layouts the band loops through — each its own seed and,
    from the 2nd, a monochromatic accent (dark → base → light) over the blue. */
const CONFIGS_DEF: { seed: number; accent: string[] | null }[] = [
  { seed: 1, accent: null }, // 1 · all blue
  { seed: 2, accent: ["#93c222", "#bcf92b", "#d1fa69"] }, // 2 · ~10% lime #BCF92B
  { seed: 3, accent: ["#ba1756", "#ef1e6e", "#f46399"] }, // 3 · ~10% pink #EF1E6E
];

/** deterministic pseudo-random in [0,1) — stable across server/client render */
function rnd(c: number, r: number, seed: number): number {
  const x = Math.sin((c + 1) * 127.1 + (r + 1) * 311.7 + seed * 74.7) * 43758.5453;
  return x - Math.floor(x);
}

type Cell = { c: number; r: number; op: number; delay: number; shade: string };

/** one pixel-dissolve layout: dense at the floor, thinning upward. Mostly blue;
    when an accent is given, ~10% of the cells take an accent shade instead. */
function buildConfig(seed: number, accent: string[] | null): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const depth = (r + 1) / ROWS; // 1 at the bottom row, →0 at the top
      const density = Math.pow(depth, 1.8); // bottom nearly solid, top sparse
      if (rnd(c, r, seed) < density) {
        const v = rnd(c, r, seed + 9);
        const pal = accent && rnd(c, r, seed + 20) < ACCENT_RATIO ? accent : BLUE;
        cells.push({
          c,
          r,
          op: 0.5 + v * 0.5,
          delay: (ROWS - 1 - r) * 0.085 + rnd(c, r, seed + 3) * 0.2, // rise from bottom
          shade: pal[Math.min(pal.length - 1, Math.floor(v * pal.length))],
        });
      }
    }
  }
  return cells;
}

const CONFIGS = CONFIGS_DEF.map((d) => buildConfig(d.seed, d.accent));

/**
 * Full-width pixel band across the bottom of the page, generated in code. It
 * fills in with a staggered load animation that rises from the floor, then
 * auto-"reloads" every few seconds, cycling through three different pixel
 * layouts on a loop. Honours prefers-reduced-motion (no reload, no fill).
 */
export function PixelBand() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % CONFIGS.length), CYCLE_MS);
    return () => clearInterval(t);
  }, []);

  const cells = CONFIGS[idx];

  return (
    // the key changes every cycle → React remounts the band, replaying the fill
    <div
      key={idx}
      className={styles.pixelBand}
      aria-hidden
      style={{ "--cols": COLS, "--rows": ROWS } as CSSProperties}
    >
      {cells.map(({ c, r, op, delay, shade }, i) => (
        <i
          key={i}
          style={
            {
              gridColumn: c + 1,
              gridRow: r + 1,
              background: shade,
              // rounded so the server and client render byte-identical strings
              // (Math.sin differs by ~1 ULP across engines → hydration mismatch)
              "--op": op.toFixed(3),
              "--d": `${delay.toFixed(3)}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
