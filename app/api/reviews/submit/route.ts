import { NextRequest, NextResponse } from "next/server";
import { submitReviewFromInvite } from "@/lib/review-service";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  const review_text = String(body.review_text ?? "").trim();
  const rating = Number(body.rating);

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }
  if (!review_text || review_text.length < 20) {
    return NextResponse.json(
      { error: "Please write at least 20 characters for your review" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const result = await submitReviewFromInvite({
    token,
    rating,
    review_text,
    detail: body.detail ? String(body.detail) : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message:
      "Thank you. Your review has been received and will appear on our site once approved.",
  });
}
