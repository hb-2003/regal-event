import jwt from "jsonwebtoken";
import crypto from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  throw new Error(
    "JWT_SECRET environment variable is required and must be at least 16 characters long."
  );
}
const SECRET: string = JWT_SECRET;

export type AdminPayload = { username: string; id: number };

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as AdminPayload;
    if (typeof decoded !== "object" || !decoded.username) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get("admin_token")?.value ?? null;
}

export function isAuthenticated(request: NextRequest): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;
  return verifyToken(token) !== null;
}

/**
 * Verify admin auth and return the admin payload, or a 401 NextResponse.
 * Usage:
 *   const auth = requireAdmin(request);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.username is now available
 */
export function requireAdmin(
  request: NextRequest
): AdminPayload | NextResponse {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return payload;
}

export function generateBookingId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  // 10 chars of crypto-grade randomness (~50 bits, no collision risk)
  const rand = crypto
    .randomBytes(8)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, 10)
    .toUpperCase();
  return `RE-${yy}${mm}-${rand}`;
}
