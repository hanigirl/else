/* eslint-disable @next/next/no-img-element */
import { BlurStar } from "@/components/Shape";
import { Logo, SignatureLabel } from "@/components/ui";
import { asset } from "@/lib/asset";

/** TEST: the shape wall's dot grid behind the hero — right side only, slanted fade. false = off */
const DOT_GRID = true;

/** Section 1 — Figma 51:973 "Learn UI/UX in a new way" */
export function Hero() {
  return (
    <section
      className={[
        "surface surface--blue relative flex min-h-svh flex-col overflow-hidden",
        DOT_GRID && "surface-dots surface-dots--right",
      ].filter(Boolean).join(" ")}
    >
      {/* Top bar — physical sides as in Figma: logo left, signature right */}
      {/* Mobile: just the logo, smaller, centred, 40px from the top */}
      <div className="page-container flex items-start justify-between pt-[clamp(24px,4.17vw,80px)] max-md:justify-center max-md:pt-10" dir="ltr">
        <Logo className="max-md:h-[22px]" />
        <div className="relative flex flex-col items-end max-md:hidden">
          <SignatureLabel>hani.buskila</SignatureLabel>
          <span lang="en" className="type-label absolute right-0 top-[calc(100%+13.5px)] font-medium [writing-mode:vertical-rl]">
            2026
          </span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Stage — headline with the star on it. Figma: headline centre sits 38px above the frame centre */}
      <div className="pointer-events-none absolute inset-0 flex -translate-y-[3.5svh] items-center justify-center px-[var(--page-margin)]">
        <div className="relative">
          <h1 lang="en" dir="ltr" className="type-display relative text-center text-white">
            Learn UI/UX in a new way
          </h1>

          {/* Star hub = Figma's crossing point: −52 / +63 px from the headline centre (box 948 at 1920).
              The pixel word rides the tip of the long ray — one word per ray, clockwise from the right */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[26%] md:translate-x-[-55.5%] md:translate-y-[-43.4%]">
            <BlurStar
              className="[--star-size:58vw] md:[--star-size:clamp(420px,49.4vw,948px)]"
              labels={["build", "think product", "decide", "validate", "own", "sell", "present", "learn"]}
              labelClassName="text-[24px] text-white"
            />
          </div>
        </div>
      </div>

      {/* Bottom — ↙ arrow */}
      {/* the arrow ends 72px above the bottom of the hero (no divider — the hero flows into section 2) */}
      <div className="page-container relative h-[105px]" dir="ltr">
        <div aria-hidden className="absolute bottom-[73px] left-[var(--page-margin)] h-[84px] w-[74px]">
          <div className="absolute left-0 top-[8px] flex h-[76px] w-0 items-center justify-center">
            <img src={asset("/assets/arrow-line-v.svg")} alt="" width={76} height={2} className="max-w-none rotate-90" />
          </div>
          <div className="absolute left-[0.82px] top-0 flex h-[82.52px] w-[73.185px] items-center justify-center">
            <img src={asset("/assets/arrow-line-diag.svg")} alt="" width={110.298} height={2} className="max-w-none rotate-[131.57deg]" />
          </div>
          <img src={asset("/assets/arrow-line-h.svg")} alt="" width={69} height={2} className="absolute left-0 top-[82px] max-w-none" />
        </div>
      </div>
    </section>
  );
}
