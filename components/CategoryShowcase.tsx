"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import StoredImage from "@/components/StoredImage";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/TextReveal";
import Magnetic from "@/components/Magnetic";
import {
  getCategoryIcon,
  resolveCategoryImage,
} from "@/lib/category-display";

export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
};

type Props = {
  categories: CategoryItem[];
  loading?: boolean;
  /** Max cards on homepage; 0 = show all */
  limit?: number;
};

function CategoryCard({ cat, index }: { cat: CategoryItem; index: number }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const imgSrc = resolveCategoryImage(cat.slug, cat.image, index);

  useEffect(() => {
    const tilt = tiltRef.current;
    const shine = shineRef.current;
    if (!tilt) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.matchMedia("(hover: none)").matches) return;

    const rotX = gsap.quickTo(tilt, "rotateX", { duration: 0.55, ease: "power3.out" });
    const rotY = gsap.quickTo(tilt, "rotateY", { duration: 0.55, ease: "power3.out" });
    const scale = gsap.quickTo(tilt, "scale", { duration: 0.45, ease: "power2.out" });

    gsap.set(tilt, { transformPerspective: 900, transformStyle: "preserve-3d" });

    const onMove = (e: MouseEvent) => {
      const r = tilt.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      rotX(-dy * 8);
      rotY(dx * 8);
      scale(1.02);
      if (shine) gsap.to(shine, { xPercent: 120, duration: 0.9, ease: "power2.out" });
      if (imgRef.current) {
        gsap.to(imgRef.current, {
          x: dx * 12,
          y: dy * 8,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    };

    const onLeave = () => {
      rotX(0);
      rotY(0);
      scale(1);
      if (shine) gsap.set(shine, { xPercent: -120 });
      if (imgRef.current) gsap.to(imgRef.current, { x: 0, y: 0, duration: 0.7, ease: "power3.out" });
    };

    tilt.addEventListener("mousemove", onMove);
    tilt.addEventListener("mouseleave", onLeave);
    return () => {
      tilt.removeEventListener("mousemove", onMove);
      tilt.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="cat-grid__cell" data-cat-cell>
      <Link
        href={`/book?category=${cat.slug}`}
        className="cat-card"
        aria-label={`Book ${cat.name}`}
      >
        <div ref={tiltRef} className="cat-card__tilt">
          <div className="cat-card-frame" aria-hidden />
          <div ref={shineRef} className="cat-shine" aria-hidden />
          <div ref={imgRef} className="cat-bg">
            <StoredImage
              src={imgSrc}
              alt={cat.name}
              fill
              className="cat-bg-img"
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
            />
          </div>
          <div className="cat-darken" />
          <span className="cat-index" aria-hidden>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="cat-body">
            <span className="cat-icon">{getCategoryIcon(cat.slug, index)}</span>
            <div className="cat-name">{cat.name}</div>
            <p className="cat-desc">
              {cat.description || "Bespoke experiences crafted with precision and elegance."}
            </p>
            <span className="cat-cta">
              Reserve
              <span className="cat-cta-arrow" aria-hidden>
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="cat-grid__cell" aria-hidden>
      <div className="cat-card cat-card--skeleton">
        <div className="cat-skeleton-shimmer" />
        <div className="cat-skeleton-lines">
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default function CategoryShowcase({
  categories,
  loading = false,
  limit = 6,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const displayed = useMemo(
    () => (limit > 0 ? categories.slice(0, limit) : categories),
    [categories, limit]
  );

  useEffect(() => {
    if (loading || !gridRef.current) return;

    const cells = gridRef.current.querySelectorAll<HTMLElement>("[data-cat-cell]");
    if (!cells.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cells.forEach((el) => {
      el.style.opacity = "1";
      if (reduced) el.classList.add("is-visible");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );
    cells.forEach((el) => {
      if (!el.classList.contains("is-visible")) observer.observe(el);
    });

    if (reduced) {
      return () => observer.disconnect();
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      cells.forEach((cell) => {
        const bg = cell.querySelector<HTMLElement>(".cat-bg");
        if (!bg) return;
        gsap.fromTo(
          bg,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: cell,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      });
    }, sectionRef);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, [loading, displayed]);

  const skeletonCount = limit > 0 ? limit : 6;

  return (
    <section ref={sectionRef} id="expertise" className="expertise-section section">
      <div className="expertise-glow" aria-hidden />
      <div className="container-x expertise-inner">
        <header className="expertise-header">
          <div className="s-label reveal">Our Expertise</div>
          <TextReveal as="h2" className="lux-title" delay={0.08}>
            Crafted for Every <em>Occasion</em>
          </TextReveal>
          <p className="expertise-lead reveal reveal-delay-2">
            Six signature services — each orchestrated with the same uncompromising
            attention to detail.
          </p>
        </header>

        <div ref={gridRef} className="cat-grid">
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonCard key={`sk-${i}`} />
              ))
            : displayed.length === 0
              ? (
                <p className="expertise-empty">
                  Services are being curated. Please check back shortly.
                </p>
              )
              : displayed.map((cat, i) => (
                  <CategoryCard key={cat.id} cat={cat} index={i} />
                ))}
        </div>

        {!loading && displayed.length > 0 && (
          <div className="expertise-footer reveal">
            <Magnetic intensity={0.25}>
              <Link href="/categories" className="expertise-all-link">
                <span>Explore all services</span>
                <span className="expertise-all-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </Magnetic>
          </div>
        )}
      </div>
    </section>
  );
}
