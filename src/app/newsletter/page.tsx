import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";
import { NewsletterForm } from "./NewsletterForm";
import { PixelBand } from "./PixelBand";
import { GrainBackground } from "./GrainBackground";
import styles from "./newsletter.module.css";

export const metadata: Metadata = {
  title: "else — הבית למעצבי העל של העולם החדש",
  description: "ניוזלטר שבועי על תהליכי עיצוב, AI וקריירה. הצטרפו לרשימת המעצבים של העולם החדש.",
  openGraph: {
    title: "else — הבית למעצבי העל של העולם החדש",
    description: "ניוזלטר שבועי על תהליכי עיצוב, AI וקריירה.",
    locale: "he_IL",
    type: "website",
  },
};

/* the four light-rays, at the angles the Figma dashes actually read as on screen
   (the asset's dashes run along its own 30.7° diagonal, so the visible angles are
   ≈ horizontal, vertical and two ±46° diagonals — not the raw layer rotations).
   Each ray carries 1–2 blurred orbs gliding back and forth along the line. */
type Orb = { dur: string; delay: string; from: string; to: string; tw: string; twDelay: string };
const RAYS: { transform: string; orbs: Orb[] }[] = [
  {
    // ≈ horizontal (-180.08°) — travel in vw so it always stays within ±50vw
    transform: "translate(-50%, -50%) rotate(-180.08deg)",
    orbs: [
      { dur: "38s", delay: "0s", from: "26vw", to: "45vw", tw: "5s", twDelay: "0s" },
      { dur: "30s", delay: "-12s", from: "-26vw", to: "-45vw", tw: "4s", twDelay: "-1.5s" },
    ],
  },
  {
    // ≈ vertical (-90.04°) — travel in vh so it always stays within ±50vh
    transform: "translate(-50%, -50%) rotate(-90.04deg)",
    orbs: [{ dur: "34s", delay: "-8s", from: "24vh", to: "44vh", tw: "5.5s", twDelay: "-2s" }],
  },
  {
    // diagonal (-45.99°) — travel in vmin so it stays on screen on any aspect
    transform: "translate(-50%, -50%) rotate(-45.99deg)",
    orbs: [
      { dur: "44s", delay: "-20s", from: "28vmin", to: "46vmin", tw: "6s", twDelay: "-0.5s" },
      { dur: "28s", delay: "-5s", from: "-26vmin", to: "-44vmin", tw: "3.5s", twDelay: "-3s" },
    ],
  },
  {
    // the other diagonal (-134.01°)
    transform: "translate(-50%, -50%) rotate(-134.01deg)",
    orbs: [{ dur: "40s", delay: "-15s", from: "-28vmin", to: "-46vmin", tw: "4.8s", twDelay: "-1s" }],
  },
];

export default function NewsletterPage() {
  return (
    <main className={styles.page}>
      <div className={styles.bg} aria-hidden>
        <GrainBackground />

        <div className={styles.flare}>
          {RAYS.map((ray, i) => (
            <div key={i} className={styles.ray} style={{ transform: ray.transform }}>
              {ray.orbs.map((orb, j) => (
                <img
                  key={j}
                  className={styles.orb}
                  src={asset("/assets/newsletter/dot.svg")}
                  alt=""
                  style={
                    {
                      "--orb-dur": orb.dur,
                      "--orb-delay": orb.delay,
                      "--orb-from": orb.from,
                      "--orb-to": orb.to,
                      "--orb-twinkle": orb.tw,
                      "--orb-twinkle-delay": orb.twDelay,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          ))}
          <img className={styles.star} src={asset("/assets/newsletter/star.svg")} alt="" />
        </div>

        <PixelBand />
      </div>

      <div className={styles.inner}>
        <div className={styles.brand}>
          <img
            className={styles.logo}
            src={asset("/assets/newsletter/logo-white.png")}
            alt="else — by hani buskila"
            width={300}
            height={131}
          />
          <h1 className={styles.heading}>הבית למעצבי העל של העולם החדש</h1>
        </div>

        <p className={styles.intro}>
          הצטרפו לניוזלטר שבועי
          <br />
          על תהליכי עיצוב, AI וקריירה
        </p>

        <NewsletterForm />
      </div>
    </main>
  );
}
