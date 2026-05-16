"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TextReveal from "@/components/TextReveal";

export type PublicReview = {
  id: number;
  client_name: string;
  client_location: string | null;
  event_title: string;
  event_year: number;
  rating: number;
  review_text: string;
  detail: string | null;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "review-star is-on" : "review-star"}>
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewCard({
  review,
  index,
}: {
  review: PublicReview;
  index: number;
}) {
  return (
    <article
      className="review-card reveal"
      style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
    >
      <div className="review-quote" aria-hidden>
        &ldquo;
      </div>
      <Stars rating={review.rating} />
      <blockquote className="review-text">{review.review_text}</blockquote>
      {review.detail && <p className="review-detail">{review.detail}</p>}
      <footer className="review-footer">
        <cite className="review-name">{review.client_name}</cite>
        <span className="review-meta">
          {review.event_title}, {review.event_year}
          {review.client_location ? <> · {review.client_location}</> : null}
        </span>
      </footer>
    </article>
  );
}

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setReviews(Array.isArray(d) ? d : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const updateScrollHints = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollBack(el.scrollLeft > 8);
    setCanScrollForward(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || loading) return;
    updateScrollHints();
    el.addEventListener("scroll", updateScrollHints, { passive: true });
    window.addEventListener("resize", updateScrollHints);
    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      window.removeEventListener("resize", updateScrollHints);
    };
  }, [reviews, loading, updateScrollHints]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll("#testimonials .reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [reviews, loading]);

  const scrollTrack = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>(".review-card");
    const gap = 24;
    const step = firstCard
      ? firstCard.offsetWidth + gap
      : Math.max(el.clientWidth * 0.85, 280);
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="container-x testimonials-inner">
        <header className="testimonials-header">
          <div className="s-label s-label-center reveal">Client Stories</div>
          <TextReveal as="h2" className="lux-title" delay={0.08}>
            Words of <em>Distinction</em>
          </TextReveal>
          {!loading && reviews.length > 0 && (
            <p className="testimonials-hint reveal">
              Scroll horizontally to read more client stories
            </p>
          )}
        </header>

        {loading ? (
          <div
            className="testimonials-track testimonials-track--loading"
            aria-hidden
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="review-card review-card--skeleton" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="testimonials-empty reveal">
            Client stories will appear here shortly.
          </p>
        ) : (
          <div className="testimonials-carousel">
            <button
              type="button"
              className="testimonials-nav testimonials-nav--prev"
              onClick={() => scrollTrack(-1)}
              disabled={!canScrollBack}
              aria-label="Previous reviews"
            >
              ‹
            </button>

            <div
              ref={trackRef}
              className="testimonials-track admin-modal-scroll"
              data-lenis-prevent
              tabIndex={0}
              role="region"
              aria-label="Client reviews carousel"
            >
              {reviews.map((t, i) => (
                <ReviewCard key={t.id} review={t} index={i} />
              ))}
            </div>

            <button
              type="button"
              className="testimonials-nav testimonials-nav--next"
              onClick={() => scrollTrack(1)}
              disabled={!canScrollForward}
              aria-label="Next reviews"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
