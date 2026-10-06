"use client";

import { useEffect, useRef, useState } from "react";
import { PixelShape } from "@/components/pixel/PixelShape";
import { PixelWord } from "@/components/PixelWord";
import type { World } from "@/content/learnTest";

/**
 * The five worlds of the method. Desktop: a sticky stage on the right paints
 * the shape of whichever world is in the middle of the screen (the last one
 * falls back to stones, the new one paints in); the worlds scroll past on the
 * left. Mobile: each world carries its own small shape.
 */
export function MethodWorlds({ worlds }: { worlds: World[] }) {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-48% 0px -48% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid-12 mt-[clamp(56px,6vw,112px)]">
      {/* stage — sticky, desktop only */}
      <div className="col-span-5 max-lg:hidden">
        <div className="sticky top-[14vh] flex flex-col items-start gap-8">
          <div className="relative w-full max-w-[460px] text-white">
            {worlds.map((w, i) => (
              <PixelShape
                key={w.title}
                kind={w.shape}
                color={w.color}
                cols={16}
                on={i === active}
                speed={620}
                className={[i === 0 ? "relative" : "absolute inset-0", "is-quiet"].join(" ")}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 text-white" dir="ltr">
            <span className="text-[32px]"><PixelWord text={worlds[active].word} /></span>
          </div>
          <ol className="flex gap-2" aria-hidden>
            {worlds.map((w, i) => (
              <li key={w.title} className={["size-3 transition-colors", i === active ? "bg-white" : "bg-white/20"].join(" ")} />
            ))}
          </ol>
        </div>
      </div>

      {/* the worlds */}
      <div className="col-span-6 col-start-7 max-lg:col-span-full max-lg:col-start-1">
        {worlds.map((w, i) => (
          <article
            key={w.title}
            ref={(el) => { items.current[i] = el; }}
            data-i={i}
            className="flex min-h-[78vh] flex-col justify-center gap-5 border-t border-white/20 py-14 first:border-t-0 max-lg:min-h-0 max-lg:py-12"
          >
            <div className="w-20 text-white lg:hidden">
              <PixelShape kind={w.shape} color={w.color} cols={10} />
            </div>
            <h3 className="type-h2 text-white">{w.title}</h3>
            <p className="type-item text-white">{w.lead}</p>
            <p className="type-p max-w-[60ch] text-white/85">{w.body}</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border-t border-white/20 pt-5">
              <dt className="type-small text-white/60">פעם</dt>
              <dd className="type-p text-white/60">{w.then}</dd>
              <dt className="type-small font-bold text-white">היום</dt>
              <dd className="type-p font-bold text-white">{w.now}</dd>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
