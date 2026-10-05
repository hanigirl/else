/**
 * Indigo pixel clusters around the portrait (Figma 52:1209).
 * Figma frame coordinates (section 51:1035, 1920 wide). The component converts
 * them to percentages of the photo, so they scale with it. `group` = the Figma
 * group each pixel belongs to, for animating clusters later.
 */
export const PORTRAIT = { x: 77.08, y: 47.02, w: 687.075, h: 877.983 } as const;

export type Pixel = { x: number; y: number; w: number; h: number; group: string };

const p = (group: string, x: number, y: number, w: number, h: number): Pixel => ({ group, x, y, w, h });

export const portraitPixels: Pixel[] = [
  // top-left cluster
  p("top-left", 77.08, 131.25, 80.993, 38.877),
  p("top-left", 119.2, 170.13, 38.877, 43.197),
  p("top-left", 158.07, 89.13, 38.877, 43.197),
  p("top-left", 268.22, 89.13, 43.197, 38.877),
  p("top-left", 120.28, 47.02, 38.877, 43.197),
  p("top-left", 310.34, 48.1, 90.712, 38.877),
  p("top-left", 158.07, 191.73, 38.877, 43.197),
  p("top-left", 77.08, 209.0, 42.117, 43.197),
  // top-right cluster
  p("top-right", 682.91, 266.24, 80.993, 38.877),
  p("top-right", 682.91, 85.89, 80.993, 38.877),
  p("top-right", 725.02, 113.97, 38.877, 80.993),
  p("top-right", 645.11, 47.02, 38.877, 43.197),
  p("top-right", 682.91, 227.36, 38.877, 43.197),
  // bottom-left
  p("bottom-left", 77.08, 724.4, 80.433, 38.763),
  p("bottom-left", 80.32, 886.11, 80.993, 38.877),
  p("bottom-left", 120.28, 847.23, 80.993, 38.877),
  // bottom-middle
  p("bottom-mid", 249.86, 765.16, 80.993, 38.877),
  p("bottom-mid", 291.98, 804.03, 38.877, 43.197),
  p("bottom-mid", 330.86, 825.63, 38.877, 43.197),
  p("bottom-mid", 253.1, 842.91, 38.877, 43.197),
  p("bottom-mid", 401.72, 881.39, 37.795, 43.609),
  // bottom-centre (two linked clusters)
  p("bottom-centre", 494.46, 683.62, 38.877, 80.993),
  p("bottom-centre", 451.27, 725.74, 43.197, 38.877),
  p("bottom-centre", 429.67, 764.62, 43.197, 38.877),
  p("bottom-centre", 412.39, 686.86, 43.197, 38.877),
  p("bottom-centre", 572.23, 761.22, 38.877, 80.993),
  p("bottom-centre", 529.04, 803.34, 43.197, 38.877),
  p("bottom-centre", 507.44, 842.22, 43.197, 38.877),
  p("bottom-centre", 490.16, 764.46, 43.197, 38.877),
  // bottom-right
  p("bottom-right", 675.35, 666.88, 80.993, 38.877),
  p("bottom-right", 682.91, 847.23, 80.993, 38.877),
  p("bottom-right", 683.99, 777.03, 38.877, 80.993),
  p("bottom-right", 732.58, 881.79, 38.877, 43.197),
  p("bottom-right", 725.02, 701.44, 38.877, 43.197),
];
