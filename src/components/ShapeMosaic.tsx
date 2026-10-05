"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import { WALL, shapeWall, type WallShape } from "@/content/shapeWall";
import { cluster, hoverTrail, pixel } from "@/lib/pixelBurst";

/**
 * Renders the shape wall from src/content/shapeWall.ts.
 * Coordinates are Figma px on a 1920-wide canvas; --u turns 1 design px into a
 * fluid unit, so the whole wall scales with its box.
 *
 * mode="solid" — plain shapes.
 * mode="paint" — each shape starts as a grid of faint squares and gets painted
 *                pixel by pixel, top to bottom, as the wall scrolls through the screen.
 */

/** cell size in design px (the little squares) */
export const CELL = 22;

const u = (n: number) => `calc(${n} * var(--u))`;

function shapeClass(s: WallShape) {
  const cls = ["shape", `shape--${s.kind}`];
  const isDefault = (s.kind === "triangle" && s.corner === "br") || (s.kind === "drop" && s.corner === "bl");
  if ((s.kind === "triangle" || s.kind === "drop") && !isDefault) cls.push(`is-corner-${s.corner}`);
  return cls.join(" ");
}

function shapeStyle(s: WallShape): CSSProperties {
  return {
    position: "absolute",
    "--sx": s.x,
    left: u(s.x),
    top: u(s.y),
    "--shape-w": u(s.w),
    "--shape-h": u(s.h),
    "--shape-color": `var(--color-${s.color})`,
    ...(s.kind === "drop" && s.hole && {
      "--hole-x": `${s.hole.cx * 100}%`,
      "--hole-y": `${s.hole.cy * 100}%`,
      "--hole-w": `${s.hole.rx * 100}%`,
      "--hole-h": `${s.hole.ry * 100}%`,
    }),
  } as CSSProperties;
}

/* ---------- the ragged paint front ---------- */

/** small seeded random, so the pattern is the same on server and client */
function seeded(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

type Column = { lead: number; spark: number | null };
type Plan = { rows: number; cols: Column[] };

const LEADS = [-1, 0, 0, 0, 0, 1, 1, 2]; // how far a column runs ahead (+) or behind (−) the front, in cells

function planFor(s: WallShape): Plan {
  const rnd = seeded(s.id);
  const cols = Array.from({ length: Math.ceil(s.w / CELL) }, () => ({
    lead: LEADS[Math.floor(rnd() * LEADS.length)],
    spark: rnd() < 0.28 ? 2 + Math.floor(rnd() * 4) : null, // a stray pixel 2–5 cells below the column's paint
  }));
  return { rows: Math.ceil(s.h / CELL), cols };
}

/**
 * The whole wall paints as one chunk, top to bottom: everything above a line
 * on the screen is painted, so as you scroll the paint runs down the wall.
 * LINE = where that line sits (share of the viewport height from the top).
 */
const LINE = 0.7;

/* ---------- hover sparkle (shared recipe: src/lib/pixelBurst.ts) ---------- */

/** a cluster on one shape: coloured squares on the dots, holes through the paint */
function burst(shape: HTMLElement, col: number, row: number) {
  const under = shape.querySelector<HTMLElement>(".paint-hover")!;   // below the paint → coloured squares
  const over = shape.querySelector<HTMLElement>(".paint-reveal")!;   // above the paint → holes showing what's behind
  const cols = shape.querySelectorAll<HTMLElement>(".paint-col");
  const painted = (c: number, r: number) => {
    const el = cols[c];
    if (!el) return false;
    const rows = el.style.getPropertyValue("--rows");
    return r < (rows === "" ? Infinity : Number(rows));
  };
  cluster(col, row, (c, r, delay) => (painted(c, r) ? over : under).appendChild(pixel(c, r, delay)));
}

export function ShapeMosaic({
  shapes = shapeWall,
  mode = "solid",
  className,
}: {
  shapes?: WallShape[];
  mode?: "solid" | "paint";
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const plans = useMemo(() => shapes.map(planFor), [shapes]);

  useLayoutEffect(() => {
    if (mode !== "paint" || !root.current) return;
    const shapeEls = Array.from(root.current.querySelectorAll<HTMLElement>("[data-shape]"));
    const colEls = shapeEls.map((el) => Array.from(el.querySelectorAll<HTMLElement>(".paint-col")));
    const sparkEls = shapeEls.map((el) => Array.from(el.querySelectorAll<HTMLElement>(".paint-spark")));
    const last = plans.map((p) => p.cols.map(() => -1));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    const paint = () => {
      frame = 0;
      const vh = window.innerHeight;
      const r = root.current!.getBoundingClientRect();
      const scale = WALL.width / r.width; // screen px → design px
      // the front, in design px measured down from the wall's top edge
      const front = still.matches ? Infinity : (LINE * vh - r.top) * scale;
      const done = front >= WALL.height + 2 * CELL;

      shapes.forEach((sh, si) => {
        const { rows, cols } = plans[si];
        const local = (front - sh.y) / CELL; // front in this shape's rows (from its top)
        cols.forEach((c, ci) => {
          const filled = done ? rows + 1 : Math.min(rows, Math.max(0, Math.floor(local + c.lead)));
          if (filled === last[si][ci]) return;
          last[si][ci] = filled;
          colEls[si][ci].style.setProperty("--rows", String(filled));
        });
        sparkEls[si].forEach((el) => {
          const ci = Number(el.dataset.col);
          const filled = last[si][ci];
          const at = filled + Number(el.dataset.k);
          // sparks only fall where the front is passing through this shape
          const on = !done && local > 0 && at < rows;
          el.style.setProperty("--row", String(at));
          el.style.opacity = on ? "1" : "0";
        });
      });
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(paint); };

    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    still.addEventListener("change", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      still.removeEventListener("change", request);
    };
  }, [mode, plans, shapes]);

  /* Hover: a little cluster of squares under the mouse. On the dotted part they
     light up in the shape's colour; on the painted part they punch through the
     paint and show what's behind it (the background + the resting dot). */
  useEffect(() => {
    if (mode !== "paint" || !root.current) return;
    const el = root.current;
    return hoverTrail(
      el,
      () => (CELL * el.getBoundingClientRect().width) / WALL.width,
      (t) => t.closest<HTMLElement>("[data-shape]"),
      (col, row, shape) => burst(shape, col, row),
    );
  }, [mode]);

  return (
    <div
      ref={root}
      aria-hidden
      className={["shape-wall", mode === "paint" && "is-paint", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${WALL.width} / ${WALL.height}`,
        containerType: "inline-size",
        ["--u" as string]: `calc(100cqw / ${WALL.width})`,
        ["--cell" as string]: `calc(${CELL} * var(--u))`,
      }}
    >
      {shapes.map((s, si) => (
        <div key={s.id} data-shape={s.id} data-group={s.group} className={shapeClass(s)} style={shapeStyle(s)}>
          {mode === "paint" && <span className="paint-hover" />}
          {mode === "paint" &&
            plans[si].cols.map((c, ci) => (
              <span key={ci} className="paint-col" style={{ "--i": ci } as CSSProperties} />
            ))}
          {mode === "paint" &&
            plans[si].cols.map((c, ci) =>
              c.spark === null ? null : (
                <span key={`s${ci}`} className="paint-spark" data-col={ci} data-k={c.spark} style={{ "--i": ci } as CSSProperties} />
              ),
            )}
          {mode === "paint" && <span className="paint-reveal" />}
        </div>
      ))}
    </div>
  );
}
