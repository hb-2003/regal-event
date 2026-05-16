"use client";

import {
  calculatePackageQuote,
  formatMoneyAmount,
  parseExtraGuestCost,
  type PackageQuote,
} from "@/lib/gallery-pricing";
import { formatGalleryPrice, type GalleryPackageDto } from "@/lib/gallery";

type Props = {
  pkg: GalleryPackageDto;
  guestCount: string;
  variant?: "lux" | "admin";
};

export function usePackageQuote(
  pkg: GalleryPackageDto | null,
  guestCount: string
): PackageQuote | null {
  if (!pkg) return null;
  const guests = guestCount ? Number(guestCount) : null;
  const result = calculatePackageQuote(
    pkg,
    guests != null && !Number.isNaN(guests) ? guests : null
  );
  if ("error" in result) return null;
  return result;
}

export default function PackageBookingSummary({
  pkg,
  guestCount,
  variant = "lux",
}: Props) {
  const quote = usePackageQuote(pkg, guestCount);
  const isAdmin = variant === "admin";

  const rowStyle = isAdmin
    ? { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#444" }
    : { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "rgba(249,244,238,.65)" };

  const boxStyle = isAdmin
    ? {
        padding: 16,
        borderRadius: 8,
        border: "1px solid #EDE5D8",
        backgroundColor: "#F9F4EE",
      }
    : {
        padding: 16,
        border: "1px solid rgba(252,205,151,.15)",
        backgroundColor: "rgba(1,89,97,.12)",
      };

  const extraPerGuest = parseExtraGuestCost(pkg.extra_guest_cost);

  return (
    <div style={boxStyle}>
      <p
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          marginBottom: 12,
          color: isAdmin ? "#888" : "rgba(249,244,238,.45)",
        }}
      >
        Package pricing
      </p>

      {pkg.guest_pricing_enabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {pkg.base_guest_capacity != null && (
            <div style={rowStyle}>
              <span>Base capacity</span>
              <span>{pkg.base_guest_capacity} guests</span>
            </div>
          )}
          {extraPerGuest != null && (
            <div style={rowStyle}>
              <span>Extra guest cost</span>
              <span>{formatMoneyAmount(extraPerGuest)}/person</span>
            </div>
          )}
        </div>
      )}

      {quote ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={rowStyle}>
            <span>Base package</span>
            <span>{quote.formattedBase}</span>
          </div>
          {quote.extraGuests > 0 && (
            <div style={rowStyle}>
              <span>Additional ({quote.extraGuests} extra guests)</span>
              <span>{quote.formattedExtraCost}</span>
            </div>
          )}
          <div
            style={{
              ...rowStyle,
              paddingTop: 10,
              borderTop: isAdmin
                ? "1px solid #EDE5D8"
                : "1px solid rgba(252,205,151,.12)",
              fontWeight: 600,
              color: isAdmin ? "#012D32" : "#FCCD97",
              fontSize: "1rem",
            }}
          >
            <span>Estimated total</span>
            <span>{quote.formattedTotal}</span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: "0.85rem", color: isAdmin ? "#888" : "rgba(249,244,238,.5)" }}>
          Base price: {formatGalleryPrice(pkg.price) ?? "—"}
        </p>
      )}
    </div>
  );
}
