import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

type Admin = { id: number; username: string; password: string };

// Per-IP login rate limit: 8 attempts / 15 minutes
const buckets = new Map<string, { count: number; reset: number }>();
const LIMIT = 8;
const WINDOW_MS = 15 * 60 * 1000;

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
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const username = String(body.username ?? "").trim().slice(0, 80);
  const password = String(body.password ?? "").slice(0, 200);

  if (!username || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const db = getDb();
  const admin = db
    .prepare("SELECT * FROM admins WHERE username = ?")
    .get(username) as Admin | undefined;

  // Always run bcrypt to prevent username-enumeration via timing
  const hashToCheck =
    admin?.password ||
    "$2b$10$abcdefghijklmnopqrstuuMv0YZ8w0Z3yX1m2N3o4p5Q6R7s8t9U0V";
  const ok = await bcrypt.compare(password, hashToCheck);

  if (!admin || !ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ username: admin.username, id: admin.id });
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return response;
}
