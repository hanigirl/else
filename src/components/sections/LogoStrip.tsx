import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";

/**
 * Section 3 — the client / partner logo strip, as an endless marquee sliding
 * left. Logos come from uxtra.co.il (Hani's section), recoloured #B1BBC7, and
 * are used as masks so they all take one colour: --color-logo (tokens.css).
 * `w` = the logo's width at 1920 (before SIZE), `ratio` = width / height.
 */
const logos: { file: string; alt: string; w: number; ratio: number }[] = [
  { file: "elementor.png", alt: "Elementor", w: 190, ratio: 368 / 64 },
  { file: "contrast.png", alt: "Contrast", w: 145, ratio: 113 / 14 },
  { file: "technion.png", alt: "הטכניון — מכון טכנולוגי לישראל", w: 140, ratio: 105 / 58 },
  { file: "esh.svg", alt: "esh", w: 86, ratio: 120 / 48 },
  { file: "dazn.svg", alt: "DAZN", w: 64, ratio: 1 },
  { file: "torii.svg", alt: "Torii", w: 104, ratio: 89 / 27 },
  { file: "the-unit.svg", alt: "The Unit", w: 70, ratio: 64 / 35 },
];

/** knobs */
const SIZE = 0.8;  // logos vs the original strip
const GAP = 190;   // px at 1920 between logos (before SIZE)
const ROW_H = 148; // row height at 1920 (before SIZE) — keeps the strip at its height

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="logo-marquee__row"
      style={{ height: `calc(${ROW_H * SIZE} * var(--logo-unit))` }}
    >
      {logos.map((l) => (
        <li key={l.file} className="flex shrink-0 items-center justify-center">
          <span
            role={hidden ? undefined : "img"}
            aria-label={hidden ? undefined : l.alt}
            className="logo-mark"
            style={{
              "--logo": `url(${asset(`/assets/logos/${l.file}`)})`,
              width: `calc(${l.w * SIZE} * var(--logo-unit))`,
              aspectRatio: l.ratio,
            } as CSSProperties}
          />
        </li>
      ))}
    </ul>
  );
}

export function LogoStrip() {
  return (
    <section
      aria-label="עבדתי עם"
      dir="ltr" /* the track overflows to the right and slides left — anchor it on the left */
      className="logo-marquee [--logo-unit:0.75px] md:[--logo-unit:min(1px,100vw/1920)]"
      style={{ "--logo-gap": `calc(${GAP * SIZE} * var(--logo-unit))` } as CSSProperties}
    >
      {/* Figma: 128 top & bottom → 20% thinner */}
      <div className="logo-marquee__track py-12 md:py-[clamp(38px,5.33vw,102px)]">
        {/* 3 identical rows: one row is narrower than a wide screen, so two copies
            would leave an empty stretch before the loop restarts */}
        <Row />
        <Row hidden />
        <Row hidden />
      </div>
    </section>
  );
}
