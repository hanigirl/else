import styles from "./newsletter.module.css";

const COLS = 11;
const ROWS = 9;

/** deterministic pseudo-random in [0,1) — stable across server/client render */
function rnd(c: number, r: number, seed: number): number {
  const x = Math.sin((c + 1) * 127.1 + (r + 1) * 311.7 + seed * 74.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A pixel-dissolve mosaic rising from a bottom corner — solid at the corner,
 * thinning into scattered squares going up and inward. Generated in code (no
 * image), so it scales cleanly and matches the brand's pixel language.
 * The pattern is computed for a bottom-LEFT corner; the right field is mirrored
 * with CSS (.pixelsRight → scaleX(-1)).
 */
export function PixelField({ side }: { side: "left" | "right" }) {
  const seed = side === "left" ? 1 : 2;
  const cells: { c: number; r: number; v: number }[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dx = c / (COLS - 1); // 0 at the corner edge (left)
      const dy = (ROWS - 1 - r) / (ROWS - 1); // 0 at the bottom
      const dist = Math.min(1, Math.hypot(dx, dy) / Math.SQRT2); // 0 corner → 1 far
      const density = Math.pow(1 - dist, 1.7);
      if (rnd(c, r, seed) < density) {
        cells.push({ c, r, v: rnd(c, r, seed + 10) });
      }
    }
  }

  return (
    <div
      className={`${styles.pixels} ${side === "right" ? styles.pixelsRight : styles.pixelsLeft}`}
      aria-hidden
    >
      {cells.map(({ c, r, v }, i) => (
        <i
          key={i}
          style={{
            gridColumn: c + 1,
            gridRow: r + 1,
            background: v > 0.62 ? "var(--color-periwinkle)" : "var(--color-indigo)",
            opacity: 0.5 + v * 0.5,
          }}
        />
      ))}
    </div>
  );
}
