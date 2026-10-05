import { useId, type ReactNode, type Ref } from "react";

/* ---------- Logo ---------- */

/** "light" = white mark + Clash wordmark (on blue). "brand" = full blue lockup (footer). */
export function Logo({ variant = "light", className }: { variant?: "light" | "brand"; className?: string }) {
  if (variant === "brand") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/assets/logo-full.svg" alt="else" width={212} height={58} className={className} />;
  }
  return (
    <span dir="ltr" lang="en" className={["inline-flex items-center gap-[7.1px] text-white", className].filter(Boolean).join(" ")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo-mark.svg" alt="" width={28.5} height={28.7} />
      <span className="type-logo">else</span>
    </span>
  );
}

/* ---------- Chip ---------- */

/** outline = selectable option ("מעצב/ת שרוצה להתקדם"); plain = meta fact ("20 דקות"); tag = tiny "בקרוב". */
export function Chip({ variant = "outline", children }: { variant?: "outline" | "plain" | "tag"; children: ReactNode }) {
  if (variant === "tag") {
    return (
      <span className="type-micro inline-flex rounded-sm border border-ink px-1 py-0.5 font-medium">{children}</span>
    );
  }
  return (
    <span
      className={[
        "type-chip inline-flex rounded-sm p-2.5",
        variant === "outline" && "border border-ink",
      ].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}

/** Selectable chip — a radio option ("רוצה להכנס לתחום"). Picked = secondary (indigo outline); hover looks the same. */
export function ChoiceChip({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        className={[
          "type-chip inline-flex rounded-sm border border-ink p-2.5 transition-colors",
          // picked = secondary style (indigo outline), never the filled primary CTA look;
          // hover previews exactly that
          "hover:border-indigo hover:text-indigo hover:shadow-[inset_0_0_0_1px_var(--color-indigo)]",
          "peer-checked:border-indigo peer-checked:text-indigo peer-checked:shadow-[inset_0_0_0_1px_var(--color-indigo)]",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo",
        ].join(" ")}
      >
        {children}
      </span>
    </label>
  );
}

/** Facts separated by dots — "20 דקות • בחינם • בלי התחייבות" */
export function MetaList({ items }: { items: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="size-1.5 rounded-full bg-ink/20" />}
          <Chip variant="plain">{item}</Chip>
        </span>
      ))}
    </div>
  );
}

/* ---------- Button ---------- */

/**
 * Buttons. primary = filled indigo, the one main action ("שליחת טופס").
 * secondary = indigo outline + indigo text — the same look a picked ChoiceChip uses.
 */
export function Button({
  children,
  type = "button",
  variant = "primary",
  className,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <button
      type={type}
      className={[
        "type-chip inline-flex cursor-pointer rounded-sm p-2.5 transition-colors",
        variant === "primary"
          ? "bg-indigo text-white hover:bg-[color-mix(in_srgb,var(--color-indigo)_88%,black)]"
          : "border border-indigo text-indigo shadow-[inset_0_0_0_1px_var(--color-indigo)] hover:bg-hover",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}

/* ---------- Form ---------- */

/** Red asterisk after a required field's label */
export function RequiredMark() {
  return (
    <span aria-hidden className="field-error ms-0.5">
      *
    </span>
  );
}

/** Underline field: label on top, 1px ink line below; red line + message when invalid. */
export function TextField({
  label,
  type = "text",
  name,
  required,
  error,
  inputRef,
  onInput,
  autoComplete,
}: {
  label: string;
  type?: string;
  name: string;
  required?: boolean;
  /** validation message — shows in red under the line */
  error?: string;
  inputRef?: Ref<HTMLInputElement>;
  onInput?: (value: string) => void;
  autoComplete?: string;
}) {
  const id = useId();
  const ltr = type === "tel" || type === "email";
  return (
    <div className="flex flex-col">
      <label className="flex flex-col">
        <span className="type-lead">
          {label}
          {required && <RequiredMark />}
        </span>
        <input
          ref={inputRef}
          name={name}
          type={type}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? id : undefined}
          onInput={onInput && ((e) => onInput(e.currentTarget.value))}
          className={[
            "type-lead h-[65px] border-b bg-transparent outline-none transition-colors",
            error ? "border-error" : "border-ink",
          ].join(" ")}
          dir={ltr ? "ltr" : undefined}
          style={ltr ? { textAlign: "right" } : undefined}
        />
      </label>
      {error && (
        <p id={id} role="alert" className="type-small field-error mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({
  label,
  name = "consent",
  error,
  required,
  onChange,
  inputRef,
}: {
  label: ReactNode;
  name?: string;
  required?: boolean;
  /** validation message — shows in red under the box and outlines it */
  error?: string;
  onChange?: (checked: boolean) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="type-small inline-flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="checkbox"
          name={name}
          className="checkbox"
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? id : undefined}
          onChange={onChange && ((e) => onChange(e.currentTarget.checked))}
        />
        <span>
          {label}
          {required && <RequiredMark />}
        </span>
      </label>
      {error && (
        <p id={id} role="alert" className="type-small field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Text blocks ---------- */

export function SectionHeading({ title, body, tone = "light" }: { title: string; body: ReactNode; tone?: "light" | "dark" }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className={["type-h2", tone === "dark" ? "text-white" : "text-ink"].join(" ")}>{title}</h2>
      <p className={["type-p", tone === "dark" ? "text-white" : "text-ink"].join(" ")}>{body}</p>
    </div>
  );
}

/** "hani.buskila" with its 2px underline */
export function SignatureLabel({ children }: { children: ReactNode }) {
  return (
    <span lang="en" className="type-label inline-flex flex-col gap-[5px] text-white">
      {children}
      <span aria-hidden className="h-[1.5px] bg-white" />
    </span>
  );
}

export function Divider({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <hr className="border-0 border-t" style={{ borderColor: tone === "dark" ? "var(--line-on-dark)" : "var(--line-on-light)" }} />;
}
