import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Category } from "@/server/database/entities/Category.entity";
import { requireAdmin } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET() {
  const repo = await getRepository(Category);
  const categories = await repo.find({ order: { sort_order: "ASC" } });
  return NextResponse.json(categories);
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

  const name = String(body.name ?? "").trim().slice(0, 80);
  const slug = String(body.slug ?? "").trim().slice(0, 80);
  const description = body.description
    ? String(body.description).trim().slice(0, 500)
    : null;
  const image = body.image ? String(body.image).slice(0, 500) : null;
  const sort_order = Number.isFinite(Number(body.sort_order))
    ? Math.floor(Number(body.sort_order))
    : 0;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and slug required" },
      { status: 400 }
    );
  }
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const repo = await getRepository(Category);
  await repo.save(
    repo.create({ name, slug, description, image, sort_order })
  );
  return NextResponse.json({ success: true }, { status: 201 });
}
