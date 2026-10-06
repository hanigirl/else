"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { seeded } from "@/lib/scrollProgress";
import type { ShapeColor } from "@/content/shapeWall";

/**
 * One of the wall's shapes, drawn as a grid of square pixels. At rest the
 * pixels are faint stones; switched on, they get painted top-down with the
 * wall's ragged front; switched off, they fall back to stones bottom-up.
 *
 * on: controlled. Leave undefined and it switches itself on the first time it
 * scrolls into view.
 */

export type PixelShapeKind =
  | "rect" | "triangle" | "circle" | "drop" | "stairs" | "stripes" | "comb" | "x" | "plus" | "minus" | "wedge" | "lines";

/** "lines": written lines of different lengths, one blank row between them */
const LINE_LENGTHS = [1, 0.78, 0.92, 0.55, 0.86, 0.68];

/** is the cell centre (u, v ∈ 0..1, v down) inside the shape? */
const inside: Record<PixelShapeKind, (u: number, v: number) => boolean> = {
  rect: () => true,
  triangle: (u, v) => u + v >= 1,                       // right angle bottom-right (the magenta one)
  wedge: (u, v) => v >= u,                               // right angle bottom-left
  circle: (u, v) => (u - 0.5) ** 2 + (v - 0.5) ** 2 <= 0.25,
  drop: (u, v) => {
    // 3 round corners + square bottom-left, with the hole (the violet one)
    const hole = ((u - 0.5) / 0.17) ** 2 + ((v - 0.49) / 0.155) ** 2 <= 1;
    if (hole) return false;
    const corner = (cx: number, cy: number) => (u - cx) ** 2 + (v - cy) ** 2 <= 0.25;
    if (u < 0.5 && v < 0.5) return corner(0.5, 0.5);
    if (u >= 0.5 && v < 0.5) return corner(0.5, 0.5);
    if (u >= 0.5 && v >= 0.5) return corner(0.5, 0.5);
    return true;
  },
  stairs: (u, v) => (v < 1 / 3 ? u >= 0.52 : v < 2 / 3 ? u >= 0.26 && u < 0.78 : u < 0.52),
  stripes: (_u, v) => v < 0.28 || (v >= 0.36 && v < 0.64) || v >= 0.72,
  comb: (u, v) => v >= 0.72 || (v < 0.64 && (u < 0.28 || (u >= 0.36 && u < 0.64) || u >= 0.72)),
  x: (u, v) => Math.abs(u - v) < 0.2 || Math.abs(u + v - 1) < 0.2,
  plus: (u, v) => Math.abs(u - 0.5) < 0.2 || Math.abs(v - 0.5) < 0.2,
  minus: (_u, v) => Math.abs(v - 0.5) < 0.2,
  lines: (u, v) => {
    const k = Math.floor(v * (LINE_LENGTHS.length * 2 - 1));
    return k % 2 === 0 && 1 - u < LINE_LENGTHS[k / 2]; // right-aligned, like Hebrew handwriting
  },
};

export function PixelShape({
  kind,
  color,
  cols = 12,
  rows = cols,
  on,
  speed = 520,
  className,
  style,
}: {
  kind: PixelShapeKind;
  color: ShapeColor | "indigo" | "white" | "ink";
  cols?: number;
  rows?: number;
  on?: boolean;
  /** ms for the paint to run top to bottom */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const active = on ?? seen;

  useEffect(() => {
    if (on !== undefined || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { rootMargin: "0px 0px -20% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [on]);

  const cells = useMemo(() => {
    const rnd = seeded(`${kind}-${cols}-${rows}`);
    const leads = Array.from({ length: cols }, () => Math.floor(rnd() * 3) - 1);
    const out: { c: number; r: number; d: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!inside[kind]((c + 0.5) / cols, (r + 0.5) / rows)) continue;
        // top-down, each column a row ahead or behind — the wall's ragged front
        out.push({ c, r, d: Math.max(0, (r - leads[c]) / rows) });
      }
    }
    return out;
  }, [kind, cols, rows]);

  return (
    <div
      ref={ref}
      aria-hidden
      dir="ltr"
      className={["pixel-shape", active && "is-on", className].filter(Boolean).join(" ")}
      style={{
        "--cols": cols,
        "--rows": rows,
        "--px-color": color === "ink" ? "var(--color-ink)" : `var(--color-${color})`,
        "--px-speed": `${speed}ms`,
        ...style,
      } as CSSProperties}
    >
      {cells.map(({ c, r, d }) => (
        <i key={`${c}-${r}`} style={{ "--c": c, "--r": r, "--d": d.toFixed(3) } as CSSProperties} />
      ))}
    </div>
  );
}
