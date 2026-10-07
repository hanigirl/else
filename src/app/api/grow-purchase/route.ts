import { addBuyerToList, sendPurchaseWelcome } from "@/lib/brevo";

/**
 * Grow webhook for the else-uiux payment link: every buyer lands in Brevo
 * list 22 "else-uiux-purchased".
 * Each one also gets the welcome email with the WhatsApp group link.
 *
 * Grow doesn't sign its webhooks, so the URL configured in Grow carries a
 * secret (?key=…) that has to match GROW_WEBHOOK_SECRET.
 */

type Fields = Record<string, unknown>;

/** Grow posts JSON or a form, sometimes with everything nested under `data`. */
async function readFields(request: Request): Promise<Fields> {
  const type = request.headers.get("content-type") ?? "";
  let raw: Fields = {};
  if (type.includes("application/json")) {
    raw = (await request.json()) as Fields;
  } else {
    const form = new URLSearchParams(await request.text());
    for (const [k, v] of form) raw[k.replace(/^data\[(.+)\]$/, "$1")] = v;
  }
  const nested = raw.data;
  return typeof nested === "object" && nested !== null ? { ...raw, ...(nested as Fields) } : raw;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export async function POST(request: Request) {
  const secret = process.env.GROW_WEBHOOK_SECRET;
  if (!secret || new URL(request.url).searchParams.get("key") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let fields: Fields;
  try {
    fields = await readFields(request);
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  // Grow's status code 2 = paid. Page webhooks only fire on success and carry no status at all.
  if (fields.statusCode !== undefined && String(fields.statusCode) !== "2") {
    console.log("[grow] ignoring non-paid update:", fields.statusCode, fields.status);
    return Response.json({ ok: true, ignored: true });
  }

  const email = str(fields.payerEmail)?.toLowerCase();
  if (!email) {
    console.error("[grow] webhook without payerEmail:", JSON.stringify(fields));
    return Response.json({ error: "no_email" }, { status: 400 });
  }

  const buyer = { email, name: str(fields.fullName), phone: str(fields.payerPhone) };
  try {
    await addBuyerToList(buyer);
  } catch (err) {
    // a non-2xx makes Grow retry (10/20/30 min), so a Brevo hiccup doesn't lose the buyer
    console.error("[grow] Brevo call failed:", err);
    return Response.json({ error: "upstream" }, { status: 502 });
  }

  console.log("[grow] buyer added:", email, str(fields.purchasePageTitle) ?? "");

  // The buyer is already saved — a failed email is logged, not retried, since a
  // retry would also re-send to everyone whose email did go out.
  try {
    await sendPurchaseWelcome(buyer);
  } catch (err) {
    console.error("[grow] welcome email failed:", email, err);
  }
  return Response.json({ ok: true });
}
