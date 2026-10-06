import { ShapeMosaic } from "@/components/ShapeMosaic";
import { WALL_MOBILE, shapeWallMobile } from "@/content/shapeWall";
import { SectionHeading } from "@/components/ui";
import type { ReactNode } from "react";

/** Section 2 — Figma 51:1001 "ללמוד את המקצוע כמו שהוא נראה היום" */
const BODY = "כש-AI מייצר מסכים בדקות, מעצבים נמדדים על ההחלטות שלהם, ונדרשים להיכנס לעולמות שפעם לא היו חלק מהתפקיד: מוצר, עסקים, מספרים, קוד ופרזנטציה.";

export function LearnSection({ title = "המקצוע השתנה.", body = BODY }: { title?: string; body?: ReactNode } = {}) {
  return (
    <section className="surface surface--blue overflow-hidden">
      {/* Full-bleed wall, edge to edge like the frame — four shapes a row, two on mobile */}
      <ShapeMosaic mode="paint" className="max-md:hidden" />
      <ShapeMosaic mode="paint" shapes={shapeWallMobile} wall={WALL_MOBILE} className="md:hidden" />

      {/* Figma: text block 801 wide, right edge on column 3, 87px under the wall, 247px bottom */}
      <div className="page-container pt-[clamp(40px,4.5vw,87px)] pb-[clamp(72px,12.9vw,247px)]">
        <div className="grid-12">
          <div className="col-start-3 col-span-6 max-w-[801px] max-xl:col-start-1 max-xl:col-span-full">
            <SectionHeading
              tone="dark"
              title={title}
              body={body}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
