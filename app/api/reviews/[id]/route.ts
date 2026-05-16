import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Review } from "@/server/database/entities/Review.entity";
import { requireAdmin } from "@/lib/auth";

const ALLOWED = ["pending", "approved", "rejected"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const reviewId = Number(id);
  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { status?: string; admin_notes?: string; sort_order?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status;
  if (!status || !ALLOWED.includes(status as (typeof ALLOWED)[number])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const repo = await getRepository(Review);
  const review = await repo.findOneBy({ id: reviewId });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  review.status = status as Review["status"];
  review.admin_notes = body.admin_notes
    ? String(body.admin_notes).slice(0, 2000)
    : review.admin_notes;
  if (Number.isFinite(Number(body.sort_order))) {
    review.sort_order = Math.floor(Number(body.sort_order));
  }
  review.moderated_at = new Date();
  await repo.save(review);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const reviewId = Number(id);
  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const repo = await getRepository(Review);
  await repo.delete({ id: reviewId });
  return NextResponse.json({ success: true });
}
