import type { ReactNode } from "react";

/**
 * A call to action that goes somewhere (link), in the Button's look.
 * primary = indigo fill (on light), light = white fill + indigo text (on blue/night),
 * ghost = white outline (secondary, on blue).
 */
export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "light" | "ghost";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={[
        "type-chip inline-flex items-center justify-center rounded-sm px-4 py-2.5 transition-colors",
        variant === "primary" && "bg-indigo text-white hover:bg-[color-mix(in_srgb,var(--color-indigo)_88%,black)]",
        variant === "light" && "bg-white text-indigo hover:bg-mist",
        variant === "ghost" && "border border-white/80 text-white hover:bg-white/10",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </a>
  );
}
