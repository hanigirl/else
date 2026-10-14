import { addBuyerToList, removeBuyerFromInterested, sendPurchaseWelcome } from "@/lib/brevo";

/**
 * Grow webhook for the else-uiux payment link: every buyer of that product lands in Brevo
 * list 22 "else-uiux-purchased", leaves list 21 "else-uiux-interested", and
 * gets the welcome email with the WhatsApp group link.
 *
 * The Grow webhook is account-wide, so this route is also the one place that hands
 * d2c purchases on to the partner's Smoove webhook (PARTNER_D2C_WEBHOOK_URL) —
 * he gets only d2c, never figma flow or else.
 *
 * Grow doesn't sign its webhooks, so the URL configured in Grow carries a
 * secret (?key=…) that has to match GROW_WEBHOOK_SECRET.
 */

type Fields = Record<string, unknown>;

/** Grow posts JSON or a form, sometimes with everything nested under `data`. */
function parseFields(body: string, type: string): Fields {
  let raw: Fields = {};
  if (type.includes("application/json")) {
    raw = JSON.parse(body) as Fields;
  } else {
    const form = new URLSearchParams(body);
    for (const [k, v] of form) raw[k.replace(/^data\[(.+)\]$/, "$1")] = v;
  }
  const nested = raw.data;
  return typeof nested === "object" && nested !== null ? { ...raw, ...(nested as Fields) } : raw;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** What the payment link's internal name ("עבור שירות") says in Grow. */
const ELSE_PRODUCT = /learn\s*ui\s*\/?\s*ux/i;
const D2C_PRODUCT = /d2c|design\s*to\s*code/i;

/**
 * The Grow webhook is account-wide — it fires for every product (d2c, figma flow…),
 * so the product is read off the payment link's name.
 * Grow's field names vary (description, productDescription, productData[0][name]…),
 * so this checks every product/description/title field, nested or flattened.
 */
function isPurchaseOf(product: RegExp, value: unknown, key = ""): boolean {
  if (typeof value === "string") return /desc|product|title/i.test(key) && product.test(value);
  if (Array.isArray(value)) return value.some((v) => isPurchaseOf(product, v, key));
  if (typeof value === "object" && value !== null)
    return Object.entries(value).some(([k, v]) => isPurchaseOf(product, v, `${key}.${k}`));
  return false;
}

export async function POST(request: Request) {
  const secret = process.env.GROW_WEBHOOK_SECRET;
  if (!secret || new URL(request.url).searchParams.get("key") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const type = request.headers.get("content-type") ?? "";
  const body = await request.text();
  let fields: Fields;
  try {
    fields = parseFields(body, type);
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const loggable = Object.fromEntries(Object.entries(fields).filter(([k]) => !k.startsWith("card")));
  console.log("[grow] payload:", JSON.stringify(loggable));

  // Grow's status code 2 = paid. Page webhooks only fire on success and carry no status at all.
  if (fields.statusCode !== undefined && String(fields.statusCode) !== "2") {
    console.log("[grow] ignoring non-paid update:", fields.statusCode, fields.status);
    return Response.json({ ok: true, ignored: true });
  }

  if (isPurchaseOf(D2C_PRODUCT, fields)) {
    const partner = process.env.PARTNER_D2C_WEBHOOK_URL;
    if (!partner) {
      console.error("[grow] d2c purchase but PARTNER_D2C_WEBHOOK_URL is not set:", str(fields.payerEmail) ?? "");
      return Response.json({ ok: true, ignored: "no_partner_url" });
    }
    // Pass Grow's original body through untouched, so his Smoove setup sees what it always did.
    const res = await fetch(partner, { method: "POST", headers: { "content-type": type }, body }).catch((err) => err as Error);
    if (res instanceof Error || !res.ok) {
      // a non-2xx makes Grow retry, so a partner hiccup doesn't lose the buyer
      console.error("[grow] forwarding d2c purchase failed:", res instanceof Error ? res : res.status);
      return Response.json({ error: "partner_upstream" }, { status: 502 });
    }
    console.log("[grow] d2c purchase forwarded to partner:", str(fields.payerEmail) ?? "");
    return Response.json({ ok: true, forwarded: "d2c" });
  }

  if (!isPurchaseOf(ELSE_PRODUCT, fields)) {
    console.log("[grow] ignoring purchase of another product:", str(fields.payerEmail) ?? "");
    return Response.json({ ok: true, ignored: "other_product" });
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

  try {
    await removeBuyerFromInterested(email);
  } catch (err) {
    console.error("[grow] couldn't remove buyer from the interested list:", email, err);
  }

  // The buyer is already saved — a failed email is logged, not retried, since a
  // retry would also re-send to everyone whose email did go out.
  try {
    await sendPurchaseWelcome(buyer);
  } catch (err) {
    console.error("[grow] welcome email failed:", email, err);
  }
  return Response.json({ ok: true });
}
