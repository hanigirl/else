/**
 * The shape wall of "ללמוד את המקצוע כמו שהוא נראה היום" (Figma 51:1001).
 *
 * Every shape is one primitive with its Figma frame coordinates (frame = 1920 wide).
 * Edit a number here and the wall changes. Stripes and stairs are split
 * into their single rectangles and tagged with `group`, so later each piece can be
 * built, moved or animated on its own (e.g. drawn as a grid of small squares).
 */

export type ShapeColor =
  | "indigo" | "azure" | "periwinkle" | "violet" | "olive" | "mustard" | "rose" | "magenta";

type Base = {
  id: string;
  /** shapes that belong together (the 3 stripes, the 3 stairs) */
  group?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: ShapeColor;
};

export type WallShape =
  | (Base & { kind: "rect" })
  | (Base & { kind: "circle" })
  /** right triangle; `corner` = where the right angle sits */
  | (Base & { kind: "triangle"; corner: "tl" | "tr" | "bl" | "br" })
  /** 3 round corners + 1 square one, with an elliptical hole (fractions of w/h) */
  | (Base & { kind: "drop"; corner: "tl" | "tr" | "bl" | "br"; hole?: { cx: number; cy: number; rx: number; ry: number } });

/** Design canvas the coordinates live in */
export const WALL = { width: 1920, height: 938 } as const;

export const shapeWall: WallShape[] = [
  // ── top row ──────────────────────────────────────────
  { id: "indigo-block", kind: "rect", x: 0, y: 0, w: 315, h: 322, color: "indigo" },
  { id: "indigo-wedge", kind: "triangle", corner: "br", x: 196, y: 227, w: 256, h: 230, color: "indigo" },

  { id: "azure-1", group: "azure-stripes", kind: "rect", x: 484, y: 0, w: 454, h: 130, color: "azure" },
  { id: "azure-2", group: "azure-stripes", kind: "rect", x: 484, y: 162, w: 454, h: 130, color: "azure" },
  { id: "azure-3", group: "azure-stripes", kind: "rect", x: 484, y: 324, w: 454, h: 130, color: "azure" },

  { id: "peri-1", group: "periwinkle-comb", kind: "rect", x: 974, y: 0, w: 130, h: 292, color: "periwinkle" },
  { id: "peri-2", group: "periwinkle-comb", kind: "rect", x: 1136, y: 0, w: 130, h: 292, color: "periwinkle" },
  { id: "peri-3", group: "periwinkle-comb", kind: "rect", x: 1298, y: 0, w: 130, h: 292, color: "periwinkle" },
  { id: "peri-base", group: "periwinkle-comb", kind: "rect", x: 970, y: 324, w: 458, h: 130, color: "periwinkle" },

  {
    id: "violet-drop", kind: "drop", corner: "bl", x: 1460, y: 3, w: 460, h: 454, color: "violet",
    hole: { cx: 0.5, cy: 0.493, rx: 0.168, ry: 0.152 },
  },

  // ── bottom row ───────────────────────────────────────
  { id: "olive-block", kind: "rect", x: 0, y: 490, w: 452, h: 440, color: "olive" },

  { id: "stair-1", group: "mustard-stairs", kind: "rect", x: 726, y: 486, w: 216, h: 148, color: "mustard" },
  { id: "stair-2", group: "mustard-stairs", kind: "rect", x: 618, y: 634, w: 216, h: 148, color: "mustard" },
  { id: "stair-3", group: "mustard-stairs", kind: "rect", x: 484, y: 782, w: 216, h: 148, color: "mustard" },

  { id: "rose-block", kind: "rect", x: 970, y: 486, w: 458, h: 232, color: "rose" },
  { id: "rose-dot", kind: "circle", x: 1278, y: 780, w: 163, h: 158, color: "rose" },

  { id: "magenta-small", kind: "triangle", corner: "tl", x: 1460, y: 490, w: 244, h: 228, color: "magenta" },
  { id: "magenta-big", kind: "triangle", corner: "br", x: 1479, y: 527, w: 441, h: 411, color: "magenta" },
];
