import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const YT_RE = /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i;

export async function GET() {
  const db = await getDb();
  const res = await db.execute({ sql: "SELECT * FROM videos ORDER BY created_at DESC LIMIT 200", args: [] });
  const videos = res.rows.map(row => {
    const obj: any = {};
    for (let i = 0; i < res.columns.length; i++) {
      obj[res.columns[i]] = row[i] ?? row[res.columns[i]];
    }
    return obj;
  });
  return NextResponse.json(videos);
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

  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO videos (title, youtube_url, description) VALUES (?, ?, ?)",
    args: [title, youtube_url, description]
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
