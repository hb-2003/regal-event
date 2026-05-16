import { In } from "typeorm";
import { getRepository } from "@/lib/db";
import { GalleryImage } from "@/server/database/entities/GalleryImage.entity";
import type { Gallery } from "@/server/database/entities/Gallery.entity";

export async function findGalleryImagesByGalleryId(
  galleryId: number
): Promise<GalleryImage[]> {
  const repo = await getRepository(GalleryImage);
  return repo.find({
    where: { gallery_id: galleryId },
    order: { sort_order: "ASC" },
  });
}

export async function imagesByGalleryIds(
  galleryIds: number[]
): Promise<Map<number, GalleryImage[]>> {
  const map = new Map<number, GalleryImage[]>();
  if (!galleryIds.length) return map;

  const repo = await getRepository(GalleryImage);
  const rows = await repo.find({
    where: { gallery_id: In(galleryIds) },
    order: { sort_order: "ASC" },
  });

  for (const img of rows) {
    const list = map.get(img.gallery_id) ?? [];
    list.push(img);
    map.set(img.gallery_id, list);
  }
  return map;
}

export function withGalleryImages(
  row: Gallery,
  images: GalleryImage[]
): Gallery & { images: GalleryImage[] } {
  return { ...row, images };
}

export async function attachGalleryImages(
  rows: Gallery[]
): Promise<Array<Gallery & { images: GalleryImage[] }>> {
  const map = await imagesByGalleryIds(rows.map((r) => r.id));
  return rows.map((row) => withGalleryImages(row, map.get(row.id) ?? []));
}
