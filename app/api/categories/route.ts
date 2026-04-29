import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET() {
  const db = getDb();
  const categories = db
    .prepare("SELECT * FROM categories ORDER BY sort_order ASC")
    .all();
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

  const db = getDb();
  db.prepare(
    "INSERT INTO categories (name, slug, description, image, sort_order) VALUES (?, ?, ?, ?, ?)"
  ).run(name, slug, description, image, sort_order);
  return NextResponse.json({ success: true }, { status: 201 });
}
