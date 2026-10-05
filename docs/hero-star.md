# Hero star — where we are (still needs love)

The blurred star behind "Learn UI/UX in a new way" (section 1). Code: `.shape-star`
in `src/styles/shapes.css`, `BlurStar` in `src/components/Shape.tsx`, words in
`src/components/sections/Hero.tsx`.

## What it is now (live)

- Rests in the **original Figma pose**: 8 rays from one hub, long right, down-right
  and down. Those, and the left ray, **never move**.
- Only **4 rays move** — ↑ ↗ ↙ ↖, clockwise from the top. One at a time reaches out to
  `--star-reach` (40.5% of the box) and returns. 1.7s per step.
- **8 words** ride the tip of the ray that's out, two per moving ray per lap:
  build · think product · decide · validate · own · sell · present · learn.
  Each word is written pixel by pixel (Minecraft font, 24px), left to right, and
  erased the same way as its ray shrinks back.
- Words are locked to the rays' clock (`PixelWord.tsx`), so a slow font load can't
  put a word on the wrong ray.

## What we tried, and what Hani thought

| Version | Idea | Verdict |
|---|---|---|
| 1 | One "tail" passes clockwise round all 8 rays; every ray re-sizes each step to a length profile around the tail | OK, but the whole star wobbles — "the star changes its place" |
| 2 | Whole star rotates 30° per tick (from 5 reference poses) | ❌ "don't turn the star" |
| 3 | All rays rest at one equal length; only the outgoing + incoming rays move | ❌ stable, but a symmetric asterisk — "not like the logo" |
| 4 | Rest in the **logo's** geometry (angles + per-ray lengths from `logo.svg`, long ray left) | ❌ reverted ("no no") |
| 5 | **Fixed Figma pose, only ↑ ↗ ↙ ↖ move** (Hani's sketch) | ✅ live — "it's nice" |
| 6 | v5 + the opposite end of each line shortens as a ray grows (line slides through the hub) | ❌ "looks terrible" — reverted |

Also along the way (kept): 15% faster (2s → 1.7s per step), long ray shortened twice
(50% → 45% → 40.5% of the box), long ray made clearly longer than its neighbours so
the word reads as sitting on it, 8 words instead of 4, pixel-by-pixel writing.
Tried and dropped: scattered (random-order) pixel writing.

## Open problem

Hani: "you should shorten rays in coloration so it will be calculated properly —
that's the reason we made only the rays that look good". v6 was my first reading
and it was wrong. Not yet confirmed what she meant. Leading guess:

**Growth isn't proportional.** Every moving ray grows to the same fixed 40.5%,
whatever its resting length — so ↗ (33.5% at rest) barely moves while ↖ (21%) and
↙ (20%) nearly double. Proposed fix: each moving ray grows by the same share of its
*own* length (e.g. +40%), so the star keeps its character; words then sit at each
ray's own tip instead of one shared reach.

Ask Hani to confirm, ideally pointing at the moment it looks wrong ("when ↖ comes out").

## Knobs (`.shape-star` in shapes.css)

- `--star-step` time per step · `--star-reach` how far a moving ray reaches
- per-ray resting pose: `--rest` (length) and `--op` (brightness) on each `nth-child`
- `--star-thickness`, `--star-blur`, `--star-opacity` look · `--star-write` word writing time
- word list: `labels` in `Hero.tsx` (8 words = 2 per moving ray)

Lessons: verify on the **blurred** star, not the unblurred debug view — what reads as
"longest" changes once the blur is on. And measure ray lengths/words per step on the
page (freeze animations at `step × 1700 + 600ms`) rather than eyeballing a screenshot.
