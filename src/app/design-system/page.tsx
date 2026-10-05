import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GridOverlay } from "@/components/GridOverlay";
import { Shape, ShapeBars, ShapePixels, ShapeSteps } from "@/components/Shape";
import { ShapeMosaic } from "@/components/ShapeMosaic";
import { Button, Checkbox, ChoiceChip, Chip, Divider, Logo, MetaList, SectionHeading, SignatureLabel, TextField } from "@/components/ui";

export const metadata: Metadata = { title: "else — מערכת עיצוב" };

/* ---------- data ---------- */

const colors: { group: string; items: { token: string; hex: string; use: string; dark?: boolean }[] }[] = [
  {
    group: "מותג",
    items: [
      { token: "indigo", hex: "#5651ED", use: "קישורים ופעולות בלבד, פיקסלים" },
      { token: "brand-blue", hex: "#284CDE", use: "לוגו בפוטר" },
      { token: "navy", hex: "#1A237E", use: "רקע כחול — התחלה" },
      { token: "cobalt", hex: "#4A7AF7", use: "רקע כחול — סוף" },
    ],
  },
  {
    group: "צורות",
    items: [
      { token: "azure", hex: "#0D81E0", use: "פסים אופקיים" },
      { token: "periwinkle", hex: "#98B5FB", use: "פסים אנכיים", dark: true },
      { token: "violet", hex: "#7258DA", use: "טיפה" },
      { token: "olive", hex: "#B8B326", use: "ריבוע" },
      { token: "mustard", hex: "#DAB158", use: "מדרגות", dark: true },
      { token: "rose", hex: "#F5859C", use: "מלבן, עיגול", dark: true },
      { token: "magenta", hex: "#FB60BD", use: "משולשים" },
    ],
  },
  {
    group: "ניטרליים",
    items: [
      { token: "ink", hex: "#383845", use: "כל הטקסט על בהיר — כולל כותרות" },
      { token: "white", hex: "#FFFFFF", use: "טקסט על כחול", dark: true },
      { token: "mist", hex: "#EFF2FC", use: "בסיס פס הלוגואים", dark: true },
      { token: "haze", hex: "#E5E7F3", use: "רקע בהיר — התחלה", dark: true },
      { token: "hover", hex: "#E1E1EB", use: "ריחוף על תוויות וצ׳יפים", dark: true },
    ],
  },
  {
    group: "מצבים",
    items: [
      { token: "error", hex: "#D92D2D", use: "הודעות שגיאה ומסגרת שדה לא תקין" },
    ],
  },
];

const typeStyles: { cls: string; spec: string; sample: string; en?: boolean }[] = [
  { cls: "type-display", spec: "Clash Display 500 · 120 · lh 1.2", sample: "Learn UI/UX in a new way", en: true },
  { cls: "type-logo", spec: "Clash Display 500 · 36.7", sample: "else", en: true },
  { cls: "type-pixel", spec: "Minecraft 400 · 48 · ls 2%", sample: "build", en: true },
  { cls: "type-label", spec: "Clash Display 400 · 18 · ls 8%", sample: "hani.buskila", en: true },
  { cls: "type-tagline", spec: "Clash Display 500 · 20", sample: "AI can make anything. We make something else", en: true },
  { cls: "type-en-caption", spec: "Clash Display 400 · 12 · ls 2%", sample: "Figma Flow · Design to code", en: true },
  { cls: "type-h2", spec: "Noto Sans Hebrew 800 · 32 · lh 1.1", sample: "ללמוד את המקצוע כמו שהוא נראה היום" },
  { cls: "type-p", spec: "Noto Sans Hebrew 500 · 16 · lh 1.5 — paragraphs", sample: "כש-AI מייצר מסכים בדקות, מעצבים נמדדים על ההחלטות שלהם." },
  { cls: "type-lead", spec: "Noto Sans Hebrew 500 · 16 · lh 1.4 — field labels", sample: "נבין יחד איפה אתם היום, ננתח את המצב הקיים ונראה מה הצעד הבא." },
  { cls: "type-chip", spec: "Noto Sans Hebrew 500 · 16 · lh 1.4", sample: "מעצב/ת שרוצה להתקדם" },
  { cls: "type-body", spec: "Noto Sans Hebrew 400 · 16 · lh 1.4", sample: "אני מאשר/ת שיחזרו אליי לתיאום השיחה." },
  { cls: "type-small", spec: "Noto Sans Hebrew 400 · 14 · lh 1.4 — small text", sample: "אני מאשר/ת שיחזרו אליי לתיאום השיחה." },
  { cls: "type-caption-strong", spec: "Noto Sans Hebrew 700 · 12 · lh 1.4", sample: "קורסים וסדנאות" },
  { cls: "type-caption", spec: "Noto Sans Hebrew 400 · 12 · lh 1.4", sample: "מדיניות פרטיות" },
  { cls: "type-micro", spec: "Noto Sans Hebrew 400 · 10 · lh 1.4", sample: "2026 • כל הזכויות שמורות • חני בוסקילה" },
];

