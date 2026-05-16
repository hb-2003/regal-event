/** Paths stored in DB: local `/uploads/...`, HTTPS blob URLs, or `/api/media?pathname=...`. */

const MEDIA_PROXY_PREFIX = "/api/media?pathname=";

export function isMediaProxyPath(value: string): boolean {
  return value.trim().startsWith(MEDIA_PROXY_PREFIX);
}

export function isPrivateBlobUrl(value: string): boolean {
  const p = value.trim();
  if (!p.startsWith("https://")) return false;
  try {
    return new URL(p).hostname.endsWith(".private.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Blob object key (e.g. `gallery/123.jpg`) from a stored path or private blob URL. */
export function blobPathnameFromStored(value: string): string | null {
  const p = value.trim();
  if (!p) return null;

  if (isMediaProxyPath(p)) {
    const encoded = p.slice(MEDIA_PROXY_PREFIX.length);
    try {
      const pathname = decodeURIComponent(encoded);
      if (!pathname || pathname.includes("..")) return null;
      return pathname;
    } catch {
      return null;
    }
  }

  if (isPrivateBlobUrl(p)) {
    try {
      const pathname = new URL(p).pathname.replace(/^\//, "");
      if (!pathname || pathname.includes("..")) return null;
      return pathname;
    } catch {
      return null;
    }
  }

  return null;
}

/** URL safe to use in `<img>` / `next/image` (proxies private blobs). */
export function resolveDisplayImageSrc(stored: string): string {
  const p = stored.trim();
  if (!p) return p;
  const pathname = blobPathnameFromStored(p);
  if (pathname) {
    return `${MEDIA_PROXY_PREFIX}${encodeURIComponent(pathname)}`;
  }
  return p;
}

export function isAllowedImagePath(value: string | null | undefined): boolean {
  const p = value?.trim() ?? "";
  if (!p) return false;
  if (p.startsWith("/uploads/")) return !p.includes("..");
  if (isMediaProxyPath(p)) return blobPathnameFromStored(p) !== null;
  if (isPrivateBlobUrl(p)) return blobPathnameFromStored(p) !== null;
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
  const p = value.trim();
  return p.startsWith("https://") && !isPrivateBlobUrl(p);
}

export function shouldUseNativeImg(value: string): boolean {
  const p = value.trim();
  return (
    isLocalUploadPath(p) ||
    isRemoteImagePath(p) ||
    isMediaProxyPath(p) ||
    isPrivateBlobUrl(p)
  );
}
