/**
 * Scroll-linked progress for one element, the same rule the shape wall paints by:
 * a line sits at LINE of the viewport height; progress is how far that line has
 * travelled through the element (0 = line at its top, 1 = line past its bottom).
 * Calls onProgress on every animation frame the page scrolls or resizes.
 * Reduced motion → always 1. Returns a cleanup function.
 */
export const LINE = 0.7;

export function watchProgress(
  el: HTMLElement,
  onProgress: (p: number) => void,
  { line = LINE, span }: { line?: number; span?: (rect: DOMRect, vh: number) => number } = {},
) {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  const tick = () => {
    frame = 0;
    if (still.matches) return onProgress(1);
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const vh = window.innerHeight;
    const length = span ? span(r, vh) : r.height;
    onProgress(Math.min(1, Math.max(0, (line * vh - r.top) / Math.max(1, length))));
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(tick); };
  tick();
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  still.addEventListener("change", request);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", request);
    window.removeEventListener("resize", request);
    still.removeEventListener("change", request);
  };
}

/** small seeded random, so pixel patterns are identical on every render */
export function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}
