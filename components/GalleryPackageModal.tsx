"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatGalleryPrice,
  isGalleryBookable,
  type GalleryPackageDto,
} from "@/lib/gallery";

type Props = {
  pkg: GalleryPackageDto;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function GalleryPackageModal({
  pkg,
  onClose,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const slides = [pkg.image_path, ...pkg.images.map((i) => i.image_path)];
  const [activeSlide, setActiveSlide] = useState(0);
  const price = formatGalleryPrice(pkg.price);
  const bookable = isGalleryBookable(pkg.availability_status);

  return (
    <div
      className="gallery-modal-backdrop on"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-modal-title"
    >
      <div
        className="gallery-modal-panel"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <button
          type="button"
          className="gallery-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="gallery-modal-grid">
          <div className="gallery-modal-media">
            <div className="gallery-modal-main-image">
              <Image
                src={slides[activeSlide]}
                alt={pkg.title || "Event setup"}
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            {slides.length > 1 && (
              <div className="gallery-modal-thumbs">
                {slides.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    className={`gallery-modal-thumb${activeSlide === i ? " active" : ""}`}
                    onClick={() => setActiveSlide(i)}
                  >
                    <Image src={src} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="gallery-modal-body">
            <div className="gallery-modal-badges">
              {pkg.is_popular && <span className="gallery-badge">Popular</span>}
              {pkg.is_trending && <span className="gallery-badge">Trending</span>}
              <span
                className={`gallery-badge gallery-badge--status gallery-badge--${pkg.availability_status.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {pkg.availability_status}
              </span>
            </div>

            <h2 id="gallery-modal-title" className="gallery-modal-title">
              {pkg.title || "Event setup"}
            </h2>
            {pkg.category && (
              <p className="gallery-modal-category">{pkg.category}</p>
            )}
            {price && <p className="gallery-modal-price">{price}</p>}

            {pkg.description && (
              <p className="gallery-modal-desc">{pkg.description}</p>
            )}

            {pkg.inclusions.length > 0 && (
              <div className="gallery-modal-inclusions">
                <p className="gallery-modal-inclusions-label">Package includes</p>
                <ul>
                  {pkg.inclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="gallery-modal-actions">
              <button
                type="button"
                className={`gallery-wishlist-btn${isFavorite ? " active" : ""}`}
                onClick={onToggleFavorite}
                aria-pressed={isFavorite}
              >
                {isFavorite ? "♥ Saved" : "♡ Save"}
              </button>
              {bookable ? (
                <Link
                  href={`/book?package=${pkg.id}`}
                  className="btn-gold gallery-modal-book"
                  onClick={onClose}
                >
                  <span>Book this setup →</span>
                </Link>
              ) : (
                <span className="gallery-modal-unavailable">
                  Not available for booking
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
