import { ShapeMosaic } from "@/components/ShapeMosaic";
import { SectionHeading } from "@/components/ui";

/** Section 2 — Figma 51:1001 "ללמוד את המקצוע כמו שהוא נראה היום" */
export function LearnSection() {
  return (
    <section className="surface surface--blue overflow-hidden">
      {/* Full-bleed wall, edge to edge like the frame */}
      <ShapeMosaic mode="paint" />

      {/* Figma: text block 801 wide, right edge on column 3, 87px under the wall, 247px bottom */}
      <div className="page-container pt-[clamp(40px,4.5vw,87px)] pb-[clamp(72px,12.9vw,247px)]">
        <div className="grid-12">
          <div className="col-start-3 col-span-6 max-w-[801px] max-xl:col-start-1 max-xl:col-span-full">
            <SectionHeading
              tone="dark"
              title="ללמוד את המקצוע כמו שהוא נראה היום"
              body="כש-AI מייצר מסכים בדקות, מעצבים נמדדים על ההחלטות שלהם, ונדרשים להיכנס לעולמות שפעם לא היו חלק מהתפקיד: מוצר, עסקים, מספרים, קוד ופרזנטציה."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
