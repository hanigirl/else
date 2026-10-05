import { Hero } from "@/components/sections/Hero";
import { LearnSection } from "@/components/sections/LearnSection";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <LearnSection />
      {/* one light grained surface from the logos down: #FEFEFE → #E5E7F3 */}
      <div className="surface surface--light">
        <LogoStrip />
        <ContactSection />
      </div>
    </main>
  );
}
