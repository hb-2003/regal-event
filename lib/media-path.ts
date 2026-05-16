/** Paths stored in DB: local `/uploads/...` or HTTPS (e.g. Vercel Blob). */

export function isAllowedImagePath(value: string | null | undefined): boolean {
  const p = value?.trim() ?? "";
  if (!p) return false;
  if (p.startsWith("/uploads/")) return !p.includes("..");
  if (p.startsWith("https://")) {
    try {
      const u = new URL(p);
      return u.protocol === "https:" && Boolean(u.hostname);
    } catch {
      return false;
    }
  }
  return false;
}

export function isLocalUploadPath(value: string): boolean {
  return value.trim().startsWith("/uploads/");
}

export function isRemoteImagePath(value: string): boolean {
  return value.trim().startsWith("https://");
}
