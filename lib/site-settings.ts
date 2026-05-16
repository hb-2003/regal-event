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
