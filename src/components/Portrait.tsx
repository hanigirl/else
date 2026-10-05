"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, type CSSProperties } from "react";
import { PORTRAIT, portraitPixels, type Pixel } from "@/content/portraitPixels";
import { cluster, hoverTrail, pixel, wave } from "@/lib/pixelBurst";

/** one grid cell of the indigo pixels, in Figma px */
const CELL = 40.5;

/** share of hover squares that take the photo's own colour (the rest are purple) */
const IMAGE_MIX = 0.55;

/** cluster size vs Figma. Each cluster shrinks as one piece, so pixels keep touching */
const PIXEL_SCALE = 0.75;

/**
 * Shrink every cluster toward the edge/corner of the photo it sits on:
 * left/right third → that side, middle → its own centre; same for top/bottom.
 */
function scaleClusters(pixels: Pixel[], k: number): Pixel[] {
  const groups = new Map<string, Pixel[]>();
  pixels.forEach((p) => groups.set(p.group, [...(groups.get(p.group) ?? []), p]));
  const anchor = new Map<string, [number, number]>();
  groups.forEach((ps, g) => {
    const x0 = Math.min(...ps.map((p) => p.x)), x1 = Math.max(...ps.map((p) => p.x + p.w));
    const y0 = Math.min(...ps.map((p) => p.y)), y1 = Math.max(...ps.map((p) => p.y + p.h));
    const cx = ((x0 + x1) / 2 - PORTRAIT.x) / PORTRAIT.w;
    const cy = ((y0 + y1) / 2 - PORTRAIT.y) / PORTRAIT.h;
    anchor.set(g, [cx < 1 / 3 ? x0 : cx > 2 / 3 ? x1 : (x0 + x1) / 2, cy < 1 / 3 ? y0 : cy > 2 / 3 ? y1 : (y0 + y1) / 2]);
  });
  return pixels.map((p) => {
    const [ax, ay] = anchor.get(p.group)!;
    return { ...p, x: ax + (p.x - ax) * k, y: ay + (p.y - ay) * k, w: p.w * k, h: p.h * k };
  });
}

const pixels = scaleClusters(portraitPixels, PIXEL_SCALE);

/** rounded, so server and browser write the exact same style text */
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const pct = (v: number, of: number) => `${r3((v / of) * 100)}%`;

/** stable per-pixel randomness, so the motion is the same on every render */
function rand(i: number, salt: number) {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

const HOPS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Idle motion — kept calm on purpose, so it never pulls attention from the form.
 * Each pixel hops one cell and back, blinks, or holds still, every IDLE.slow s or so.
 */
const IDLE = {
  hop: 0.32,      // share of pixels that hop
  blink: 0.16,    // share that blink (the rest hold still)
  slow: [9, 17] as const, // s per cycle (random in range)
};

function motion(i: number): CSSProperties {
  const kind = rand(i, 1);
  const dur = r3(IDLE.slow[0] + rand(i, 2) * (IDLE.slow[1] - IDLE.slow[0])); // s
  const delay = r3(-rand(i, 3) * dur);              // start mid-cycle, so they're out of sync
  if (kind < IDLE.hop) {
    const [hx, hy] = HOPS[Math.floor(rand(i, 4) * HOPS.length)];
    return { "--hx": String(hx), "--hy": String(hy), animation: `portrait-hop ${dur}s steps(1, end) ${delay}s infinite` } as CSSProperties;
  }
  if (kind < IDLE.hop + IDLE.blink) return { animation: `portrait-blink ${dur}s steps(1, end) ${delay}s infinite` };
  return {};
}

/**
 * Average colour of the photo inside each grid cell — what a "pixelated"
 * square at that cell should look like. Grid = cols × rows of the pixel cell.
 */
function cellColors(img: HTMLImageElement, cols: number, rows: number): string[] {
  const w = img.naturalWidth, h = img.naturalHeight;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  const cw = w / cols, ch = h / rows;
  const out: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let R = 0, G = 0, B = 0, n = 0;
      const x0 = Math.floor(c * cw), x1 = Math.min(w, Math.floor((c + 1) * cw));
      const y0 = Math.floor(r * ch), y1 = Math.min(h, Math.floor((r + 1) * ch));
      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          const i = (y * w + x) * 4;
          R += data[i]; G += data[i + 1]; B += data[i + 2]; n++;
        }
      }
      out.push(n ? `rgb(${Math.round(R / n)} ${Math.round(G / n)} ${Math.round(B / n)})` : "");
    }
  }
  return out;
}

