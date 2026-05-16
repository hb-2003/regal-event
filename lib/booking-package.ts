import { getRepository } from "@/lib/db";
import { serializeGalleryPackage } from "@/lib/gallery";
import {
  buildQuoteAdminNote,
  calculatePackageQuote,
  type PackageQuote,
} from "@/lib/gallery-pricing";
import { Gallery } from "@/server/database/entities/Gallery.entity";
import type { GalleryPackageDto } from "@/lib/gallery";

export type ResolvedPackageBooking = {
  gallery_id: number;
  category: string;
  budget: string;
  guests: number | null;
  quote: PackageQuote;
  pkg: GalleryPackageDto;
  quoteAdminNote: string;
};

export async function resolvePackageBooking(
  galleryId: number,
  eventDate: string,
  guestCount: number | null | undefined,
  isAdmin: boolean
): Promise<{ ok: true; data: ResolvedPackageBooking } | { ok: false; error: string }> {
  const repo = await getRepository(Gallery);
  const row = await repo.findOne({
    where: { id: galleryId },
    relations: { images: true },
  });

  if (!row) {
    return { ok: false, error: "Selected package not found." };
  }

  const pkg = serializeGalleryPackage(row);

  if (pkg.availability_status === "Sold Out" || pkg.availability_status === "Unavailable") {
    return { ok: false, error: "This package is not available for booking." };
  }

  const quoteResult = calculatePackageQuote(pkg, guestCount);
  if ("error" in quoteResult) {
    return { ok: false, error: quoteResult.error };
  }

  const guests =
    pkg.require_guest_count || pkg.guest_pricing_enabled
      ? guestCount
      : guestCount ?? null;

  const quoteAdminNote = buildQuoteAdminNote(pkg, quoteResult, guests ?? null);

  return {
    ok: true,
    data: {
      gallery_id: galleryId,
      category: pkg.category || "Gallery Booking",
      budget: quoteResult.formattedTotal,
      guests: guests ?? null,
      quote: quoteResult,
      pkg,
      quoteAdminNote: isAdmin ? quoteAdminNote : "",
    },
  };
}
