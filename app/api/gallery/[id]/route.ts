import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import path from "path";
import fs from "fs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const db = getDb();
  const row = db
    .prepare("SELECT image_path FROM gallery WHERE id = ?")
    .get(Number(id)) as { image_path: string } | undefined;

  if (!row) return NextResponse.json({ success: true });

  // Only delete files that live under public/uploads (defense-in-depth)
  if (row.image_path.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", row.image_path);
    const uploadsRoot = path.join(process.cwd(), "public", "uploads");
    if (filePath.startsWith(uploadsRoot) && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("[gallery] unlink failed", err);
      }
    }
  }

  db.prepare("DELETE FROM gallery WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