const pixelSample = [
  { c: 2, r: 1 }, { c: 7, r: 1, cs: 2 }, { c: 3, r: 2 }, { c: 1, r: 3, cs: 2 },
  { c: 6, r: 3 }, { c: 2, r: 4 }, { c: 3, r: 5 }, { c: 1, r: 5 },
];

/* ---------- layout helpers ---------- */

function Section({ id, title, en, children }: { id: string; title: string; en: string; children: ReactNode }) {
  return (
    <section id={id} className="page-container py-24">
      <header className="mb-12 flex items-baseline justify-between gap-6">
        <h2 className="type-h2 text-ink">{title}</h2>
        <span lang="en" className="type-label text-ink/50">{en}</span>
      </header>
      {children}
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code dir="ltr" lang="en" className="block rounded-sm bg-ink/5 px-3 py-2 text-left font-mono text-[12px] leading-relaxed text-ink">
      {children}
    </code>
  );
}

function ShapeCard({ name, en, code, children }: { name: string; en: string; code: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid h-[260px] place-items-center rounded-sm bg-white/70">{children}</div>
      <div className="flex items-baseline justify-between">
        <span className="type-caption-strong">{name}</span>
        <span lang="en" dir="ltr" className="type-en-caption text-ink/60">{en}</span>
      </div>
      <Code>{code}</Code>
    </div>
  );
}

/* ---------- page ---------- */

