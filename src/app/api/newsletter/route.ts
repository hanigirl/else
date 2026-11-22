import { addSubscriberToNewsletter, type Subscriber } from "@/lib/brevo";

const clip = (v: unknown, max = 120) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

/** Mirrors the browser validation — never trust the client's version of it. */
function parse(body: unknown): Subscriber | null {
  if (typeof body !== "object" || body === null) return null;
  const { firstName, lastName, email, phone, consent, utm } = body as Record<string, unknown>;

  if (typeof firstName !== "string" || firstName.trim().length < 1) return null;
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return null;
  if (consent !== true) return null;

  const u = (typeof utm === "object" && utm !== null ? utm : {}) as Record<string, unknown>;

  return {
    firstName: firstName.trim().slice(0, 80),
    lastName: clip(lastName, 80),
    email: email.trim().toLowerCase(),
    phone: clip(phone, 30),
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

  const sub = parse(body);
  if (!sub) return Response.json({ error: "invalid_fields" }, { status: 400 });

  try {
    await addSubscriberToNewsletter(sub);
  } catch (err) {
    // The signup is the whole point of the page, so a failure has to be loud in
    // the server logs even though the visitor only sees a retry message.
    console.error("[newsletter] Brevo call failed:", err);
    return Response.json({ error: "upstream" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
