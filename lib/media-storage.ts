import path from "path";
import fs from "fs";
import { put } from "@vercel/blob";

export type StoredImage = {
  /** Value to save in DB (path or public URL). */
  path: string;
};

function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function storeUploadedImage(
  buffer: Buffer,
  folder: string,
  fileName: string
): Promise<StoredImage> {
  const key = `${folder}/${fileName}`;

  if (useBlobStorage()) {
    const blob = await put(key, buffer, {
      access: "public",
      addRandomSuffix: false,
    });
    return { path: blob.url };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "File uploads on Vercel require Vercel Blob. Add BLOB_READ_WRITE_TOKEN in Project → Storage → Blob, or link a Blob store to this project."
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  fs.writeFileSync(path.join(uploadDir, fileName), buffer);
  return { path: `/uploads/${folder}/${fileName}` };
}

export async function deleteStoredImageIfExists(
  imagePath: string | null | undefined
): Promise<void> {
  const p = imagePath?.trim() ?? "";
  if (!p) return;

  if (p.startsWith("https://")) {
    if (!useBlobStorage()) return;
    try {
      const { del } = await import("@vercel/blob");
      await del(p);
    } catch (err) {
      console.error("[media] blob delete failed", err);
    }
    return;
  }

  if (!p.startsWith("/uploads/") || p.includes("..")) return;

  const filePath = path.join(process.cwd(), "public", p);
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  if (filePath.startsWith(uploadsRoot) && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("[media] unlink failed", err);
    }
  }
}
