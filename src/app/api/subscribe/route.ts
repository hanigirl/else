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

async function addToMainList(email: string) {
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
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    await addToMainList(trimmed);

    return Response.json({ success: true });
  } catch (error) {
    console.error("[subscribe] error:", error);
    return Response.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
