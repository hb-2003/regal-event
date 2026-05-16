import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Category } from "@/server/database/entities/Category.entity";
import { requireAdmin } from "@/lib/auth";
import { isAllowedImagePath } from "@/lib/media-path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const repo = await getRepository(Category);
  const category = await repo.findOneBy({ id: Number(id) });
  if (!category)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 80);
  const description = body.description
    ? String(body.description).trim().slice(0, 500)
    : null;
  const image = body.image ? String(body.image).slice(0, 500) : null;
  const sort_order = Number.isFinite(Number(body.sort_order))
    ? Math.floor(Number(body.sort_order))
    : 0;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (image && !isAllowedImagePath(image)) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  const repo = await getRepository(Category);
  await repo.update(Number(id), { name, description, image, sort_order });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const repo = await getRepository(Category);
  await repo.delete(Number(id));
  return NextResponse.json({ success: true });
}
