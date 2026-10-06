"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { seeded, watchProgress } from "@/lib/scrollProgress";

/**
 * A sentence built from square pixels, the way the shape wall is built.
 * At rest every pixel of the sentence is a faint stone; as the sentence scrolls
 * up the screen it gets painted in reading order (right → left for Hebrew),
 * column by column with a ragged front — the wall's paint, applied to type.
 *
 * Size and colour come from CSS on the element (font-size, color, font-weight),
 * so it follows the type scale and the surface it sits on. Before JS (or for
 * screen readers) it is simply the text.
 */

type Layout = {
  cell: number;              // css px per pixel
  cols: number;
  rows: number;
  cells: [number, number][]; // painted cells (col, row)
  order: number[];           // per cell: its threshold in 0..1 (when it gets painted)
};

/** canvas px per pixel when sampling the glyphs */
const SAMPLE = 12;

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(next).width > max) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function build(el: HTMLElement, text: string, cellsPerEm: number, align: "start" | "center"): Layout | null {
  const cs = getComputedStyle(el);
  const size = parseFloat(cs.fontSize);
  if (!size || !el.isConnected || !el.clientWidth) return null; // detached or hidden: nothing to lay out
  const font = (px: number) => `${cs.fontWeight} ${px}px ${cs.fontFamily}`;
  const rtl = cs.direction === "rtl";
  const width = el.clientWidth;
  const cell = size / cellsPerEm;
  const cols = Math.max(1, Math.floor(width / cell));

  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = font(size);
  const lines = wrap(probe, text, cols * cell);

  const lineRows = Math.round((size * 1.12) / cell);
  const rows = lineRows * lines.length;
  const k = SAMPLE / cell; // css px → sample px
  const cv = document.createElement("canvas");
  cv.width = cols * SAMPLE;
  cv.height = rows * SAMPLE;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.font = font(size * k);
  ctx.fillStyle = "#000";
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = align === "center" ? "center" : rtl ? "right" : "left";
  const x = align === "center" ? cv.width / 2 : rtl ? cv.width : 0;
  lines.forEach((l, i) => ctx.fillText(l, x, (i * lineRows + lineRows * 0.8) * SAMPLE));

  const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
  const rnd = seeded(text);
  const leads = Array.from({ length: cols }, () => (rnd() - 0.5) * 0.08);
  const cells: [number, number][] = [];
  const order: number[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const px = c * SAMPLE + SAMPLE / 2;
      const py = r * SAMPLE + SAMPLE / 2;
      if (data[(py * cv.width + px) * 4 + 3] < 110) continue;
      cells.push([c, r]);
      // reading order across the columns, top-down inside each line, ragged per column
      const across = (rtl ? cols - 1 - c : c) / Math.max(1, cols - 1);
      const line = Math.floor(r / lineRows);
      const within = (r % lineRows) / lineRows;
      order.push(Math.min(0.98, Math.max(0, (line + across) / lines.length * 0.86 + within * 0.06 + leads[c])));
    }
  }
  return { cell, cols, rows, cells, order };
}

export function PixelText({
  text,
  as: Tag = "h2",
  className,
  cellsPerEm = 13,
  align = "start",
  ghost = 0.16,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** pixels per em — fewer = chunkier */
  cellsPerEm?: number;
  align?: "start" | "center";
  /** opacity of the resting stones */
  ghost?: number;
}) {
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  // lay the sentence out on the pixel grid once the font is in, and again on width changes
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let live = true;
    let lastWidth = -1;
    const run = () => {
      if (!live || el.clientWidth === lastWidth) return;
      lastWidth = el.clientWidth;
      const next = build(el, text, cellsPerEm, align);
      if (next) setLayout(next);
    };
    const cs = getComputedStyle(el);
    document.fonts.load(`${cs.fontWeight} 32px ${cs.fontFamily}`, text).then(run, run);
    const ro = new ResizeObserver(() => document.fonts.ready.then(run));
    ro.observe(el);
    return () => { live = false; ro.disconnect(); };
  }, [text, cellsPerEm, align]);

  // paint with the scroll
  useEffect(() => {
    const el = wrapRef.current;
    const cv = canvasRef.current;
    if (!el || !cv || !layout) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { cell, cols, rows, cells, order } = layout;
    cv.width = Math.round(cols * cell * dpr);
    cv.height = Math.round(rows * cell * dpr);
    const ctx = cv.getContext("2d")!;
    const color = getComputedStyle(el).color;
    const dot = cell * 0.42;
    let last = -1;
    const draw = (p: number) => {
      const q = Math.round(p * 400) / 400;
      if (q === last) return;
      last = q;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cols * cell, rows * cell);
      ctx.fillStyle = color;
      for (let i = 0; i < cells.length; i++) {
        const [c, r] = cells[i];
        const t = order[i];
        if (q >= t) {
          ctx.globalAlpha = 1;
          ctx.fillRect(c * cell, r * cell, cell + 0.5, cell + 0.5);
        } else if (t - q < 0.025) {
          // the front: half-lit pixels just ahead of the paint
          ctx.globalAlpha = 0.45;
          ctx.fillRect(c * cell, r * cell, cell + 0.5, cell + 0.5);
        } else {
          ctx.globalAlpha = ghost;
          ctx.fillRect(c * cell + (cell - dot) / 2, r * cell + (cell - dot) / 2, dot, dot);
        }
      }
    };
    return watchProgress(el, draw, { line: 0.9, span: (r, vh) => r.height + vh * 0.35 });
  }, [layout, ghost]);

  return (
    <Tag
      ref={wrapRef}
      className={["pixel-text", layout && "is-ready", className].filter(Boolean).join(" ")}
      style={layout ? { height: layout.rows * layout.cell } : undefined}
    >
      <span className="pixel-text__words">{text}</span>
      {layout && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pixel-text__canvas"
          style={{
            width: layout.cols * layout.cell,
            height: layout.rows * layout.cell,
            ...(align === "center" && { insetInlineStart: `calc(50% - ${(layout.cols * layout.cell) / 2}px)` }),
          }}
        />
      )}
    </Tag>
  );
}
