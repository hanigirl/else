"use client";

import { useRef, useState, type FormEvent } from "react";
import styles from "./newsletter.module.css";

const MSG = {
  empty: "חובה למלא את השדה הזה",
  email: "כתובת האימייל לא תקינה",
  phone: "מספר הטלפון לא תקין",
  consent: "חובה לאשר קבלת דיוורים",
  failed: "משהו השתבש. נסו שוב בעוד רגע.",
};

const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
/** Israeli numbers: 9–10 digits from 0, or +972 / 972 without the leading 0. */
const validPhone = (v: string) => {
  const d = v.replace(/[\s\-().]/g, "");
  return /^0\d{8,9}$/.test(d) || /^\+?972\d{8,9}$/.test(d);
};

type Field = "firstName" | "lastName" | "email" | "phone";
type Errors = Partial<Record<Field | "consent", string>>;

export function NewsletterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const refs = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    consent: useRef<HTMLInputElement>(null),
  };
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const validate = (): Errors => {
    const next: Errors = {};
    if (!refs.firstName.current?.value.trim()) next.firstName = MSG.empty;
    if (!refs.lastName.current?.value.trim()) next.lastName = MSG.empty;
    const email = refs.email.current?.value.trim() ?? "";
    if (!email) next.email = MSG.empty;
    else if (!validEmail(email)) next.email = MSG.email;
    // phone is optional — only validated when something was typed
    const phone = refs.phone.current?.value.trim() ?? "";
    if (phone && !validPhone(phone)) next.phone = MSG.phone;
    if (!refs.consent.current?.checked) next.consent = MSG.consent;
    return next;
  };

  // once someone who just signed up focuses the form to sign up again, drop the toast
  const dismissSent = () => {
    if (status === "sent") setStatus("idle");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;

    const next = validate();
    setErrors(next);
    const first = (["firstName", "lastName", "email", "phone", "consent"] as const).find((f) => next[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }

    const q = new URLSearchParams(window.location.search);
    setStatus("sending");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/newsletter`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: refs.firstName.current?.value,
          lastName: refs.lastName.current?.value,
          email: refs.email.current?.value,
          phone: refs.phone.current?.value,
          consent: true,
          utm: {
            source: q.get("utm_source"),
            medium: q.get("utm_medium"),
            campaign: q.get("utm_campaign"),
          },
        }),
      });
      if (res.ok) {
        formRef.current?.reset();
        setErrors({});
        setStatus("sent");
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
    }
  };

  // clear a field's error as soon as it becomes valid while typing
  const recheck = () => {
    if (Object.keys(errors).length) setErrors(validate());
  };

  // immediate feedback when leaving a format field with a wrong value
  const checkFormat = (field: "email" | "phone") => () => {
    const v = refs[field].current?.value.trim() ?? "";
    let err: string | undefined;
    if (field === "email" && v && !validEmail(v)) err = MSG.email;
    if (field === "phone" && v && !validPhone(v)) err = MSG.phone;
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  return (
    <form ref={formRef} className={styles.form} noValidate onSubmit={onSubmit} onFocusCapture={dismissSent}>
      <div className={styles.fields}>
        <div className={styles.field}>
          {errors.firstName && <div className={styles.tip} role="alert">{errors.firstName}</div>}
          <label className={styles.label} htmlFor="nl-first">
            שם<span className={styles.req} aria-hidden>*</span>
          </label>
          <input
            id="nl-first"
            ref={refs.firstName}
            name="firstName"
            type="text"
            autoComplete="given-name"
            className={styles.input}
            aria-required
            aria-invalid={errors.firstName ? true : undefined}
            onInput={recheck}
          />
        </div>

        <div className={styles.field}>
          {errors.lastName && <div className={styles.tip} role="alert">{errors.lastName}</div>}
          <label className={styles.label} htmlFor="nl-last">
            שם משפחה<span className={styles.req} aria-hidden>*</span>
          </label>
          <input
            id="nl-last"
            ref={refs.lastName}
            name="lastName"
            type="text"
            autoComplete="family-name"
            className={styles.input}
            aria-required
            aria-invalid={errors.lastName ? true : undefined}
            onInput={recheck}
          />
        </div>

        <div className={styles.field}>
          {errors.email && <div className={styles.tip} role="alert">{errors.email}</div>}
          <label className={styles.label} htmlFor="nl-email">
            אימייל<span className={styles.req} aria-hidden>*</span>
          </label>
          <input
            id="nl-email"
            ref={refs.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            style={{ textAlign: "right" }}
            className={styles.input}
            aria-required
            aria-invalid={errors.email ? true : undefined}
            onInput={recheck}
            onBlur={checkFormat("email")}
          />
        </div>

        <div className={styles.field}>
          {errors.phone && <div className={styles.tip} role="alert">{errors.phone}</div>}
          <label className={styles.label} htmlFor="nl-phone">טלפון</label>
          <input
            id="nl-phone"
            ref={refs.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            style={{ textAlign: "right" }}
            className={styles.input}
            aria-invalid={errors.phone ? true : undefined}
            onInput={recheck}
            onBlur={checkFormat("phone")}
          />
        </div>

        <button type="submit" className={styles.submit} disabled={status === "sending"}>
          {status === "sending" ? "רושם…" : "תרשמו אותי"}
        </button>
      </div>

      <div className={styles.consentWrap}>
        {errors.consent && <div className={`${styles.tip} ${styles.tipConsent}`} role="alert">{errors.consent}</div>}
        <label className={styles.consent}>
          <input
            ref={refs.consent}
            type="checkbox"
            name="consent"
            className={styles.consentBox}
            aria-required
            aria-invalid={errors.consent ? true : undefined}
            onChange={recheck}
          />
          <span>
            אני מאשר/ת קבלת דיוורים מחני בוסקילה ואת{" "}
            <a href="/privacy" className={styles.privacyLink} target="_blank" rel="noopener noreferrer">
              מדיניות הפרטיות
            </a>
          </span>
        </label>
      </div>

      {status === "sent" && (
        <div className={styles.toast} role="status">
          נרשמת בהצלחה. נתראה בניוזלטר השבועי!
        </div>
      )}
      {status === "failed" && (
        <p className={styles.message} data-tone="error" role="alert">
          {MSG.failed}
        </p>
      )}
    </form>
  );
}
