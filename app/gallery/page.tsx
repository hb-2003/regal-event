"use client";

import { useEffect, useMemo, useState } from "react";
import StoredImage from "@/components/StoredImage";
import GalleryPackageModal from "@/components/GalleryPackageModal";
import {
  formatGalleryPrice,
  isGalleryBookable,
  type GalleryPackageDto,
} from "@/lib/gallery";
import { getWishlistIds, toggleWishlistId } from "@/lib/gallery-wishlist";

type Category = { name: string };

type FilterKey = "all" | "popular" | "trending" | "wishlist" | string;

export default function GalleryPage() {
  const [packages, setPackages] = useState<GalleryPackageDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<GalleryPackageDto | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    setWishlist(getWishlistIds());
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setCategories(d) : setCategories([])))
      .catch(() => setCategories([]));
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setPackages(d) : setPackages([])))
      .catch(() => setPackages([]));
  }, []);

  const filtered = useMemo(() => {
    if (active === "all") return packages;
    if (active === "popular") return packages.filter((p) => p.is_popular);
    if (active === "trending") return packages.filter((p) => p.is_trending);
    if (active === "wishlist") return packages.filter((p) => wishlist.includes(p.id));
    return packages.filter((p) => p.category === active);
  }, [packages, active, wishlist]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal,.gal-item").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [filtered]);

  function handleToggleFavorite(id: number) {
    setWishlist(toggleWishlistId(id));
  }

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">Bookable setups</div>
          <h1 className="page-hero-title">
            <span className="gold-shimmer">Gallery &amp; Packages</span>
          </h1>
          <p className="page-hero-sub">
            Browse our event designs, see pricing, and book your favourite setup directly
          </p>
        </div>
      </div>

      <section className="section-tight" style={{ background: "#011F23" }}>
        <div className="container-x" style={{ maxWidth: 1200, marginInline: "auto" }}>
          <div className="gallery-filter-row">
            {[
              { key: "all", label: "All setups" },
              { key: "popular", label: "Popular" },
              { key: "trending", label: "Trending" },
              { key: "wishlist", label: "Saved" },
              ...categories.map((c) => ({ key: c.name, label: c.name })),
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={`gallery-filter-tab${active === tab.key ? " active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 4rem)",
                  marginBottom: 20,
                  opacity: 0.2,
                  color: "#FCCD97",
                }}
              >
                ◈
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  color: "#F9F4EE",
                  marginBottom: 10,
                }}
              >
                {active === "wishlist" ? "No saved setups yet" : "No packages yet"}
              </h3>
              <p style={{ color: "rgba(249,244,238,.4)" }}>
                {active === "wishlist"
                  ? "Tap the heart on any setup to save it here."
                  : "Gallery packages will appear here once added in admin."}
              </p>
            </div>
          ) : (
            <div className="gallery-cols gallery-packages-grid">
              {filtered.map((pkg, i) => {
                const price = formatGalleryPrice(pkg.price);
                const bookable = isGalleryBookable(pkg.availability_status);
                return (
                  <article
                    key={pkg.id}
                    className="gal-item gallery-package-card"
                    style={{ transitionDelay: `${(i % 9) * 0.065}s` }}
                    onClick={() => setSelected(pkg)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(pkg);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <StoredImage
                      src={pkg.image_path}
                      alt={pkg.title || "Event setup"}
                      className="w-full h-auto"
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                    <div className="gal-veil">
                      <div className="gal-plus">+</div>
                    </div>
                    <div className="gallery-package-meta">
                      {(pkg.is_popular || pkg.is_trending) && (
                        <div className="gallery-package-tags">
                          {pkg.is_popular && <span>Popular</span>}
                          {pkg.is_trending && <span>Trending</span>}
                        </div>
                      )}
                      {pkg.title && (
                        <p className="gallery-package-title">{pkg.title}</p>
                      )}
                      {price && <p className="gallery-package-price">{price}</p>}
                      {!bookable && (
                        <p className="gallery-package-status">{pkg.availability_status}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`gallery-card-fav${wishlist.includes(pkg.id) ? " active" : ""}`}
                      aria-label={wishlist.includes(pkg.id) ? "Remove from saved" : "Save setup"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(pkg.id);
                      }}
                    >
                      {wishlist.includes(pkg.id) ? "♥" : "♡"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <GalleryPackageModal
          pkg={selected}
          onClose={() => setSelected(null)}
          isFavorite={wishlist.includes(selected.id)}
          onToggleFavorite={() => handleToggleFavorite(selected.id)}
        />
      )}
    </>
  );
}
