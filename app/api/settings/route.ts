import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Setting } from "@/server/database/entities/Setting.entity";
import { requireAdmin } from "@/lib/auth";
import { isAllowedImagePath, resolveDisplayImageSrc } from "@/lib/media-path";
import {
  ALL_SETTING_KEYS,
  CONTACT_SETTING_KEYS,
  normalizeHomeHeroImages,
  parseHomeHeroImages,
  serializeSocialLinks,
  type SettingKey,
} from "@/lib/site-settings";

function isAllowedKey(key: string): key is SettingKey {
  return (ALL_SETTING_KEYS as readonly string[]).includes(key);
}

function isContactKey(key: string): boolean {
  return (CONTACT_SETTING_KEYS as readonly string[]).includes(key);
}

function serializeSettingValue(
  key: SettingKey,
  value: unknown
): string | null {
  if (key === "about_hero_image") {
    if (typeof value !== "string" || !value.trim()) return null;
    const url = value.trim().slice(0, 2000);
    if (!isAllowedImagePath(url)) return null;
    return url;
  }

  if (key === "home_hero_images") {
    const images = Array.isArray(value)
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

    if (!Array.isArray(images)) return null;

    const slots = normalizeHomeHeroImages(images).map((u) => u.trim().slice(0, 2000));
    if (slots.some((u) => u && !isAllowedImagePath(u))) return null;

    return JSON.stringify(slots);
  }

  if (key === "social_links") {
    return serializeSocialLinks(value);
  }

  if (isContactKey(key)) {
    if (typeof value !== "string" || !value.trim()) return null;
    return value.trim().slice(0, 2000);
  }

  return null;
}

export async function GET() {
  const repo = await getRepository(Setting);
  const rows = await repo.find();

  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  if (settings.about_hero_image?.trim()) {
    settings.about_hero_image = resolveDisplayImageSrc(settings.about_hero_image);
  }
  if (settings.home_hero_images) {
    const slots = parseHomeHeroImages(settings.home_hero_images).map((src) =>
      src.trim() ? resolveDisplayImageSrc(src) : ""
    );
    settings.home_hero_images = JSON.stringify(slots);
  }

  return NextResponse.json(settings, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const repo = await getRepository(Setting);

  for (const [key, value] of Object.entries(body)) {
    if (!isAllowedKey(key)) {
      return NextResponse.json({ error: `Unknown setting: ${key}` }, { status: 400 });
    }

    const stored = serializeSettingValue(key, value);
    if (stored === null) {
      return NextResponse.json(
        { error: `Invalid value for ${key}` },
        { status: 400 }
      );
    }

    await repo.upsert({ key, value: stored }, ["key"]);
  }

  return NextResponse.json({ success: true });
}
