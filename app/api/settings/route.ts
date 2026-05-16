import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Setting } from "@/server/database/entities/Setting.entity";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_KEYS = ["home_hero_images", "about_hero_image"] as const;
type SettingKey = (typeof ALLOWED_KEYS)[number];

function isAllowedKey(key: string): key is SettingKey {
  return (ALLOWED_KEYS as readonly string[]).includes(key);
}

function serializeSettingValue(
  key: SettingKey,
  value: unknown
): string | null {
  if (key === "about_hero_image") {
    if (typeof value !== "string" || !value.trim()) return null;
    return value.trim().slice(0, 2000);
  }

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

  if (!Array.isArray(images) || images.length !== 5) return null;
  if (!images.every((u) => typeof u === "string" && u.trim())) return null;

  return JSON.stringify(images.map((u) => String(u).trim().slice(0, 2000)));
}

export async function GET() {
  const repo = await getRepository(Setting);
  const rows = await repo.find();

  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(settings);
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
