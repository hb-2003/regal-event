import path from "path";
import fs from "fs";
import { put } from "@vercel/blob";

export type StoredImage = {
  /** Value to save in DB (path or public URL). */
  path: string;
};

/** Bracket access so Next.js does not inline `undefined` at build when the var is added later. */
function getBlobToken(): string | undefined {
  const token = process.env["BLOB_READ_WRITE_TOKEN"]?.trim();
  return token || undefined;
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

function blobOptions(token: string | undefined) {
  return {
    access: "public" as const,
    addRandomSuffix: false,
    ...(token ? { token } : {}),
  };
}

export async function storeUploadedImage(
  buffer: Buffer,
  folder: string,
  fileName: string
): Promise<StoredImage> {
  const key = `${folder}/${fileName}`;
  const onVercel = isVercelRuntime();
  const token = getBlobToken();

  if (onVercel || token) {
    try {
      const blob = await put(key, buffer, blobOptions(token));
      return { path: blob.url };
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      if (onVercel && !token) {
        throw new Error(
          `Vercel Blob upload failed (${detail}). In Vercel: Storage → Blob → link store to this project, confirm BLOB_READ_WRITE_TOKEN is set for Production, then redeploy.`
        );
      }
      throw new Error(`Vercel Blob upload failed: ${detail}`);
    }
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
    if (!isVercelRuntime() && !getBlobToken()) return;
    try {
      const { del } = await import("@vercel/blob");
      const token = getBlobToken();
      await del(p, token ? { token } : {});
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
