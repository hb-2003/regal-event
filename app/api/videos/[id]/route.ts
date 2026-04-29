import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const YT_RE = /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM videos WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
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

  const title = String(body.title ?? "").trim().slice(0, 200);
  const youtube_url = String(body.youtube_url ?? "").trim().slice(0, 500);
  const description = body.description
    ? String(body.description).trim().slice(0, 2000)
    : null;

  if (!title || !youtube_url) {
    return NextResponse.json(
      { error: "Title and URL required" },
      { status: 400 }
    );
  }
  if (!YT_RE.test(youtube_url)) {
    return NextResponse.json(
      { error: "Only YouTube URLs are allowed" },
      { status: 400 }
    );
  }

  const db = getDb();
  db.prepare(
    "UPDATE videos SET title = ?, youtube_url = ?, description = ? WHERE id = ?"
  ).run(title, youtube_url, description, Number(id));
  return NextResponse.json({ success: true });
}