/** Hani's portrait: living purple pixels on its edges, pixel clusters under the cursor, a pixel wave on click */
export function Portrait({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);

  /* Hover: pixel clusters under the mouse — same recipe as the shape wall — mixing
     purple squares with squares in the photo's own colour at that spot.
     Click: a ring of purple + black pixels from the centre to the edges, one per click. */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const layer = el.querySelector<HTMLElement>(".portrait-hover")!;
    const img = el.querySelector("img")!;
    const cellPx = () => (CELL * PIXEL_SCALE * el.getBoundingClientRect().width) / PORTRAIT.w;

    // the grid is fixed in photo terms, so sample it once when the photo is ready
    const GRID_COLS = Math.ceil(PORTRAIT.w / (CELL * PIXEL_SCALE));
    const GRID_ROWS = Math.ceil(PORTRAIT.h / (CELL * PIXEL_SCALE));
    let colors: string[] = [];
    const sample = () => { colors = cellColors(img, GRID_COLS, GRID_ROWS); };
    if (img.complete && img.naturalWidth) sample();
    else img.addEventListener("load", sample, { once: true });
    const photoColor = (c: number, r: number) =>
      c >= 0 && r >= 0 && c < GRID_COLS && r < GRID_ROWS && Math.random() < IMAGE_MIX
        ? colors[r * GRID_COLS + c] || undefined
        : undefined;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onClick = () => {
      if (still.matches) return;
      const { width, height } = el.getBoundingClientRect();
      const cell = cellPx();
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      const squares = document.createDocumentFragment();
      wave(cols, rows, width / cell / 2, height / cell / 2, (c, r, delay, color, life) =>
        squares.appendChild(pixel(c, r, delay, color, life)),
      );
      layer.appendChild(squares);
    };
    el.addEventListener("click", onClick);

    const stopTrail = hoverTrail(
      el,
      cellPx,
      () => el,
      (col, row) => cluster(col, row, (c, r, delay) => layer.appendChild(pixel(c, r, delay, photoColor(c, r)))),
    );
    return () => {
      img.removeEventListener("load", sample);
      el.removeEventListener("click", onClick);
      stopTrail();
    };
  }, []);

  return (
    <div
      ref={wrap}
      className={["relative cursor-pointer select-none", className].filter(Boolean).join(" ")}
      style={{
        aspectRatio: `${PORTRAIT.w} / ${PORTRAIT.h}`,
        containerType: "inline-size",
        ["--pixel-cell" as string]: `calc(100cqw * ${r3((CELL * PIXEL_SCALE) / PORTRAIT.w)})`,
      }}
    >
      <img
        src="/assets/hani-portrait.webp"
        alt="חני בוסקילה"
        width={688}
        height={878}
        className="absolute inset-0 size-full object-cover"
      />
      {/* hover clusters */}
      <span aria-hidden className="portrait-hover" dir="ltr" />
      {/* the living purple pixels */}
      <div aria-hidden className="pointer-events-none absolute inset-0" dir="ltr">
        {pixels.map((px, i) => (
          <span
            key={i}
            data-group={px.group}
            className="portrait-pixel absolute bg-indigo"
            style={{
              left: pct(px.x - PORTRAIT.x, PORTRAIT.w),
              top: pct(px.y - PORTRAIT.y, PORTRAIT.h),
              width: pct(px.w, PORTRAIT.w),
              height: pct(px.h, PORTRAIT.h),
              ...motion(i),
            }}
          />
        ))}
      </div>
    </div>
  );
}
