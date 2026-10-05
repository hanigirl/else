"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * A word in the Minecraft pixel font, rebuilt as real square pixels so each
 * one can be animated on its own (see .pixel-word in shapes.css).
 * The font's pixel grid is 1/10 em: we draw the word big on a canvas and
 * sample the centre of every grid cell.
 */

type Grid = { cols: number; rows: number; cells: [number, number][] };

const SAMPLE = 200;          // px — 1 font pixel = 20 canvas px
const UNIT = SAMPLE / 10;
const ABOVE = 7;             // grid rows above the baseline
const BELOW = 2;             // rows below (descenders)
const cache = new Map<string, Grid>();

function rasterize(text: string): Grid {
  const hit = cache.get(text);
  if (hit) return hit;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = `${SAMPLE}px Minecraft`;
  const cols = Math.round(ctx.measureText(text).width / UNIT);
  const rows = ABOVE + BELOW;
  c.width = cols * UNIT;
  c.height = rows * UNIT;
  ctx.font = `${SAMPLE}px Minecraft`;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, 0, ABOVE * UNIT);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const cells: [number, number][] = [];
  // column by column, top to bottom — the order it gets "written"
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const px = x * UNIT + UNIT / 2;
      const py = y * UNIT + UNIT / 2;
      if (data[(py * c.width + px) * 4 + 3] > 127) cells.push([x, y]);
    }
  }
  const grid = { cols, rows, cells };
  cache.set(text, grid);
  return grid;
}

export function PixelWord({ text, className }: { text: string; className?: string }) {
  const [grid, setGrid] = useState<Grid | null>(null);

  useEffect(() => {
    let live = true;
    document.fonts.load(`${SAMPLE}px Minecraft`).then(() => live && setGrid(rasterize(text)));
    return () => { live = false; };
  }, [text]);

  // The pixels are created after the font loads, so their CSS animations start
  // later than the star's rays. Put them on the rays' clock so a word always
  // sits on the longest ray, however long the font took.
  const root = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!grid || !el) return;
    // only the moving rays animate — take the clock from the first one that does
    const rays = el.closest(".shape-star")?.querySelectorAll(".shape-star__ray") ?? [];
    const ray = [...rays].map((r) => r.getAnimations()[0]).find(Boolean);
    if (ray?.startTime == null) return;
    el.querySelectorAll("i").forEach((px) => px.getAnimations().forEach((a) => { a.startTime = ray.startTime; }));
  }, [grid]);

  const n = grid ? grid.cells.length : 0;
  return (
    <span
      ref={root}
      className={["pixel-word", className].filter(Boolean).join(" ")}
      style={grid ? ({ "--cols": grid.cols, "--rows": grid.rows } as CSSProperties) : undefined}
    >
      <span className="sr-only">{text}</span>
      {grid?.cells.map(([x, y], k) => (
        <i key={k} aria-hidden style={{ "--x": x, "--y": y, "--d": n > 1 ? k / (n - 1) : 0 } as CSSProperties} />
      ))}
    </span>
  );
}
