import { Logo } from "@/components/ui";
import type { ReactNode } from "react";

/** WhatsApp chat with Hani, message pre-filled */
const WHATSAPP = "972524493253"; // 052-449-3253
const whatsapp = (message: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

/** Footer link targets */
const SOCIAL = {
  instagram: "https://www.instagram.com/hani.buskila/",
  facebook: "https://www.facebook.com/profile.php?id=61573253889342",
  linkedin: "https://www.linkedin.com/in/hani-buskila-24780028/",
  youtube: "https://www.youtube.com/@hanibuskila",
  newsletter: "https://www.uxtra.co.il",
  figmaFlow: "https://uxtra.co.il/courses/figma-flow",
  designToCode: "https://uxtra.co.il/workshops/design-to-code",
  figmaWorkshop: whatsapp("הי חני, הגעתי מהאתר שלך אני מתעניינ/ת בסדנת פיגמה לחברה"),
  privacy: "https://uxtra.co.il/privacy",
  terms: "https://uxtra.co.il/terms-and-conditions",
  aiWorkshop: whatsapp("הי חני, הגעתי מהאתר שלך אני מתעניינ/ת בסדנת AI לחברה"),
};

/** A footer link: ink at rest, indigo + underline on hover. External ones open in a new tab. */
function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="underline-offset-4 transition-colors hover:text-indigo hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo"
    >
      {children}
    </a>
  );
}

/** Footer — bottom of Figma 51:1035 */
const columns: { title: string; gap: string; items: ReactNode[] }[] = [
  {
    title: "קורסים וסדנאות",
    gap: "gap-[14px]",
    items: [
      <FooterLink key="ff" href={SOCIAL.figmaFlow}><span lang="en" className="type-en-caption">Figma Flow</span></FooterLink>,
      <FooterLink key="d2c" href={SOCIAL.designToCode}><span lang="en" className="type-en-caption">Design to code</span></FooterLink>,
      <FooterLink key="fw" href={SOCIAL.figmaWorkshop}>סדנאות פיגמה לארגונים</FooterLink>,
      <FooterLink key="aw" href={SOCIAL.aiWorkshop}>סדנאות AI לארגונים</FooterLink>,
    ],
  },
  {
    title: "תוכן חינמי",
    gap: "gap-[10px]",
    items: [
      <FooterLink key="nl" href={SOCIAL.newsletter}>ניוזלטר שבועי</FooterLink>,
      <FooterLink key="yt" href={SOCIAL.youtube}>הדרכות יוטיוב</FooterLink>,
      <span key="files" className="inline-flex items-center gap-1">
        קבצים חינמיים
        <span className="type-micro inline-flex rounded-sm border border-ink px-1 py-0.5 font-medium">בקרוב</span>
      </span>,
    ],
  },
  {
    title: "עקבו אחריי",
    gap: "gap-[10px]",
    items: [
      <FooterLink key="ig" href={SOCIAL.instagram}>אינסטגרם</FooterLink>,
      <FooterLink key="fb" href={SOCIAL.facebook}>פייסבוק</FooterLink>,
      <FooterLink key="li" href={SOCIAL.linkedin}>לינקדאין</FooterLink>,
      <FooterLink key="yt" href={SOCIAL.youtube}>יוטיוב</FooterLink>,
    ],
  },
  {
    title: "מידע משפטי",
    gap: "gap-[10px]",
    items: [
      <FooterLink key="terms" href={SOCIAL.terms}>תקנון</FooterLink>,
      <FooterLink key="privacy" href={SOCIAL.privacy}>מדיניות פרטיות</FooterLink>,
      "מדיניות ביטולים",
      "הצהרת נגישות",
    ],
  },
];

export function Footer() {
  return (
    <footer className="page-container">
      {/* Figma: 4 link columns from the right, logo on the far left */}
      <div className="flex flex-wrap items-start justify-between gap-y-12 pt-[clamp(56px,5.4vw,104px)]">
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title} className="flex flex-col gap-[19px] max-md:basis-1/2">
            <h3 className="type-caption-strong">{c.title}</h3>
            <ul className={`type-caption flex flex-col ${c.gap}`}>
              {c.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="max-md:order-first max-md:basis-full">
          {/* same size as the header logo: the star mark is 28.7px tall in both */}
          <Logo variant="brand" className="h-[28.7px] w-auto" />
        </div>
      </div>

      {/* Bottom line — tagline left, legal right (Figma physical sides) */}
      <div dir="ltr" className="flex flex-wrap items-center justify-between gap-4 pt-[clamp(40px,3.65vw,70px)] pb-[clamp(40px,3.8vw,73px)]">
        <p lang="en" className="type-tagline text-ink">AI can make anything. We make something else</p>
        <p dir="rtl" className="type-micro flex items-center gap-1">
          <span>חני בוסקילה</span>
          <span aria-hidden className="size-[3px] rounded-full bg-ink" />
          <span>כל הזכויות שמורות</span>
          <span aria-hidden className="size-[3px] rounded-full bg-ink" />
          <span>2026</span>
        </p>
      </div>
    </footer>
  );
}
