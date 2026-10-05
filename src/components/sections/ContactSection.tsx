import { Divider } from "@/components/ui";
import { FitCallSection } from "./FitCallSection";
import { Footer } from "./Footer";

/** Section 4 — Figma 51:1035: the fit-call form + portrait, divider, footer (sits on the shared light surface in page.tsx) */
export function ContactSection() {
  return (
    <section>
      <FitCallSection />
      <div className="pt-[clamp(56px,4.1vw,78px)]">
        <Divider />
      </div>
      <Footer />
    </section>
  );
}
