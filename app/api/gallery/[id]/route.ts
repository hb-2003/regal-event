import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import {
  formatGalleryPrice,
  GALLERY_AVAILABILITY,
  serializeGalleryPackage,
  stringifyInclusions,
} from "@/lib/gallery";
import { unlinkUploadIfExists } from "@/lib/gallery-files";
import { Gallery } from "@/server/database/entities/Gallery.entity";
import { GalleryImage } from "@/server/database/entities/GalleryImage.entity";
import { requireAdmin } from "@/lib/auth";

function parsePatchFields(body: Record<string, unknown>) {
  const fields: Partial<{
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
    inclusions: string | null;
    sort_order: number;
    extra_images: string[];
  }> = {};

  if (body.title !== undefined) {
    fields.title = body.title ? String(body.title).trim().slice(0, 200) : null;
  }
  if (body.category !== undefined) {
    fields.category = body.category
      ? String(body.category).trim().slice(0, 80)
      : null;
  }
  if (body.image_path !== undefined) {
    const image_path = String(body.image_path).trim();
    if (!image_path.startsWith("/uploads/")) {
      return { error: "Invalid image_path" as const };
    }
    fields.image_path = image_path;
  }
  if (body.description !== undefined) {
    fields.description = body.description
      ? String(body.description).trim().slice(0, 2000)
      : null;
  }
  if (body.price !== undefined) {
    const raw = body.price ? String(body.price).trim().slice(0, 80) : null;
    fields.price = raw ? formatGalleryPrice(raw) : null;
  }
  if (body.availability_status !== undefined) {
    const s = String(body.availability_status);
    fields.availability_status = GALLERY_AVAILABILITY.includes(
      s as (typeof GALLERY_AVAILABILITY)[number]
    )
      ? s
      : "Available";
  }
  if (body.is_popular !== undefined) fields.is_popular = Boolean(body.is_popular);
  if (body.is_trending !== undefined) fields.is_trending = Boolean(body.is_trending);
  if (body.sort_order !== undefined) {
    fields.sort_order = Number.isFinite(Number(body.sort_order))
      ? Math.floor(Number(body.sort_order))
      : 0;
  }
  if (body.inclusions !== undefined) {
    let items: string[] = [];
    if (Array.isArray(body.inclusions)) {
      items = body.inclusions.map((x) => String(x).trim()).filter(Boolean);
    } else if (typeof body.inclusions === "string") {
      items = body.inclusions
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
    }
    fields.inclusions = stringifyInclusions(items);
  }
  if (body.extra_images !== undefined) {
    fields.extra_images = Array.isArray(body.extra_images)
      ? body.extra_images
          .map((x) => String(x).trim())
          .filter((p) => p.startsWith("/uploads/"))
          .slice(0, 12)
      : [];
  }
  if (body.guest_pricing_enabled !== undefined) {
    fields.guest_pricing_enabled = Boolean(body.guest_pricing_enabled);
  }
  if (body.require_guest_count !== undefined) {
    fields.require_guest_count = Boolean(body.require_guest_count);
  }
  if (body.base_guest_capacity !== undefined) {
    fields.base_guest_capacity =
      body.base_guest_capacity != null && body.base_guest_capacity !== ""
        ? Math.max(0, Math.floor(Number(body.base_guest_capacity)))
        : null;
  }
  if (body.extra_guest_cost !== undefined) {
    fields.extra_guest_cost =
      body.extra_guest_cost != null && String(body.extra_guest_cost).trim() !== ""
        ? String(body.extra_guest_cost).trim().slice(0, 20)
        : null;
  }

  return { fields };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const repo = await getRepository(Gallery);
  const row = await repo.findOne({
    where: { id: Number(id) },
    relations: { images: true },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeGalleryPackage(row));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const galleryId = Number(id);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parsePatchFields(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const galleryRepo = await getRepository(Gallery);
  const imageRepo = await getRepository(GalleryImage);

  const existing = await galleryRepo.findOne({
    where: { id: galleryId },
    relations: { images: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { extra_images, ...galleryFields } = parsed.fields;
  if (Object.keys(galleryFields).length) {
    await galleryRepo.update(galleryId, galleryFields);
  }

  if (extra_images !== undefined) {
    for (const img of existing.images ?? []) {
      unlinkUploadIfExists(img.image_path);
    }
    await imageRepo.delete({ gallery_id: galleryId });
    if (extra_images.length) {
      await imageRepo.save(
        extra_images.map((image_path, i) =>
          imageRepo.create({
            gallery_id: galleryId,
            image_path,
            sort_order: i + 1,
          })
        )
      );
    }
  }

  const updated = await galleryRepo.findOne({
    where: { id: galleryId },
    relations: { images: true },
  });

  return NextResponse.json(
    updated ? serializeGalleryPackage(updated) : { success: true }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const galleryId = Number(id);
  const galleryRepo = await getRepository(Gallery);
  const row = await galleryRepo.findOne({
    where: { id: galleryId },
    relations: { images: true },
  });

  if (!row) return NextResponse.json({ success: true });

  unlinkUploadIfExists(row.image_path);
  for (const img of row.images ?? []) {
    unlinkUploadIfExists(img.image_path);
  }

  await galleryRepo.delete(galleryId);
  return NextResponse.json({ success: true });
}