export default function DesignSystemPage() {
  return (
    <main>
      <GridOverlay />

      {/* Cover — built from the system itself */}
      <header className="surface surface--blue relative overflow-hidden">
        <div className="page-container flex min-h-[560px] flex-col justify-between py-20">
          <div className="flex items-start justify-between">
            <SignatureLabel>hani.buskila</SignatureLabel>
            <Logo />
          </div>
          <div className="flex flex-col gap-6">
            <p lang="en" dir="ltr" className="type-display text-left">Design system</p>
            <p className="type-p max-w-[801px]">
              צבעים, טיפוגרפיה, גריד, רקעים וצורות — הכול מגיע מקובץ הפיגמה. לחצו <b lang="en">G</b> כדי לראות את הגריד.
            </p>
          </div>
          <span lang="en" className="type-pixel self-end">build</span>
        </div>
      </header>

      <div className="surface surface--paper">
        {/* ---------- Colours ---------- */}
        <Section id="colors" title="צבעים" en="Colours">
          <div className="flex flex-col gap-14">
            {colors.map((g) => (
              <div key={g.group} className="grid-12 gap-y-8">
                <h3 className="type-caption-strong col-span-full">{g.group}</h3>
                {g.items.map((c) => (
                  <div key={c.token} className="col-span-2 flex flex-col gap-3 max-md:col-span-2">
                    <div
                      className="aspect-[4/3] rounded-sm"
                      style={{ background: `var(--color-${c.token})`, boxShadow: c.dark ? "inset 0 0 0 1px var(--line-on-light)" : undefined }}
                    />
                    <div className="flex items-baseline justify-between gap-2">
                      <span lang="en" dir="ltr" className="type-en-caption font-medium">{c.token}</span>
                      <span lang="en" dir="ltr" className="type-en-caption text-ink/60">{c.hex}</span>
                    </div>
                    <span className="type-caption text-ink/70">{c.use}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ---------- Surfaces ---------- */}
        <Section id="surfaces" title="רקעים" en="Surfaces">
          <div className="grid-12 gap-y-8">
            {[
              { cls: "surface--blue", name: "כחול", use: "Hero · ללמוד את המקצוע", grad: "navy → cobalt · 90°" },
              { cls: "surface--mist", name: "ערפל", use: "פס הלוגואים", grad: "haze → white · 163°" },
              { cls: "surface--light", name: "בהיר", use: "לוגואים → טופס → פוטר", grad: "snow → haze · 180°" },
            ].map((s) => (
              <div key={s.cls} className="col-span-4 flex flex-col gap-3 max-xl:col-span-full">
                <div className={`surface ${s.cls} h-[280px] rounded-sm`} style={{ boxShadow: "inset 0 0 0 1px var(--line-on-light)" }} />
                <div className="flex items-baseline justify-between">
                  <span className="type-caption-strong">{s.name} — {s.use}</span>
                  <span lang="en" dir="ltr" className="type-en-caption text-ink/60">.{s.cls} · {s.grad}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-[801px]">
            <Code>{`.surface { --surface-angle; --surface-from; --surface-to; --grain-opacity; --grain-size }`}</Code>
          </div>
        </Section>

        <Divider />

        {/* ---------- Typography ---------- */}
        <Section id="type" title="טיפוגרפיה" en="Typography">
          <p className="type-p mb-10 max-w-[801px]">
            עברית ב-<span lang="en">Noto Sans Hebrew</span>, אנגלית ב-<span lang="en">Clash Display</span>.
            כל טקסט עם <code lang="en" dir="ltr">lang=&quot;en&quot;</code> עובר אוטומטית ל-Clash.
          </p>
          <div className="flex flex-col">
            {typeStyles.map((t) => (
              <div key={t.cls} className="grid-12 items-baseline border-t py-6" style={{ borderColor: "var(--line-on-light)" }}>
                <div className="col-span-3 flex flex-col gap-1 max-xl:col-span-full">
                  <span lang="en" dir="ltr" className="type-en-caption font-medium">.{t.cls}</span>
                  <span lang="en" dir="ltr" className="type-en-caption text-ink/60">{t.spec}</span>
                </div>
                <p
                  className={`${t.cls} col-span-9 max-xl:col-span-full ${t.cls === "type-pixel" ? "text-indigo" : ""}`}
                  {...(t.en ? { lang: "en", dir: "ltr", style: { textAlign: "right" } } : {})}
                >
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ---------- Grid ---------- */}
        <Section id="grid" title="גריד" en="Layout grid">
          <div className="grid-12 mb-8 h-[180px]">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="grid place-items-center rounded-xs bg-indigo/10 max-xl:[&:nth-child(n+9)]:hidden max-md:[&:nth-child(n+5)]:hidden">
                <span lang="en" dir="ltr" className="type-en-caption text-indigo">{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="grid-12 gap-y-6">
            {[
              ["12", "עמודות", "Desktop ≥ 1280"],
              ["32px", "מרווח בין עמודות", "--grid-gutter"],
              ["72px", "שוליים מהצדדים", "--page-margin"],
              ["8 / 4", "עמודות בטאבלט / מובייל", "40px · 20px margin"],
            ].map(([v, he, en]) => (
              <div key={en} className="col-span-3 flex flex-col gap-1 max-xl:col-span-4">
                <span lang="en" className="type-tagline text-ink">{v}</span>
                <span className="type-caption-strong">{he}</span>
                <span lang="en" dir="ltr" className="type-en-caption text-ink/60">{en}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-[801px]">
            <Code>{`<div class="page-container"><div class="grid-12"> … col-span-* … </div></div>`}</Code>
          </div>
        </Section>

        <Divider />

        {/* ---------- Shapes ---------- */}
        <Section id="shapes" title="צורות" en="Shapes">
          <p className="type-p mb-10 max-w-[801px]">
            כל הצורות הן CSS טהור. משנים משתנה — הצורה משתנה, עם אנימציה מובנית. ככה נחבר אליהן את האינטראקציות בשלב הבא.
          </p>
          <div className="grid-12 gap-y-14">
            <div className="col-span-3 max-xl:col-span-4 max-md:col-span-full">
              <ShapeCard name="מלבן" en=".shape--rect" code="--shape-w · --shape-h · --shape-color · --shape-rotate">
                <Shape color="olive" w={180} h={170} />
              </ShapeCard>
            </div>
            <div className="col-span-3 max-xl:col-span-4 max-md:col-span-full">
              <ShapeCard name="עיגול" en=".shape--circle" code="--shape-radius: 50%">
                <Shape kind="circle" color="rose" w={163} h={158} />
              </ShapeCard>
            </div>
            <div className="col-span-3 max-xl:col-span-4 max-md:col-span-full">
              <ShapeCard name="משולש" en=".shape--triangle" code=".is-corner-tl | tr | bl  ·  --shape-clip">
                <div className="flex items-end gap-6">
                  <Shape kind="triangle" color="magenta" w={150} h={140} />
                  <Shape kind="triangle" corner="tl" color="magenta" w={110} h={100} />
                </div>
              </ShapeCard>
            </div>
            <div className="col-span-3 max-xl:col-span-4 max-md:col-span-full">
              <ShapeCard name="טיפה" en=".shape--drop" code="--hole-w · --hole-h · --hole-x · --hole-y">
                <Shape kind="drop" color="violet" w={200} h={197} />
              </ShapeCard>
            </div>
            <div className="col-span-3 max-xl:col-span-4 max-md:col-span-full">
              <ShapeCard name="פסים" en=".shape-bars" code="--bars-direction: row | column · --bars-gap">
                <div className="flex items-center gap-6">
                  <ShapeBars color="azure" w={140} h={140} gap={10} />
                  <ShapeBars color="periwinkle" direction="row" w={140} h={90} gap={10} />
                </div>
              </ShapeCard>
            </div>
            <div className="col-span-3 max-xl:col-span-4 max-md:col-span-full">
              <ShapeCard name="מדרגות" en=".shape-steps" code="--step-w · --step-h · --step-x (per step)">
                <ShapeSteps color="mustard" stepW={90} stepH={62} />
              </ShapeCard>
            </div>
            <div className="col-span-3 max-xl:col-span-4 max-md:col-span-full">
              <ShapeCard name="פיקסלים" en=".shape-pixels" code="--pixel · per cell: --c --r --cs --rs">
                <ShapePixels cells={pixelSample} cols={8} rows={5} size={24} />
              </ShapeCard>
            </div>
            <div className="col-span-3 max-xl:col-span-4 max-md:col-span-full">
              <ShapeCard name="סיבוב" en="--shape-rotate" code={`style="--shape-rotate: 45deg"`}>
                <Shape color="indigo" w={120} h={120} rotate={45} />
              </ShapeCard>
            </div>
          </div>

          <h3 className="type-caption-strong mt-20 mb-4">הקיר המלא, בנוי מהצורות (ללמוד את המקצוע)</h3>
        </Section>
      </div>

      <div className="surface surface--blue">
        <div className="pb-8">
          <ShapeMosaic />
        </div>
        <div className="page-container pb-24">
          <div className="grid-12">
            <div className="col-start-2 col-span-7 max-xl:col-span-full">
              <SectionHeading
                tone="dark"
                title="ללמוד את המקצוע כמו שהוא נראה היום"
                body="כש-AI מייצר מסכים בדקות, מעצבים נמדדים על ההחלטות שלהם, ונדרשים להיכנס לעולמות שפעם לא היו חלק מהתפקיד: מוצר, עסקים, מספרים, קוד ופרזנטציה."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Components ---------- */}
      <div className="surface surface--paper">
        <Section id="components" title="רכיבים" en="Components">
          <div className="grid-12 gap-y-16">
            <div className="col-span-6 flex flex-col gap-6 max-xl:col-span-full">
              <h3 className="type-caption-strong">צ׳יפים</h3>
              <MetaList items={["20 דקות", "יעוץ בחינם", "בלי התחייבות"]} />
              <div className="flex flex-wrap gap-4">
                <ChoiceChip name="ds-stage" value="a">רוצה להכנס לתחום</ChoiceChip>
                <ChoiceChip name="ds-stage" value="b">מחפש/ת עבודה בתחום</ChoiceChip>
                <ChoiceChip name="ds-stage" value="c">מעצב/ת שרוצה להתקדם</ChoiceChip>
              </div>
              <span lang="en" dir="ltr" className="type-en-caption text-ink/60">ChoiceChip — picked: secondary (indigo outline) · hover: same as picked</span>
              <div className="flex items-center gap-1">
                <span className="type-caption">קבצים חינמיים</span>
                <Chip variant="tag">בקרוב</Chip>
              </div>
            </div>

            <div className="col-span-6 flex flex-col gap-8 max-xl:col-span-full">
              <h3 className="type-caption-strong">טופס</h3>
              <div className="grid grid-cols-2 gap-x-[21px]">
                <TextField name="name" label="שם מלא" />
                <TextField name="phone" type="tel" label="טלפון" />
              </div>
              <TextField name="email" type="email" label="אימייל" />
              <Checkbox label="אני מאשר/ת שיחזרו אליי לתיאום השיחה, ולקבל מ-else עדכונים במייל ובהודעות." />
              <Checkbox name="ds-consent-error" label="מצב שגיאה — לא סומן" error="חובה לסמן את השדה הזה" />
              <div className="flex flex-wrap items-center gap-4">
                <Button>שליחת טופס</Button>
                <Button variant="secondary">כפתור משני</Button>
                <span lang="en" dir="ltr" className="type-en-caption text-ink/60">Button — primary (filled) · secondary (outline)</span>
              </div>
            </div>

            <div className="col-span-6 flex flex-col gap-6 max-xl:col-span-full">
              <h3 className="type-caption-strong">כותרת סקשן</h3>
              <SectionHeading
                title="מתחילים בשיחת יעוץ והתאמה"
                body="נבין יחד איפה אתם היום, ננתח את המצב הקיים (הניסיון, התיק והמטרות), ונראה מה הצעד הבא בשבילכם."
              />
            </div>

            <div className="col-span-6 flex flex-col gap-6 max-xl:col-span-full">
              <h3 className="type-caption-strong">לוגו</h3>
              <div className="flex flex-wrap items-center gap-8">
                <div className="surface surface--blue rounded-sm px-10 py-8">
                  <Logo />
                </div>
                <Logo variant="brand" />
              </div>
              <p lang="en" dir="ltr" className="type-tagline text-right">AI can make anything. We make something else</p>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
