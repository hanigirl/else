import { addLeadToList, sendConfirmation, type Lead } from "@/lib/brevo";
import { BOOKING_URL, STAGES } from "@/content/fitCall";

const clip = (v: unknown, max = 120) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

/** Mirrors the browser validation — never trust the client's version of it. */
function parse(body: unknown): Lead | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, phone, email, stage, consent, utm } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) return null;
  if (typeof phone !== "string" || phone.replace(/\D/g, "").length < 9) return null;
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return null;
  if (typeof stage !== "string" || !(STAGES as readonly string[]).includes(stage)) return null;
  if (consent !== true) return null;

  const u = (typeof utm === "object" && utm !== null ? utm : {}) as Record<string, unknown>;

  return {
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    stage,
    utm: { source: clip(u.source), medium: clip(u.medium), campaign: clip(u.campaign) },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const lead = parse(body);
  if (!lead) return Response.json({ error: "invalid_fields" }, { status: 400 });

  try {
    await addLeadToList(lead);
  } catch (err) {
    // The lead is the whole point of the page, so a failure has to be loud in
    // the server logs even though the visitor only sees a retry message.
    console.error("[lead] Brevo call failed:", err);
    return Response.json({ error: "upstream" }, { status: 502 });
  }

  // The lead is already saved — a failed email is logged, never shown as a failed form.
  try {
    await sendConfirmation(lead, BOOKING_URL);
  } catch (err) {
    console.error("[lead] confirmation email failed:", err);
  }

  return Response.json({ ok: true });
}
