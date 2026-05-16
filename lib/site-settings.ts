/** Public site contact & footer content (stored in `settings` table). */

export type SocialLink = {
  abbr: string;
  label: string;
  href: string;
};

export const CONTACT_SETTING_KEYS = [
  "contact_address",
  "contact_phone",
  "contact_email",
  "contact_hours",
  "footer_tagline",
  "social_links",
] as const;

export const IMAGE_SETTING_KEYS = ["home_hero_images", "about_hero_image"] as const;

export const HOME_HERO_IMAGE_COUNT = 5;

/** Ensure exactly 5 string URLs (empty string when missing). */
export function normalizeHomeHeroImages(raw: unknown): string[] {
  const slots = Array.from({ length: HOME_HERO_IMAGE_COUNT }, () => "");
  if (!Array.isArray(raw)) return slots;
  for (let i = 0; i < HOME_HERO_IMAGE_COUNT; i++) {
    const v = raw[i];
    slots[i] = v == null ? "" : String(v);
  }
  return slots;
}

export function parseHomeHeroImages(
  raw: string | string[] | undefined | null
): string[] {
  const empty = Array.from({ length: HOME_HERO_IMAGE_COUNT }, () => "");
  if (raw == null) return empty;
  if (Array.isArray(raw)) return normalizeHomeHeroImages(raw);
  if (typeof raw !== "string" || !raw.trim()) return empty;
  try {
    return normalizeHomeHeroImages(JSON.parse(raw));
  } catch {
    return empty;
  }
}

/** Home mosaic: use saved uploads when present, otherwise fall back to defaults. */
export function resolveHomeMosaicImages(
  raw: string | string[] | undefined | null,
  defaults: readonly string[]
): string[] {
  const slots = parseHomeHeroImages(raw);
  const hasCustom = slots.some((src) => src.trim().length > 0);
  if (!hasCustom) return [...defaults];
  return slots.map((src, i) => {
    const trimmed = src.trim();
    return trimmed || defaults[i] || defaults[0];
  });
}

export const DEFAULT_HOME_MOSAIC = [
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
] as const;

export const DEFAULT_HERO_TEXTURE =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80";

export const ALL_SETTING_KEYS = [
  ...IMAGE_SETTING_KEYS,
  ...CONTACT_SETTING_KEYS,
] as const;

export type ContactSettingKey = (typeof CONTACT_SETTING_KEYS)[number];
export type ImageSettingKey = (typeof IMAGE_SETTING_KEYS)[number];
export type SettingKey = (typeof ALL_SETTING_KEYS)[number];

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { abbr: "in", label: "LinkedIn", href: "https://www.linkedin.com/" },
  { abbr: "ig", label: "Instagram", href: "https://www.instagram.com/" },
  { abbr: "tw", label: "Twitter", href: "https://twitter.com/" },
  { abbr: "wa", label: "WhatsApp", href: "https://wa.me/447700000000" },
];

export const DEFAULT_SITE_CONTACT = {
  address: "London, United Kingdom",
  phone: "+44 7700 000 000",
  email: "info@regalevent.co.uk",
  hours: "Mon–Sat · 9am–8pm",
  tagline:
    "Crafting extraordinary celebrations with unparalleled elegance and meticulous care since 2019.",
};

export function phoneToTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

export function emailToMailtoHref(email: string): string {
  return email.trim() ? `mailto:${email.trim()}` : "";
}

export function parseSocialLinks(raw: string | undefined): SocialLink[] {
  if (!raw?.trim()) return DEFAULT_SOCIAL_LINKS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_SOCIAL_LINKS;
    const links = parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const o = item as Record<string, unknown>;
        const abbr = String(o.abbr ?? "").trim().slice(0, 8);
        const label = String(o.label ?? "").trim().slice(0, 80);
        const href = String(o.href ?? "").trim().slice(0, 500);
        if (!abbr || !label || !href) return null;
        return { abbr, label, href };
      })
      .filter((x): x is SocialLink => x !== null);
    return links.length > 0 ? links.slice(0, 8) : DEFAULT_SOCIAL_LINKS;
  } catch {
    return DEFAULT_SOCIAL_LINKS;
  }
}

export function serializeSocialLinks(value: unknown): string | null {
  const arr = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })()
      : null;
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const links: SocialLink[] = [];
  for (const item of arr.slice(0, 8)) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const abbr = String(o.abbr ?? "").trim().slice(0, 8);
    const label = String(o.label ?? "").trim().slice(0, 80);
    const href = String(o.href ?? "").trim().slice(0, 500);
    if (!abbr || !label || !href) continue;
    links.push({ abbr, label, href });
  }
  return links.length > 0 ? JSON.stringify(links) : null;
}

export function parseSiteContact(settings: Record<string, string>) {
  return {
    address: settings.contact_address?.trim() || DEFAULT_SITE_CONTACT.address,
    phone: settings.contact_phone?.trim() || DEFAULT_SITE_CONTACT.phone,
    email: settings.contact_email?.trim() || DEFAULT_SITE_CONTACT.email,
    hours: settings.contact_hours?.trim() || DEFAULT_SITE_CONTACT.hours,
    tagline: settings.footer_tagline?.trim() || DEFAULT_SITE_CONTACT.tagline,
    socialLinks: parseSocialLinks(settings.social_links),
  };
}

export const CONTACT_DEFAULTS: { key: ContactSettingKey; value: string }[] = [
  { key: "contact_address", value: DEFAULT_SITE_CONTACT.address },
  { key: "contact_phone", value: DEFAULT_SITE_CONTACT.phone },
  { key: "contact_email", value: DEFAULT_SITE_CONTACT.email },
  { key: "contact_hours", value: DEFAULT_SITE_CONTACT.hours },
  { key: "footer_tagline", value: DEFAULT_SITE_CONTACT.tagline },
  { key: "social_links", value: JSON.stringify(DEFAULT_SOCIAL_LINKS) },
];
