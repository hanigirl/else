import type { CSSProperties, ReactNode } from "react";
import { PixelWord } from "./PixelWord";

/** A token name from tokens.css, e.g. "indigo", "rose" — or any CSS colour. */
type ShapeColor =
  | "indigo" | "azure" | "periwinkle" | "violet" | "olive" | "mustard" | "rose" | "magenta"
  | (string & {});

type Corner = "tl" | "tr" | "bl" | "br";

const toColor = (c?: ShapeColor) =>
  !c ? undefined : /^(#|rgb|hsl|var\()/.test(c) ? c : `var(--color-${c})`;

const px = (v?: number | string) => (typeof v === "number" ? `${v}px` : v);

type Base = {
  /** number = px, string = any CSS length (e.g. "calc(454 * var(--u))") */
  w?: number | string;
  h?: number | string;
  color?: ShapeColor;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
};

function vars({ w, h, color, rotate }: Base): CSSProperties {
  return {
    ...(w !== undefined && { "--shape-w": px(w) }),
    ...(h !== undefined && { "--shape-h": px(h) }),
    ...(color && { "--shape-color": toColor(color) }),
    ...(rotate !== undefined && { "--shape-rotate": `${rotate}deg` }),
  } as CSSProperties;
}

/* ---------- Single shapes ---------- */

export function Shape({
  kind = "rect",
  corner,
  hole = true,
  ...rest
}: Base & { kind?: "rect" | "circle" | "triangle" | "drop"; corner?: Corner; hole?: boolean }) {
  const isDefaultCorner = (kind === "triangle" && corner === "br") || (kind === "drop" && corner === "bl");
  const cls = [
    "shape",
    `shape--${kind}`,
    corner && !isDefaultCorner && `is-corner-${corner}`,
    rest.className,
  ].filter(Boolean).join(" ");
  const style = { ...vars(rest), ...(kind === "drop" && !hole && { "--hole-w": "0%" }), ...rest.style } as CSSProperties;
  return <div aria-hidden className={cls} style={style} />;
}

/* ---------- Bars ---------- */

export function ShapeBars({
  count = 3,
  direction = "column",
  gap,
  ...rest
}: Base & { count?: number; direction?: "row" | "column"; gap?: number | string }) {
  const style = {
    ...vars(rest),
    "--bars-direction": direction,
    ...(gap !== undefined && { "--bars-gap": px(gap) }),
    ...rest.style,
  } as CSSProperties;
  return (
    <div aria-hidden className={["shape-bars", rest.className].filter(Boolean).join(" ")} style={style}>
      {Array.from({ length: count }, (_, i) => <span key={i} />)}
    </div>
  );
}

/* ---------- Steps ---------- */

export function ShapeSteps({
  stepW,
  stepH,
  offsets,
  color,
  className,
  style,
}: {
  stepW?: number | string;
  stepH?: number | string;
  /** per-step left offset (top step first). Omit for the Figma stair. */
  offsets?: (number | string)[];
  color?: ShapeColor;
  className?: string;
  style?: CSSProperties;
}) {
  const s = {
    ...(stepW !== undefined && { "--step-w": px(stepW) }),
    ...(stepH !== undefined && { "--step-h": px(stepH) }),
    ...(color && { "--shape-color": toColor(color) }),
    ...style,
  } as CSSProperties;
  const steps = offsets ?? [undefined, undefined, undefined];
  return (
    <div aria-hidden className={["shape-steps", className].filter(Boolean).join(" ")} style={s}>
      {steps.map((x, i) => (
        <span key={i} style={x !== undefined ? ({ "--step-x": px(x) } as CSSProperties) : undefined} />
      ))}
    </div>
  );
}

/* ---------- Pixels ---------- */

export type Pixel = { c: number; r: number; cs?: number; rs?: number };

export function ShapePixels({
  cells,
  cols,
  rows,
  size,
  color,
  className,
  style,
}: {
  cells: Pixel[];
  cols: number;
  rows: number;
  size?: number | string;
  color?: ShapeColor;
  className?: string;
  style?: CSSProperties;
}) {
  const s = {
    "--pixel-cols": cols,
    "--pixel-rows": rows,
    ...(size !== undefined && { "--pixel": px(size) }),
    ...(color && { "--shape-color": toColor(color) }),
    ...style,
  } as CSSProperties;
  return (
    <div aria-hidden className={["shape-pixels", className].filter(Boolean).join(" ")} style={s}>
      {cells.map((p, i) => (
        <span key={i} style={{ "--c": p.c, "--r": p.r, "--cs": p.cs ?? 1, "--rs": p.rs ?? 1 } as CSSProperties} />
      ))}
    </div>
  );
}

/* ---------- Placement helper for compositions ---------- */

/** Absolutely places a shape inside a design-unit canvas (see ShapeMosaic). */
export function Place({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div style={{ position: "absolute", left: `calc(${x} * var(--u))`, top: `calc(${y} * var(--u))` }}>
      {children}
    </div>
  );
}

/* ---------- Blurred star ---------- */

export function BlurStar({
  size,
  step,
  labels,
  labelClassName,
  animated = true,
  className,
  style,
}: {
  /** box size, any CSS length — the hub is its centre, the tail reaches the edge */
  size?: string;
  /** seconds before the tail moves to the next ray */
  step?: number;
  /** words shown at the tail's tip, in order; they repeat around the 8 rays */
  labels?: string[];
  labelClassName?: string;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const s = {
    ...(size && { "--star-size": size }),
    ...(step !== undefined && { "--star-step": `${step}s` }),
    ...style,
  } as CSSProperties;
  return (
    <div className={["shape-star", !animated && "is-static", className].filter(Boolean).join(" ")} style={s}>
      <div aria-hidden className="shape-star__glow">
        {Array.from({ length: 8 }, (_, i) => <span key={i} className="shape-star__ray" />)}
      </div>
      {labels && labels.length > 0 && (
        <div>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} lang="en" aria-hidden={i >= labels.length} className={["shape-star__label", labelClassName].filter(Boolean).join(" ")}>
              <PixelWord text={labels[i % labels.length]} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
