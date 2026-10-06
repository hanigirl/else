import { Portrait } from "@/components/Portrait";
import { MetaList, SectionHeading } from "@/components/ui";
import { FitCallForm } from "./FitCallForm";

/** Section 4 — Figma 51:1035 "מתחילים בשיחת התאמה": form + portrait */

export function FitCallSection() {
  return (
    <div id="fit-call" className="page-container scroll-mt-6 pt-[clamp(40px,2.45vw,47px)]">
      <div className="grid-12 gap-y-14">
        {/* Form — right side (RTL start), 5 columns */}
        <div className="col-span-5 pt-[clamp(0px,3.2vw,61px)] max-xl:col-span-full">
          {/* Figma 52:1285 — blocks 50px apart. Once sent, the form swaps all of this for the success message */}
          <FitCallForm
            heading={
              <div className="flex flex-col gap-[7px]">
                <SectionHeading
                  title="מתחילים בשיחת יעוץ והתאמה"
                  body={<>נבין יחד איפה אתם היום, ננתח את המצב הקיים (הניסיון, התיק והמטרות),<br className="max-md:hidden" /> ונראה מה הצעד הבא בשבילכם.</>}
                />
                <div className="-ms-2.5">
                  <MetaList items={["20 דקות", "יעוץ בחינם", "בלי התחייבות"]} />
                </div>
              </div>
            }
          />
        </div>

        {/* Portrait — left side, last 5 columns */}
        <div className="col-span-5 col-start-8 max-xl:col-span-full max-xl:col-start-1">
          <Portrait className="ms-auto w-full max-w-[687px]" />
        </div>
      </div>
    </div>
  );
}
