import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Gallery } from "@/server/database/entities/Gallery.entity";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const repo = await getRepository(Gallery);
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const rows =
    category && category !== "all"
      ? await repo.find({
          where: { category },
          order: { sort_order: "ASC", created_at: "DESC" },
          take: 500,
        })
      : await repo.find({
          order: { sort_order: "ASC", created_at: "DESC" },
          take: 500,
        });

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = body.title ? String(body.title).trim().slice(0, 200) : null;
  const category = body.category
    ? String(body.category).trim().slice(0, 80)
    : null;
  const image_path = String(body.image_path ?? "").trim();
  const sort_order = Number.isFinite(Number(body.sort_order))
    ? Math.floor(Number(body.sort_order))
    : 0;

  if (!image_path || !image_path.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Invalid image_path" }, { status: 400 });
  }

  const repo = await getRepository(Gallery);
  await repo.save(
    repo.create({ title, category, image_path, sort_order })
  );
  return NextResponse.json({ success: true }, { status: 201 });
}
