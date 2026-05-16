import crypto from "crypto";

const INVITE_TTL_DAYS = Number(process.env.REVIEW_INVITE_TTL_DAYS) || 90;

export function generateReviewToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getReviewInviteExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + INVITE_TTL_DAYS);
  return d;
}

export function buildReviewUrl(token: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${siteUrl}/review?token=${encodeURIComponent(token)}`;
}
