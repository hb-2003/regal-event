const STORAGE_KEY = "regal-gallery-wishlist";

export function getWishlistIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);
  } catch {
    return [];
  }
}

export function setWishlistIds(ids: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}

export function toggleWishlistId(id: number): number[] {
  const current = getWishlistIds();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  setWishlistIds(next);
  return next;
}
