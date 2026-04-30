import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const res =
    category && category !== "all"
      ? await db.execute({
          sql: "SELECT * FROM gallery WHERE category = ? ORDER BY sort_order ASC, created_at DESC LIMIT 500",
          args: [category]
        })
      : await db.execute({
          sql: "SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC LIMIT 500",
          args: []
        });

  const rows = res.rows.map(row => {
    const obj: any = {};
    for (let i = 0; i < res.columns.length; i++) {
      obj[res.columns[i]] = row[i] ?? row[res.columns[i]];
    }
    return obj;
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

  // Only allow paths the upload endpoint produces
  if (!image_path || !image_path.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Invalid image_path" }, { status: 400 });
  }

  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO gallery (title, category, image_path, sort_order) VALUES (?, ?, ?, ?)",
    args: [title, category, image_path, sort_order]
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
