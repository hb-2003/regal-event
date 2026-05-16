import { formatGalleryPrice, type GalleryPackageDto } from "@/lib/gallery";

export type PackageQuote = {
  baseAmount: number;
  extraGuests: number;
  extraCost: number;
  total: number;
  formattedTotal: string;
  formattedBase: string;
  formattedExtraCost: string;
};

export type PackageQuoteError = {
  error: string;
};

/** Parse stored price string to numeric GBP amount. */
export function parsePriceAmount(price: string | null | undefined): number | null {
  if (!price) return null;
  const t = price.trim();
  if (!t) return null;

  const cleaned = t.replace(/£|gbp/gi, "").replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

export function parseExtraGuestCost(
  cost: string | number | null | undefined
): number | null {
  if (cost == null || cost === "") return null;
  const num = typeof cost === "number" ? cost : Number(String(cost).replace(/,/g, ""));
  return Number.isFinite(num) && num >= 0 ? num : null;
}

export function formatMoneyAmount(amount: number): string {
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString("en-GB")
    : amount.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `£${formatted}`;
}

export function calculatePackageQuote(
  pkg: Pick<
    GalleryPackageDto,
    | "price"
    | "guest_pricing_enabled"
    | "require_guest_count"
    | "base_guest_capacity"
    | "extra_guest_cost"
  >,
  guestCount?: number | null
): PackageQuote | PackageQuoteError {
  const baseAmount = parsePriceAmount(pkg.price);
  if (baseAmount == null) {
    return { error: "Package has no valid base price configured." };
  }

  const needsGuests = pkg.require_guest_count || pkg.guest_pricing_enabled;
  if (needsGuests && (guestCount == null || guestCount < 1)) {
    return { error: "Please enter a valid guest count." };
  }

  const guests = guestCount ?? 0;
  let extraGuests = 0;
  let extraCost = 0;

  if (pkg.guest_pricing_enabled) {
    const capacity = pkg.base_guest_capacity ?? 0;
    const perGuest = parseExtraGuestCost(pkg.extra_guest_cost);
    if (perGuest == null) {
      return { error: "Package guest pricing is not configured correctly." };
    }
    if (guests > capacity) {
      extraGuests = guests - capacity;
      extraCost = extraGuests * perGuest;
    }
  }

  const total = baseAmount + extraCost;

  return {
    baseAmount,
    extraGuests,
    extraCost,
    total,
    formattedTotal: formatMoneyAmount(total),
    formattedBase: formatMoneyAmount(baseAmount),
    formattedExtraCost: formatMoneyAmount(extraCost),
  };
}

export function buildQuoteAdminNote(
  pkg: GalleryPackageDto,
  quote: PackageQuote,
  guests: number | null
): string {
  const lines = [
    `Package: ${pkg.title || "Untitled"} (ID ${pkg.id})`,
    `Quote: ${quote.formattedBase} base`,
  ];
  if (quote.extraGuests > 0) {
    lines.push(
      `+ ${quote.extraGuests} extra guests @ ${formatGalleryPrice(pkg.extra_guest_cost) ?? pkg.extra_guest_cost}/guest = ${quote.formattedExtraCost}`
    );
  }
  if (guests != null) {
    lines.push(`Guest count: ${guests}`);
  }
  lines.push(`Estimated total: ${quote.formattedTotal}`);
  return lines.join("\n");
}
