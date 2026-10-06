import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { LearnSection } from "@/components/sections/LearnSection";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { ContactSection } from "@/components/sections/ContactSection";
import { LinkButton } from "@/components/test/LinkButton";
import {
  AboutSection,
  AudienceSection,
  FaqSection,
  FinalSection,
  IncludedSection,
  JournalSection,
  MethodSection,
  OfferSection,
  OutcomesSection,
  PainSection,
  ShiftSection,
} from "@/components/test/Sections";
import { hero, intro } from "@/content/learnTest";

/** The long-form course page — a test, kept out of search until it replaces the live page */
export const metadata: Metadata = {
  title: "else — UI/UX בדרך החדשה (test)",
  robots: { index: false, follow: false },
};

export default function LearnTest() {
  return (
    <main className="lp">
      <Hero
        footer={
          <div className="flex flex-col items-start gap-4">
            <p className="type-item text-white">{hero.title}</p>
            <LinkButton href="#fit-call" variant="ghost">{hero.cta}</LinkButton>
          </div>
        }
      />
      <LearnSection title={intro.title} body={intro.body} />
      <div className="surface surface--light">
        <LogoStrip />
      </div>
      <PainSection />
      <ShiftSection />
      <MethodSection />
      <JournalSection />
      <AudienceSection />
      <AboutSection />
      <IncludedSection />
      <OutcomesSection />
      <FaqSection />
      <OfferSection />
      <FinalSection />
      <div className="surface surface--light">
        <ContactSection />
      </div>
    </main>
  );
}
