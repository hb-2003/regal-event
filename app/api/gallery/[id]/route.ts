import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Gallery } from "@/server/database/entities/Gallery.entity";
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
  const repo = await getRepository(Gallery);
  const row = await repo.findOneBy({ id: Number(id) });

  if (!row) return NextResponse.json({ success: true });

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

  await repo.delete(Number(id));
  return NextResponse.json({ success: true });
}
