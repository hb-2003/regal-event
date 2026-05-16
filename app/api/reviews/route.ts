import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Review } from "@/server/database/entities/Review.entity";
import { requireAdmin } from "@/lib/auth";
import { toPublicReview } from "@/lib/review-service";

/** Public: approved reviews. Admin: all reviews with optional ?status= */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  const isAdmin = !(auth instanceof NextResponse);

  const repo = await getRepository(Review);
  const statusParam = request.nextUrl.searchParams.get("status");

  if (isAdmin) {
    const where =
      statusParam && ["pending", "approved", "rejected"].includes(statusParam)
        ? { status: statusParam as "pending" | "approved" | "rejected" }
        : {};
    const rows = await repo.find({
      where,
      order: { submitted_at: "DESC", created_at: "DESC" },
    });
    return NextResponse.json(rows);
  }

  const rows = await repo.find({
    where: { status: "approved" },
    order: { sort_order: "ASC", event_year: "DESC", id: "DESC" },
  });
  return NextResponse.json(rows.map(toPublicReview));
}
