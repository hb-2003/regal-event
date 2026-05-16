import type { Gallery } from "@/server/database/entities/Gallery.entity";
import type { GalleryImage } from "@/server/database/entities/GalleryImage.entity";

export const GALLERY_AVAILABILITY = [
  "Available",
  "Limited",
  "Sold Out",
  "Unavailable",
] as const;

export type GalleryAvailability = (typeof GALLERY_AVAILABILITY)[number];

export type GalleryPackageDto = {
  id: number;
  title: string | null;
  category: string | null;
  image_path: string;
  description: string | null;
  price: string | null;
  guest_pricing_enabled: boolean;
  require_guest_count: boolean;
  base_guest_capacity: number | null;
  extra_guest_cost: string | null;
  availability_status: string;
  is_popular: boolean;
  is_trending: boolean;
  inclusions: string[];
  sort_order: number;
  created_at: string;
  images: { id: number; image_path: string; sort_order: number }[];
  blocked_dates?: string[];
};

export function parseInclusions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => String(x).trim())
      .filter(Boolean)
      .slice(0, 30);
  } catch {
    return [];
  }
}

export function stringifyInclusions(items: string[]): string | null {
  const cleaned = items.map((x) => x.trim()).filter(Boolean).slice(0, 30);
  return cleaned.length ? JSON.stringify(cleaned) : null;
}

export function serializeGalleryPackage(
  row: Gallery & { images?: GalleryImage[] }
): GalleryPackageDto {
  const extra = (row.images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      image_path: img.image_path,
      sort_order: img.sort_order,
    }));

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    image_path: row.image_path,
    description: row.description,
    price: row.price,
    guest_pricing_enabled: Boolean(row.guest_pricing_enabled),
    require_guest_count: Boolean(row.require_guest_count),
    base_guest_capacity: row.base_guest_capacity ?? null,
    extra_guest_cost:
      row.extra_guest_cost != null ? String(row.extra_guest_cost) : null,
    availability_status: row.availability_status || "Available",
    is_popular: Boolean(row.is_popular),
    is_trending: Boolean(row.is_trending),
    inclusions: parseInclusions(row.inclusions),
    sort_order: row.sort_order,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    images: extra,
  };
}

export function allGalleryImagePaths(pkg: GalleryPackageDto): string[] {
  const paths = [pkg.image_path, ...pkg.images.map((i) => i.image_path)];
  return [...new Set(paths.filter((p) => p.startsWith("/uploads/")))];
}

/** Display/storage-friendly UK price (adds £ when admin enters plain numbers). */
export function formatGalleryPrice(price: string | null): string | null {
  if (!price) return null;
  const t = price.trim();
  if (!t) return null;

  if (/£|gbp/i.test(t)) {
    return t.replace(/\bGBP\b/gi, "£").replace(/\s+/g, " ").trim();
  }

  const numericOnly = t.replace(/,/g, "");
  if (/^\d+(\.\d{1,2})?$/.test(numericOnly)) {
    const num = Number(numericOnly);
    if (Number.isNaN(num)) return t;
    const formatted = Number.isInteger(num)
      ? num.toLocaleString("en-GB")
      : num.toLocaleString("en-GB", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    return `£${formatted}`;
  }

  const leadingNumber = t.match(/^([\d,]+(?:\.\d{1,2})?)\s*(.*)$/);
  if (leadingNumber) {
    const num = Number(leadingNumber[1].replace(/,/g, ""));
    if (!Number.isNaN(num)) {
      const formatted = num.toLocaleString("en-GB");
      const suffix = leadingNumber[2].trim();
      return suffix ? `£${formatted} ${suffix}` : `£${formatted}`;
    }
  }

  return t;
}

export function buildGalleryBookingNotes(pkg: GalleryPackageDto): string {
  const lines = [
    `Selected gallery package: ${pkg.title || "Untitled setup"}`,
    pkg.price ? `Listed price: ${formatGalleryPrice(pkg.price) ?? pkg.price}` : null,
    pkg.description ? `Details: ${pkg.description}` : null,
    pkg.inclusions.length
      ? `Inclusions: ${pkg.inclusions.join(", ")}`
      : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function isGalleryBookable(status: string): boolean {
  return status === "Available" || status === "Limited";
}
