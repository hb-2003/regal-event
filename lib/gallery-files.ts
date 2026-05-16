import path from "path";
import fs from "fs";

export function unlinkUploadIfExists(imagePath: string): void {
  if (!imagePath.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", imagePath);
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  if (filePath.startsWith(uploadsRoot) && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("[gallery] unlink failed", err);
    }
  }
}
