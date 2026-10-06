/* The long-form course page's own sections (/test). Copy: src/content/learnTest.ts */
import { PixelImage } from "@/components/pixel/PixelImage";
import { PixelShape } from "@/components/pixel/PixelShape";
import { PixelText } from "@/components/pixel/PixelText";
import { PixelWord } from "@/components/PixelWord";
import { about, audience, faq, final, included, journal, method, offer, outcomes, pain, shift } from "@/content/learnTest";
import { asset } from "@/lib/asset";
import { LinkButton } from "./LinkButton";
import { MethodWorlds } from "./MethodWorlds";

/** vertical rhythm: one scale for every section, so the page breathes evenly */
const PAD = "py-[clamp(88px,9vw,176px)]";

/** a small painted square in front of a list line — the page's bullet */
function Bullet({ color = "indigo" }: { color?: "indigo" | "white" | "rose" | "mustard" }) {
  return <span aria-hidden className="mt-[0.55em] size-2.5 shrink-0" style={{ background: color === "white" ? "var(--color-white)" : `var(--color-${color})` }} />;
}

/* ---------- 4 · the pain ---------- */

export function PainSection() {
  return (
    <section className="surface surface--night surface-dots on-dark overflow-hidden">
      <div className={`page-container ${PAD}`}>
        <PixelText text={pain.punch} className="type-punch text-white" ghost={0.22} />
        <div className="mt-[clamp(28px,3vw,48px)] max-w-[52ch]">
          {pain.lines.map((l) => (
            <p key={l} className="type-item text-white/80">{l}</p>
          ))}
        </div>

        <div className="grid-12 mt-[clamp(72px,8vw,150px)] gap-y-8">
          <h2 className="type-h2 col-span-4 text-white max-lg:col-span-full">{pain.listTitle}</h2>
          <ul className="col-span-8 max-lg:col-span-full">
            {pain.list.map((item, i) => (
              <li key={item} className="flex gap-4 border-t border-white/15 py-5 last:border-b">
                <span className="w-5 shrink-0 pt-[0.3em] text-white">
                  <PixelShape kind="rect" color={i === pain.list.length - 1 ? "rose" : "white"} cols={2} speed={160} />
                </span>
                <p className={["type-lead", i === pain.list.length - 1 ? "font-bold text-white" : "text-white/85"].join(" ")}>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[clamp(72px,8vw,150px)] flex flex-col gap-3">
          <p className="type-item text-white/80">{pain.effort[0]}</p>
          <PixelText as="p" text={pain.effort[1]} className="type-statement text-white" ghost={0.22} />
        </div>
      </div>
    </section>
  );
}

/* ---------- 5 · the shift ---------- */

export function ShiftSection() {
  return (
    <section className="surface surface--light">
      <div className={`page-container ${PAD}`}>
        <div className="grid-12">
          <div className="col-span-7 col-start-2 flex flex-col gap-6 max-lg:col-span-full max-lg:col-start-1">
            {shift.paragraphs.map((p, i) => (
              <p key={i} className={["max-w-[64ch]", i === 0 ? "type-item" : "type-p"].join(" ")}>{p}</p>
            ))}
          </div>
        </div>
        <div className="mt-[clamp(64px,7vw,128px)] flex flex-col gap-6">
          <PixelText text={shift.close} className="type-statement text-indigo" ghost={0.12} />
          <p className="type-item max-w-[60ch]">{shift.closeRest}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 6 · the method ---------- */

export function MethodSection() {
  return (
    <section className="surface surface--blue surface-dots on-dark">
      <div className={`page-container ${PAD}`}>
        <div className="grid-12 gap-y-6">
          <h2 className="type-h2 col-span-5 text-white max-lg:col-span-full">{method.title}</h2>
          <div className="col-span-6 col-start-7 flex flex-col gap-4 max-lg:col-span-full max-lg:col-start-1">
            {method.body.map((p, i) => (
              <p key={i} className="type-p text-white/85">{p}</p>
            ))}
          </div>
        </div>
        <MethodWorlds worlds={method.worlds} />
      </div>
    </section>
  );
}

/* ---------- 7 · the decision journal ---------- */

export function JournalSection() {
  return (
    <section className="surface surface--night on-dark overflow-hidden">
      <div className={`page-container ${PAD}`}>
        <div className="grid-12 items-center gap-y-12">
          <div className="col-span-6 flex flex-col gap-5 max-lg:col-span-full">
            <h2 className="type-h2 text-white">{journal.title}</h2>
            <p className="type-p max-w-[58ch] text-white/85">{journal.body}</p>
          </div>
          {/* the journal: lines written in pixels, one decision at a time */}
          <div className="col-span-5 col-start-8 text-white max-lg:col-span-full max-lg:col-start-1 max-lg:max-w-[420px]">
            <PixelShape kind="lines" color="periwinkle" cols={22} rows={11} speed={1400} />
          </div>
        </div>
        <div className="mt-[clamp(64px,7vw,120px)] flex flex-col gap-4 border-t border-white/20 pt-10">
          <PixelText text={journal.portfolioTitle} className="type-statement text-white" ghost={0.22} />
          <p className="type-item max-w-[60ch] text-white/85">{journal.portfolio}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 8 · who it's for ---------- */

export function AudienceSection() {
  return (
    <section className="surface surface--light">
      <div className={`page-container ${PAD}`}>
        <h2 className="type-h2">{audience.title}</h2>
        <ul className="mt-12">
          {audience.fits.map((f) => (
            <li key={f.title} className="grid-12 items-start gap-y-4 border-t border-ink/15 py-8 last:border-b">
              <div className="col-span-1 w-14 text-ink max-lg:col-span-full">
                <PixelShape kind={f.shape} color={f.color} cols={8} />
              </div>
              <h3 className="type-item col-span-4 max-lg:col-span-full">{f.title}</h3>
              <p className="type-p col-span-6 col-start-7 max-w-[60ch] max-lg:col-span-full max-lg:col-start-1">{f.body}</p>
            </li>
          ))}
        </ul>

        <div className="grid-12 mt-[clamp(64px,7vw,120px)] gap-y-6">
          <h2 className="type-h2 col-span-4 max-lg:col-span-full">{audience.notTitle}</h2>
          <ul className="col-span-7 col-start-6 flex flex-col gap-5 max-lg:col-span-full max-lg:col-start-1">
            {audience.nots.map((n) => (
              <li key={n} className="flex gap-4">
                <span className="w-4 shrink-0 pt-[0.35em] text-ink">
                  <PixelShape kind="x" color="ink" cols={5} speed={200} />
                </span>
                <p className="type-lead">{n}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 9 · about Hani ---------- */

export function AboutSection() {
  return (
    <section className="surface surface--mist">
      <div className={`page-container ${PAD}`}>
        <div className="grid-12 gap-y-14">
          <div className="col-span-5 max-lg:col-span-full">
            <div className="lg:sticky lg:top-[10vh]">
              <PixelImage src={asset("/assets/hani-portrait.webp")} alt="חני בוסקילה" width={688} height={878} className="w-full max-w-[560px]">
                {/* indigo pixels holding the photo's corners, as on the form's portrait */}
                <span aria-hidden className="absolute right-0 top-0 h-[5.6%] w-[11.8%] bg-indigo" />
                <span aria-hidden className="absolute right-[11.8%] top-[5.6%] h-[5.6%] w-[5.9%] bg-indigo" />
                <span aria-hidden className="absolute bottom-0 left-0 h-[5.6%] w-[11.8%] bg-indigo" />
                <span aria-hidden className="absolute bottom-[5.6%] left-0 h-[5.6%] w-[5.9%] bg-indigo" />
              </PixelImage>
            </div>
          </div>
          <div className="col-span-6 col-start-7 flex flex-col gap-6 max-lg:col-span-full max-lg:col-start-1">
            <h2 className="type-h2">{about.title}</h2>
            {about.paragraphs.map((p, i) => (
              <p key={i} className={["max-w-[62ch]", i === 0 ? "type-item" : "type-p"].join(" ")}>{p}</p>
            ))}
            <h3 className="type-item mt-4">{about.teachingTitle}</h3>
            <ul className="flex flex-col gap-3">
              {about.teaching.map((t) => (
                <li key={t} className="flex gap-3">
                  <Bullet />
                  <p className="type-p">{t}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3 border-t border-ink/15 pt-6">
              <p className="type-p">{about.close[0]}</p>
              <p className="type-item">{about.close[1]}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 10 · what's included ---------- */

export function IncludedSection() {
  return (
    <section className="surface surface--blue on-dark">
      <div className={`page-container ${PAD}`}>
        <h2 className="type-h2 text-white">{included.title}</h2>
        <ul className="mt-12 grid grid-cols-3 gap-x-[var(--grid-gutter)] max-lg:grid-cols-2 max-md:grid-cols-1">
          {included.items.map((it) => (
            <li key={it.title} className="flex flex-col gap-3 border-t border-white/25 pb-12 pt-6">
              <div className="flex h-12 items-end text-white" dir="ltr">
                {it.n ? (
                  <span className="text-[48px] leading-none"><PixelWord text={it.n} /></span>
                ) : (
                  <span className="w-12"><PixelShape kind="circle" color="white" cols={8} /></span>
                )}
              </div>
              <h3 className="type-item text-white">{it.title}</h3>
              <p className="type-p max-w-[46ch] text-white/80">{it.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 11 · outcomes ---------- */

export function OutcomesSection() {
  return (
    <section className="surface surface--light">
      <div className={`page-container ${PAD}`}>
        <h2 className="type-h2">{outcomes.title}</h2>
        <ul className="mt-12 grid grid-cols-2 gap-x-[var(--grid-gutter)] max-md:grid-cols-1">
          {outcomes.items.map((o) => (
            <li key={o.title} className="flex gap-4 border-t border-ink/15 py-7">
              <Bullet />
              <div className="flex flex-col gap-2">
                <h3 className="type-item">{o.title}</h3>
                <p className="type-p max-w-[54ch]">{o.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-[clamp(64px,7vw,120px)] flex flex-col gap-4">
          <PixelText text={outcomes.close} className="type-statement text-indigo" ghost={0.12} />
          <p className="type-item">{outcomes.closeRest}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 12 · FAQ ---------- */

export function FaqSection() {
  return (
    <section className="surface surface--mist">
      <div className={`page-container ${PAD}`}>
        <div className="grid-12 gap-y-10">
          <h2 className="type-h2 col-span-4 max-lg:col-span-full">
            <span className="lg:sticky lg:top-[14vh]">{faq.title}</span>
          </h2>
          <div className="faq col-span-8 max-lg:col-span-full">
            {faq.items.map((f) => (
              <details key={f.q} className="group border-t border-ink/15 last:border-b">
                <summary className="flex items-center justify-between gap-6 py-6">
                  <span className="type-item">{f.q}</span>
                  <span className="relative w-5 shrink-0 text-ink">
                    <span className="block group-open:hidden"><PixelShape kind="plus" color="ink" cols={5} on /></span>
                    <span className="hidden group-open:block"><PixelShape kind="minus" color="indigo" cols={5} on /></span>
                  </span>
                </summary>
                <p className="type-p max-w-[62ch] pb-7">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 13 · the offer ---------- */

export function OfferSection() {
  return (
    <section className="surface surface--night surface-dots on-dark">
      <div className={`page-container ${PAD}`}>
        <div className="grid-12 gap-y-16">
          <div className="col-span-6 flex flex-col gap-8 max-lg:col-span-full">
            <div className="flex flex-col gap-2">
              <h2 className="type-h2 text-white">{offer.title}</h2>
              <p className="type-lead text-white/80">
                <span lang="en" className="type-tagline">{offer.name}</span> · {offer.starts}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <s className="type-item text-white/50">{offer.was}</s>
              <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[clamp(56px,6vw,112px)] font-[800] leading-none text-white">{offer.price}</span>
                <span className="type-item text-white">{offer.priceNote}</span>
              </p>
              <p className="type-lead mt-2 text-white/80">{offer.payments}</p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="type-item text-white">{offer.includesTitle}</h3>
              <ul className="flex flex-col gap-3">
                {offer.includes.map((i) => (
                  <li key={i} className="flex gap-3">
                    <Bullet color="white" />
                    <p className="type-p text-white/85">{i}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-5 border-t border-white/20 pt-8">
              <h3 className="type-item text-white">{offer.bonusTitle}</h3>
              {offer.bonuses.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <span className="w-8 shrink-0 pt-1 text-white"><PixelShape kind="drop" color="violet" cols={8} /></span>
                  <div className="flex flex-col gap-1">
                    <p className="type-item text-white">{b.title}</p>
                    <p className="type-p max-w-[56ch] text-white/80">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* the seats: 15 pixels, one per place in the room */}
          <div className="col-span-5 col-start-8 max-lg:col-span-full max-lg:col-start-1">
            <div className="lg:sticky lg:top-[14vh] flex flex-col gap-8">
              <div className="w-full max-w-[420px] text-white">
                <PixelShape kind="rect" color="indigo" cols={5} rows={3} speed={1100} style={{ gap: 6 }} />
              </div>
              <PixelText as="p" text={offer.seatsLine} className="type-statement text-white" ghost={0.22} />
              <p className="type-lead text-white/85">{offer.guarantee}</p>
              <div className="flex flex-col gap-3">
                <p className="type-item text-white">{offer.cta}</p>
                <LinkButton href="#fit-call" variant="light" className="self-start max-md:w-full">{offer.ctaButton}</LinkButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 14 · the close ---------- */

export function FinalSection() {
  return (
    <section className="surface surface--blue surface-dots surface-dots--right on-dark">
      <div className={`page-container ${PAD} flex flex-col items-center text-center`}>
        <PixelText text={final.punch} align="center" className="type-punch w-full text-white" ghost={0.22} />
        <div className="mt-[clamp(36px,4vw,64px)] flex max-w-[60ch] flex-col gap-4">
          {final.paragraphs.map((p, i) => (
            <p key={i} className="type-p text-white/85">{p}</p>
          ))}
          <p className="type-item text-white">{final.passion}</p>
        </div>
        <LinkButton href="#fit-call" variant="light" className="mt-10 max-md:w-full">לקביעת שיחת התאמה</LinkButton>
        <p className="type-small mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/75">
          {final.facts.map((f, i) => (
            <span key={f} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden className="size-1.5 bg-white/40" />}
              {f}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
