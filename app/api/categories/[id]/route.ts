import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const res = await db.execute({ sql: "SELECT * FROM categories WHERE id = ?", args: [Number(id)] });
  let category: any = undefined;
  if (res.rows.length > 0) {
    const row = res.rows[0];
    category = {};
    for (let i = 0; i < res.columns.length; i++) {
      category[res.columns[i]] = row[i] ?? row[res.columns[i]];
    }
  }
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

  const db = await getDb();
  await db.execute({
    sql: "UPDATE categories SET name = ?, description = ?, image = ?, sort_order = ? WHERE id = ?",
    args: [name, description, image, sort_order, Number(id)]
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const db = await getDb();
  await db.execute({ sql: "DELETE FROM categories WHERE id = ?", args: [Number(id)] });
  return NextResponse.json({ success: true });
}
