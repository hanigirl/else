import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const MAIN_LIST_ID = 5;
const API = "https://api.brevo.com/v3/contacts";

let cachedKey: string | null = null;

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

function toE164(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return /^\+\d{8,15}$/.test(digits) ? digits : null;
  if (digits.startsWith("00")) return toE164(`+${digits.slice(2)}`);
  if (digits.startsWith("0")) return `+972${digits.slice(1)}`;
  if (digits.length >= 8 && digits.length <= 15) return `+972${digits}`;
  return null;
}

async function addToMainList(
  email: string,
  firstName: string,
  lastName: string,
  phone?: string
) {
  const key = await getKey();

  const attributes: Record<string, string | boolean> = {
    FIRSTNAME: firstName,
    LASTNAME: lastName,
    FULL_NAME: `${firstName} ${lastName}`,
  };

  if (phone) {
    attributes.PHONE = phone;
    const sms = toE164(phone);
    if (sms) {
      attributes.SMS = sms;
    }
  }

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
      listIds: [MAIN_LIST_ID],
      updateEnabled: true,
    }),
  });

  if (res.status === 201 || res.status === 204) return;
  const body = await res.text();
  throw new Error(`Brevo ${res.status}: ${body}`);
}

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, phone } = await req.json();

    // Validate required fields
    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    if (!firstName || typeof firstName !== "string") {
      return Response.json({ error: "First name is required" }, { status: 400 });
    }

    if (!lastName || typeof lastName !== "string") {
      return Response.json({ error: "Last name is required" }, { status: 400 });
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate names are non-empty
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName || !trimmedLastName) {
      return Response.json({ error: "First and last name are required" }, { status: 400 });
    }

    // Phone is optional, validate if provided
    const trimmedPhone = phone?.trim();

    await addToMainList(
      trimmedEmail,
      trimmedFirstName,
      trimmedLastName,
      trimmedPhone
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("[subscribe] error:", error);
    return Response.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
