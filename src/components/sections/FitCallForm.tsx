"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button, Checkbox, ChoiceChip, TextField } from "@/components/ui";
import { BOOKING_URL, STAGES as stages } from "@/content/fitCall";

const MSG = {
  empty: "חובה למלא את השדה הזה",
  phone: "מספר הטלפון לא תקין",
  email: "כתובת האימייל לא תקינה",
  consent: "חובה לסמן את השדה הזה",
};

type Field = "name" | "phone" | "email";
type Errors = Partial<Record<Field | "consent", string>>;

/** Israeli numbers: 9–10 digits starting with 0, or +972 / 972 without the leading 0 */
function validPhone(v: string) {
  const d = v.replace(/[\s\-().]/g, "");
  return /^0\d{8,9}$/.test(d) || /^\+?972\d{8,9}$/.test(d);
}
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function check(field: Field, value: string): string | undefined {
  const v = value.trim();
  if (!v) return MSG.empty;
  if (field === "phone" && !validPhone(v)) return MSG.phone;
  if (field === "email" && !validEmail(v)) return MSG.email;
}

/** The fit-call form (Figma 52:1285). Name, phone, email and consent are required. */
export function FitCallForm() {
  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    consent: useRef<HTMLInputElement>(null),
  };
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const next: Errors = {};
    (["name", "phone", "email"] as Field[]).forEach((f) => {
      const err = check(f, refs[f].current?.value ?? "");
      if (err) next[f] = err;
    });
    if (!refs.consent.current?.checked) next.consent = MSG.consent;
    setErrors(next);

    const first = (["name", "phone", "email", "consent"] as const).find((f) => next[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }

    // → /api/lead → Brevo list "else-uiux-interested"
    const form = e.currentTarget;
    const q = new URLSearchParams(window.location.search);
    setStatus("sending");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/lead`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: refs.name.current?.value,
          phone: refs.phone.current?.value,
          email: refs.email.current?.value,
          stage: new FormData(form).get("stage"),
          consent: true,
          utm: { source: q.get("utm_source"), medium: q.get("utm_medium"), campaign: q.get("utm_campaign") },
        }),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  // once a field shows an error, re-check it as they type so it clears the moment it's fixed
  const recheck = (f: Field) => (value: string) =>
    setErrors((cur) => (cur[f] ? { ...cur, [f]: check(f, value) } : cur));

  if (status === "sent") {
    return (
      /* Figma 65:1306 — success message */
      <div role="status" className="mt-[50px] flex flex-col items-start gap-3 rounded-sm border border-success bg-success-soft p-5 text-ink">
        <p className="type-h3">תודה! הפרטים התקבלו</p>
        <p className="type-lead">
          אפשר לבחור כבר עכשיו מועד לשיחה.
          <br />
          הקישור מחכה לכם גם במייל.
        </p>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="type-small inline-flex self-end rounded-sm bg-success p-2.5 font-medium text-white transition-colors hover:bg-[color-mix(in_srgb,var(--color-success)_88%,black)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
        >
          לקביעת שיחה
        </a>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="mt-[50px] flex flex-col gap-[50px]">
      <div className="grid grid-cols-[350fr_340fr] gap-x-[21px] max-md:grid-cols-1 max-md:gap-y-[50px]">
        <TextField name="name" label="שם מלא" required autoComplete="name"
          inputRef={refs.name} error={errors.name} onInput={recheck("name")} />
        <TextField name="phone" type="tel" label="טלפון" required autoComplete="tel"
          inputRef={refs.phone} error={errors.phone} onInput={recheck("phone")} />
      </div>
      <TextField name="email" type="email" label="אימייל" required autoComplete="email"
        inputRef={refs.email} error={errors.email} onInput={recheck("email")} />

      <div className="flex flex-col items-start gap-[29px]">
        <fieldset>
          <legend className="type-lead mb-[29px]">איפה אתם היום?</legend>
          <div className="flex flex-wrap gap-4">
            {stages.map((s) => (
              <ChoiceChip key={s} name="stage" value={s} defaultChecked={s === stages[0]}>
                {s}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>
        <Checkbox
          inputRef={refs.consent}
          required
          label={
            <>
              <span className="max-md:hidden">אני מאשר/ת שיחזרו אליי לתיאום השיחה, ולקבל מ-else עדכונים במייל ובהודעות.</span>
              {/* phones: a shorter line that fits one row */}
              <span className="text-[12px] md:hidden">אני מאשר/ת שיחזרו אליי ולקבל עדכונים מ-else</span>
            </>
          }
          error={errors.consent}
          onChange={(checked) => checked && setErrors((cur) => ({ ...cur, consent: undefined }))}
        />
        <div className="flex flex-col gap-3 max-md:w-full">
          <Button type="submit" disabled={status === "sending"} className="max-md:w-full max-md:justify-center">
            {status === "sending" ? "שולח…" : "שליחת טופס"}
          </Button>
          {status === "failed" && (
            <p role="alert" className="type-small field-error">משהו השתבש בשליחה. נסו שוב בעוד רגע.</p>
          )}
        </div>
      </div>
    </form>
  );
}
