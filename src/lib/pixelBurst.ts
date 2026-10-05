/**
 * The hover pixel cluster — shared by the shape wall (section 2) and the
 * portrait (section 4), so both feel the same. Squares pop in from the middle
 * out and switch off one by one (CSS: @keyframes hover-pixel in shapes.css).
 */

/** knobs for the hover cluster */
export const HOVER = {
  radius: 2.6,  // cells — size of the cluster
  every: 30,    // ms — at most one new cluster this often
  strays: 2,    // max stray pixels around it
  life: [220, 420] as const, // ms each square stays lit (random in range)
};

/** one square at grid cell (c, r); removes itself when its animation ends */
export function pixel(c: number, r: number, delay: number, color?: string, life?: number) {
  const px = document.createElement("i");
  life ??= HOVER.life[0] + Math.random() * (HOVER.life[1] - HOVER.life[0]);
  px.style.cssText = `--c:${c};--r:${r};--delay:${delay}ms;--life:${life}ms${color ? `;--pc:${color}` : ""}`;
  px.addEventListener("animationend", () => px.remove(), { once: true });
  return px;
}

/** lay out one cluster around (col, row): calls add() for each square */
export function cluster(col: number, row: number, add: (c: number, r: number, delay: number) => void) {
  const R = Math.ceil(HOVER.radius);
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const d = Math.hypot(dx, dy);
      // dense in the middle, ragged at the rim
      if (d > HOVER.radius || Math.random() > 1.45 - (d / HOVER.radius) * 0.9) continue;
      add(col + dx, row + dy, d * 10);
    }
  }
  const strays = Math.floor(Math.random() * (HOVER.strays + 1));
  for (let i = 0; i < strays; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = HOVER.radius + 1.5 + Math.random() * 2;
    add(col + Math.round(Math.cos(a) * d), row + Math.round(Math.sin(a) * d), 30 + Math.random() * 50);
  }
}

/**
 * Wire a hover trail onto an element: on mouse move, work out the grid cell
 * under the pointer and spawn a cluster there. Returns a cleanup function.
 * cellPx() → current cell size in CSS px; onCell(col, row, target) spawns.
 */
export function hoverTrail(
  el: HTMLElement,
  cellPx: () => number,
  origin: (target: HTMLElement) => HTMLElement | null,
  onCell: (col: number, row: number, box: HTMLElement) => void,
) {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lastKey = "";
  let lastAt = 0;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || still.matches) return;
    const box = origin(e.target as HTMLElement);
    if (!box) return;
    const r = box.getBoundingClientRect();
    const cell = cellPx();
    const col = Math.floor((e.clientX - r.left) / cell);
    const row = Math.floor((e.clientY - r.top) / cell);
    const key = `${box.dataset.shape ?? ""}:${col}:${row}`;
    const now = performance.now();
    if (key === lastKey || now - lastAt < HOVER.every) return;
    lastKey = key;
    lastAt = now;
    onCell(col, row, box);
  };
  el.addEventListener("pointermove", onMove);
  return () => el.removeEventListener("pointermove", onMove);
}

/* ---------- click wave ---------- */

/** knobs for the click wave */
export const WAVE = {
  speed: 34,      // ms per cell — how fast the ring travels outward
  jitter: 40,     // ms of random lag, so the ring's edge is ragged
  density: 0.6,   // share of cells that light up as the ring passes
  life: [160, 300] as const, // ms each square stays lit
  colors: ["var(--color-indigo)", "var(--color-black)"],
};

/**
 * A ring of squares spreading from (cx, cy) to the edges of a cols × rows grid.
 * Calls add() for each square with its delay and colour.
 */
export function wave(
  cols: number,
  rows: number,
  cx: number,
  cy: number,
  add: (c: number, r: number, delay: number, color: string, life: number) => void,
) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > WAVE.density) continue;
      const d = Math.hypot(c + 0.5 - cx, r + 0.5 - cy);
      const color = WAVE.colors[Math.floor(Math.random() * WAVE.colors.length)];
      const life = WAVE.life[0] + Math.random() * (WAVE.life[1] - WAVE.life[0]);
      add(c, r, d * WAVE.speed + Math.random() * WAVE.jitter, color, life);
    }
  }
}
