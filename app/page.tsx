import HomePageClient from "@/components/HomePageClient";
import { getPublicSiteSettings } from "@/lib/public-settings";
import { resolveDisplayImageSrc } from "@/lib/media-path";
import {
  DEFAULT_HOME_MOSAIC,
  resolveHomeMosaicImages,
} from "@/lib/site-settings";

export default async function HomePage() {
  const settings = await getPublicSiteSettings();
  const initialMosaicImgs = resolveHomeMosaicImages(
    settings.home_hero_images,
    DEFAULT_HOME_MOSAIC
  ).map((src) => resolveDisplayImageSrc(src));

  return <HomePageClient initialMosaicImgs={initialMosaicImgs} />;
}
