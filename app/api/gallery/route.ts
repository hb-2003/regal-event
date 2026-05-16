import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import {
  formatGalleryPrice,
  GALLERY_AVAILABILITY,
  serializeGalleryPackage,
  stringifyInclusions,
} from "@/lib/gallery";
import { attachGalleryImages, findGalleryImagesByGalleryId, withGalleryImages } from "@/lib/gallery-images";
import { isAllowedImagePath } from "@/lib/media-path";
import { Gallery } from "@/server/database/entities/Gallery.entity";
import { GalleryImage } from "@/server/database/entities/GalleryImage.entity";
import { requireAdmin } from "@/lib/auth";
import { FindOptionsWhere } from "typeorm";

function parseBodyFields(body: Record<string, unknown>) {
  const title = body.title ? String(body.title).trim().slice(0, 200) : null;
  const category = body.category
    ? String(body.category).trim().slice(0, 80)
    : null;
  const image_path = String(body.image_path ?? "").trim();
  const description = body.description
    ? String(body.description).trim().slice(0, 2000)
    : null;
  const rawPrice = body.price ? String(body.price).trim().slice(0, 80) : null;
  const price = rawPrice ? formatGalleryPrice(rawPrice) : null;
  const availability_status = GALLERY_AVAILABILITY.includes(
    String(body.availability_status ?? "Available") as (typeof GALLERY_AVAILABILITY)[number]
  )
    ? String(body.availability_status)
    : "Available";
  const is_popular = Boolean(body.is_popular);
  const is_trending = Boolean(body.is_trending);
  const sort_order = Number.isFinite(Number(body.sort_order))
    ? Math.floor(Number(body.sort_order))
    : 0;

  let inclusions: string[] = [];
  if (Array.isArray(body.inclusions)) {
    inclusions = body.inclusions.map((x) => String(x).trim()).filter(Boolean);
  } else if (typeof body.inclusions === "string" && body.inclusions.trim()) {
    inclusions = body.inclusions
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  const extra_images = Array.isArray(body.extra_images)
    ? body.extra_images
        .map((x) => String(x).trim())
        .filter((p) => isAllowedImagePath(p))
        .slice(0, 12)
    : [];

  const guest_pricing_enabled = Boolean(body.guest_pricing_enabled);
  const require_guest_count = Boolean(body.require_guest_count);
  const base_guest_capacity =
    body.base_guest_capacity != null && body.base_guest_capacity !== ""
      ? Math.max(0, Math.floor(Number(body.base_guest_capacity)))
      : null;
  const extra_guest_cost =
    body.extra_guest_cost != null && String(body.extra_guest_cost).trim() !== ""
      ? String(body.extra_guest_cost).trim().slice(0, 20)
      : null;

  if (guest_pricing_enabled) {
    if (base_guest_capacity == null || base_guest_capacity < 1) {
      return { error: "Base guest capacity is required when guest pricing is enabled." };
    }
    if (!extra_guest_cost || Number(extra_guest_cost) < 0) {
      return { error: "Extra guest cost is required when guest pricing is enabled." };
    }
  }

  return {
    title,
    category,
    image_path,
    description,
    price,
    guest_pricing_enabled,
    require_guest_count,
    base_guest_capacity: guest_pricing_enabled ? base_guest_capacity : null,
    extra_guest_cost: guest_pricing_enabled ? extra_guest_cost : null,
    availability_status,
    is_popular,
    is_trending,
    inclusions: stringifyInclusions(inclusions),
    sort_order,
    extra_images,
  };
}

export async function GET(request: NextRequest) {
  const repo = await getRepository(Gallery);
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const popular = searchParams.get("popular") === "1";
  const trending = searchParams.get("trending") === "1";

  const where: FindOptionsWhere<Gallery> = {};
  if (category && category !== "all") {
    where.category = category;
  }
  if (popular) where.is_popular = true;
  if (trending) where.is_trending = true;

  const rows = await repo.find({
    where: Object.keys(where).length ? where : undefined,
    order: { sort_order: "ASC", created_at: "DESC" },
    take: 500,
  });

  const withImages = await attachGalleryImages(rows);
  return NextResponse.json(withImages.map(serializeGalleryPackage));
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fields = parseBodyFields(body);
  if ("error" in fields) {
    return NextResponse.json({ error: fields.error }, { status: 400 });
  }
  if (!fields.image_path || !isAllowedImagePath(fields.image_path)) {
    return NextResponse.json({ error: "Invalid image_path" }, { status: 400 });
  }

  const galleryRepo = await getRepository(Gallery);
  const imageRepo = await getRepository(GalleryImage);

  const saved = await galleryRepo.save(
    galleryRepo.create({
      title: fields.title,
      category: fields.category,
      image_path: fields.image_path,
      description: fields.description,
      price: fields.price,
      guest_pricing_enabled: fields.guest_pricing_enabled,
      require_guest_count: fields.require_guest_count,
      base_guest_capacity: fields.base_guest_capacity,
      extra_guest_cost: fields.extra_guest_cost,
      availability_status: fields.availability_status,
      is_popular: fields.is_popular,
      is_trending: fields.is_trending,
      inclusions: fields.inclusions,
      sort_order: fields.sort_order,
    })
  );

  if (fields.extra_images.length) {
    await imageRepo.save(
      fields.extra_images.map((image_path, i) =>
        imageRepo.create({
          gallery_id: saved.id,
          image_path,
          sort_order: i + 1,
        })
      )
    );
  }

  const images = await findGalleryImagesByGalleryId(saved.id);

  return NextResponse.json(
    serializeGalleryPackage(withGalleryImages(saved, images)),
    { status: 201 }
  );
}
