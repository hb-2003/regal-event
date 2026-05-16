import { getRepository } from "@/lib/db";
import { Setting } from "@/server/database/entities/Setting.entity";
import { parseHomeHeroImages } from "@/lib/site-settings";

export type PublicSiteSettings = {
  home_hero_images: string | undefined;
  about_hero_image: string | undefined;
};

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const repo = await getRepository(Setting);
  const rows = await repo.find();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return {
    home_hero_images: map.home_hero_images,
    about_hero_image: map.about_hero_image,
  };
}

export function getHomeHeroSlotsFromSettings(
  settings: PublicSiteSettings
): string[] {
  return parseHomeHeroImages(settings.home_hero_images);
}
