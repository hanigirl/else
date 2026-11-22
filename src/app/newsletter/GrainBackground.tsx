"use client";

import { useEffect, useRef } from "react";
import styles from "./newsletter.module.css";

/**
 * "Blue grain gradient" — the Figma shader (Blue-grain-gradient-source), ported
 * from WGSL to a 2D canvas so it runs on every browser (the original is WebGPU).
 * The shader is static, so it's drawn once per size: an A→C→B gradient along an
 * angle, plus per-pixel hash film-grain added to the colour. Falls back to the
 * CSS gradient on .bg if the canvas can't be drawn.
 */

// defaults from the shader source, with the Figma frame's parameter overrides
const A = [0.102, 0.137, 0.494]; // deep cobalt/navy
const C = [0.22, 0.27, 0.82]; // royal-blue midpoint
const B = [0.678635, 0.767614, 1]; // bright periwinkle
const ANGLE = 314;
const GRADIENT_SCALE = 1.13;
const GRAIN_INTENSITY = 0.11;
const GRAIN_SCALE = 1.6;
const MAX_PIXELS = 1_500_000; // cap the render, scaled up by CSS on big screens

const fract = (x: number) => x - Math.floor(x);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** the shader's hash(vec2) → [0,1) */
function hash(x: number, y: number): number {
  let ax = fract(x * 0.1031);
  let ay = fract(y * 0.1031);
  let az = fract(x * 0.1031);
  const d = ax * (ay + 33.33) + ay * (az + 33.33) + az * (ax + 33.33);
  ax += d;
  ay += d;
  az += d;
  return fract((ax + ay) * az);
}

export function GrainBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rad = (ANGLE * Math.PI) / 180;
    const dirX = Math.cos(rad);
    const dirY = Math.sin(rad);
    const gScale = Math.max(GRADIENT_SCALE, 0.1);

    const render = () => {
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const s = Math.min(1, Math.sqrt(MAX_PIXELS / (vw * vh)));
      const w = Math.max(1, Math.round(vw * s));
      const h = Math.max(1, Math.round(vh * s));
      canvas.width = w;
      canvas.height = h;

      const img = ctx.createImageData(w, h);
      const data = img.data;
      for (let py = 0; py < h; py++) {
        const v = py / h;
        const gy = py / GRAIN_SCALE;
        const vd = (v - 0.5) * dirY;
        for (let px = 0; px < w; px++) {
          const u = px / w;
          const t = ((u - 0.5) * dirX + vd) / gScale + 0.5;
          const tc = clamp01(t);
          let r: number;
          let g: number;
          let b: number;
          if (tc < 0.5) {
            const k = tc * 2;
            r = mix(A[0], C[0], k);
            g = mix(A[1], C[1], k);
            b = mix(A[2], C[2], k);
          } else {
            const k = tc * 2 - 1;
            r = mix(C[0], B[0], k);
            g = mix(C[1], B[1], k);
            b = mix(C[2], B[2], k);
          }
          const gx = px / GRAIN_SCALE;
          const h2 = hash(gy + 17.3, gx + 17.3);
          const n = hash(gx + 0.07 * h2, gy + 0.07 * h2);
          const grain = (n - 0.5) * 2 * GRAIN_INTENSITY;
          const i = (py * w + px) * 4;
          data[i] = clamp01(r + grain) * 255;
          data[i + 1] = clamp01(g + grain) * 255;
          data[i + 2] = clamp01(b + grain) * 255;
          data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    render();
    let tmo = 0;
    const onResize = () => {
      clearTimeout(tmo);
      tmo = window.setTimeout(render, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(tmo);
    };
  }, []);

  return <canvas ref={ref} className={styles.grainCanvas} aria-hidden />;
}
