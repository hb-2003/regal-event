import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { sendContactAlertToAdmin } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limit (resets on server restart). Per-IP, 5 messages / 10 min.
const buckets = new Map<string, { count: number; reset: number }>();
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (b.count >= LIMIT) return false;
  b.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const full_name = String(body.full_name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const phone = body.phone ? String(body.phone).trim().slice(0, 40) : null;
  const message = String(body.message ?? "").trim().slice(0, 5000);

  if (!full_name || !email || !message) {
    return NextResponse.json(
      { error: "Required fields missing" },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO contacts (full_name, email, phone, message) VALUES (?, ?, ?, ?)",
    args: [full_name, email, phone, message]
  });

  try {
    await sendContactAlertToAdmin({
      full_name,
      email,
      phone: phone ?? undefined,
      message,
    });
  } catch (err) {
    console.error("[contacts] email failed", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
