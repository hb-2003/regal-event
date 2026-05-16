/** Shared category visuals for public pages (keyed by slug from DB). */

export const CATEGORY_GRADIENTS: Record<string, string> = {
  "baby-shower": "linear-gradient(135deg,#1a6b5c,#0d4a3e)",
  "baby-welcome": "linear-gradient(135deg,#2d5a6b,#1a3d4a)",
  "birthday-decoration": "linear-gradient(135deg,#6b3a1f,#3d1f0d)",
  "naming-ceremony": "linear-gradient(135deg,#4a2d6b,#2d1a4a)",
  "room-decoration": "linear-gradient(135deg,#1a4a6b,#0d2d4a)",
  "theme-decoration": "linear-gradient(135deg,#6b4a1a,#4a2d0d)",
  "haldi-ceremony": "linear-gradient(135deg,#6b5a1a,#4a3d0d)",
  "bride-to-be": "linear-gradient(135deg,#6b1a3a,#4a0d25)",
  engagement: "linear-gradient(135deg,#3a1a6b,#25104a)",
  "shop-inauguration": "linear-gradient(135deg,#1a5a3a,#0d3a25)",
  "corporate-event": "linear-gradient(135deg,#1a2d6b,#0d1a4a)",
  "surprise-planning": "linear-gradient(135deg,#5a1a6b,#3a0d4a)",
  anniversary: "linear-gradient(135deg,#6b1a1a,#4a0d0d)",
  "national-festival": "linear-gradient(135deg,#1a6b2d,#0d4a1a)",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "baby-shower": "♢",
  "baby-welcome": "✦",
  "birthday-decoration": "◈",
  "naming-ceremony": "✧",
  "room-decoration": "◇",
  "theme-decoration": "⬡",
  "haldi-ceremony": "◉",
  "bride-to-be": "❀",
  engagement: "♡",
  "shop-inauguration": "✦",
  "corporate-event": "◈",
  "surprise-planning": "♢",
  anniversary: "❀",
  "national-festival": "✧",
};

/** Default hero/card images until admin uploads custom ones. */
export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "baby-shower":
    "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
  "baby-welcome":
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  "birthday-decoration":
    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&q=80",
  "naming-ceremony":
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
  "room-decoration":
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
  "theme-decoration":
    "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=800&q=80",
  "haldi-ceremony":
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
  "bride-to-be":
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  engagement:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
  "shop-inauguration":
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  "corporate-event":
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  "surprise-planning":
    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&q=80",
  anniversary:
    "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
  "national-festival":
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
};

const FALLBACK_IMAGES = Object.values(DEFAULT_CATEGORY_IMAGES);

export function getCategoryIcon(slug: string, index = 0): string {
  return CATEGORY_ICONS[slug] ?? ["♢", "◈", "◇", "✦", "⬡", "◉"][index % 6];
}

export function getCategoryGradient(slug: string): string {
  return CATEGORY_GRADIENTS[slug] ?? "linear-gradient(135deg,#015961,#012D32)";
}

/** DB image, else slug default, else rotating fallback. */
export function resolveCategoryImage(
  slug: string,
  image: string | null | undefined,
  index = 0
): string {
  if (image?.trim()) return image.trim();
  return DEFAULT_CATEGORY_IMAGES[slug] ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}
