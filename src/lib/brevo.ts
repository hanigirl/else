/**
 * Brevo contact upsert for the fit-call form.
 *
 * Server-only — the API key is a full-access credential and must never reach
 * the browser. Anything importing this file has to stay on the server.
 */

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

// List 21 in the UXtra account: "else-uiux-interested".
const BREVO_LIST_ID = Number(process.env.BREVO_LIST_ID ?? 21);
const API = "https://api.brevo.com/v3/contacts";

let cachedKey: string | null = null;

/**
 * BREVO_API_KEY is what production runs on. The `~/.brevo-key` fallback lets a
 * local checkout work without copying the credential into the repo — which
 * also means a missing production key only shows up when a real person submits.
 */
async function getKey(): Promise<string> {
  if (cachedKey) return cachedKey;
  const fromEnv = process.env.BREVO_API_KEY?.trim();
  if (fromEnv) return (cachedKey = fromEnv);

  const fromFile = (
    await fs.readFile(path.join(os.homedir(), ".brevo-key"), "utf8")
  ).trim();
  if (!fromFile) throw new Error("BREVO_API_KEY is not set and ~/.brevo-key is empty");
  return (cachedKey = fromFile);
}

export type Lead = {
  name: string;
  phone: string;
  email: string;
  /** Where the person is today, in the words shown on the form. */
  stage: string;
  utm: { source?: string; medium?: string; campaign?: string };
};

/**
 * Brevo stores SMS numbers as E.164 and rejects the whole contact if the format
 * is off, so a local 05x number has to be rewritten. Anything we can't convert
 * confidently comes back null and is kept only as the plain PHONE attribute.
 */
function toE164(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return /^\+\d{8,15}$/.test(digits) ? digits : null;
  if (digits.startsWith("00")) return toE164(`+${digits.slice(2)}`);
  if (digits.startsWith("0")) return `+972${digits.slice(1)}`;
  if (digits.length >= 8 && digits.length <= 15) return `+972${digits}`;
  return null;
}

/** Brevo wants FIRSTNAME/LASTNAME; the form asks for one "שם מלא" field. */
function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

type Attributes = Record<string, string | boolean>;

async function upsert(email: string, attributes: Attributes) {
  const key = await getKey();

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "api-key": key,
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      attributes,
      listIds: [BREVO_LIST_ID],
      // Someone who already exists in the account (a d2c lead, say) is updated
      // and added to this list instead of 400-ing as a duplicate.
      updateEnabled: true,
    }),
  });

  // 201 created, 204 updated. Everything else carries a Brevo error body.
  if (res.status === 201 || res.status === 204) return;
  const body = await res.text();
  throw new Error(`Brevo ${res.status}: ${body}`);
}

export async function addLeadToList(lead: Lead) {
  const { first, last } = splitName(lead.name);

  const attributes: Attributes = {
    FULL_NAME: lead.name,
    FIRSTNAME: first,
    LASTNAME: last,
    PHONE: lead.phone,
    PRIVACY: true,
    ELSE_STAGE: lead.stage,
  };
  if (lead.utm.source) attributes.UTM_SOURCE = lead.utm.source;
  if (lead.utm.medium) attributes.UTM_MEDIUM = lead.utm.medium;
  if (lead.utm.campaign) attributes.UTM_CAMPAIGN = lead.utm.campaign;

  const sms = toE164(lead.phone);
  try {
    await upsert(lead.email, sms ? { ...attributes, SMS: sms } : attributes);
  } catch (err) {
    // A number Brevo won't accept as an SMS destination must not cost us the
    // lead — save the contact without it and keep the raw number in PHONE.
    const message = err instanceof Error ? err.message : String(err);
    if (!sms || !message.startsWith("Brevo 400")) throw err;
    console.warn("[brevo] saving without SMS:", message);
    await upsert(lead.email, attributes);
  }
}

/**
 * The confirmation email every form sender gets — sent from here, not from a
 * Brevo automation on the list, because the list also holds people who never
 * filled in this form. Hani designs the email as a Brevo template; null = not
 * ready yet, nothing is sent.
 *
 * Variables the template can use: {{ params.FIRSTNAME }}, {{ params.FULL_NAME }},
 * {{ params.STAGE }}, {{ params.BOOKING_URL }}
 */
// Template 79 "else-uiux · אישור הרשמה לשיחה" — source: emails/confirmation.html (Figma 65:1309)
const CONFIRM_TEMPLATE_ID: number | null = Number(process.env.BREVO_CONFIRM_TEMPLATE_ID) || 79;

export async function sendConfirmation(lead: Lead, bookingUrl: string) {
  if (!CONFIRM_TEMPLATE_ID) return;
  const key = await getKey();
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      templateId: CONFIRM_TEMPLATE_ID,
      to: [{ email: lead.email, name: lead.name }],
      params: {
        FIRSTNAME: splitName(lead.name).first,
        FULL_NAME: lead.name,
        STAGE: lead.stage,
        BOOKING_URL: bookingUrl,
      },
    }),
  });
  if (!res.ok) throw new Error(`Brevo email ${res.status}: ${await res.text()}`);
}
