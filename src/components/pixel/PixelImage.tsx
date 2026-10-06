"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, type ReactNode } from "react";
import { watchProgress } from "@/lib/scrollProgress";

/**
 * A photo that arrives as pixels. It rests as a coarse mosaic of the photo's own
 * colours and resolves, step by step, to the real picture as it scrolls up the
 * screen. The steps are hard cuts (no blur, no fade) — pixels never glide.
 * The <img> is always in the DOM underneath (alt text, no-JS, reduced motion).
 */

/** pixels across the photo at each step, coarse → fine; the last step shows the photo itself */
const STEPS = [6, 9, 14, 22, 34, 56, 96];

export function PixelImage({
  src,
  alt,
  width,
  height,
  className,
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** overlays drawn above the photo (e.g. indigo pixels on its edges) */
  children?: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const img = el?.querySelector("img");
    if (!el || !cv || !img) return;
    const ctx = cv.getContext("2d")!;
    const small = document.createElement("canvas");
    const sctx = small.getContext("2d")!;
    let step = -1;
    let stop = () => {};

    const paint = (p: number) => {
      // finish resolving by the time the photo's middle reaches the line
      const s = Math.min(STEPS.length, Math.floor(p * (STEPS.length + 1)));
      if (s === step) return;
      step = s;
      if (s >= STEPS.length) {
        cv.style.opacity = "0";
        return;
      }
      cv.style.opacity = "1";
      const across = STEPS[s];
      const down = Math.max(1, Math.round((across * height) / width));
      small.width = across;
      small.height = down;
      sctx.drawImage(img, 0, 0, across, down);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(small, 0, 0, cv.width, cv.height);
    };

    const start = () => {
      cv.width = width;
      cv.height = height;
      stop = watchProgress(el, paint, { line: 0.95, span: (r) => r.height * 0.75 });
    };
    if (img.complete && img.naturalWidth) start();
    else img.addEventListener("load", start, { once: true });
    return () => { img.removeEventListener("load", start); stop(); };
  }, [width, height]);

  return (
    <div ref={wrap} className={["relative overflow-hidden", className].filter(Boolean).join(" ")} style={{ aspectRatio: `${width} / ${height}` }}>
      <img src={src} alt={alt} width={width} height={height} className="absolute inset-0 size-full object-cover" />
      <canvas ref={canvas} aria-hidden className="pixel-image__mosaic absolute inset-0 size-full" />
      {children}
    </div>
  );
}
