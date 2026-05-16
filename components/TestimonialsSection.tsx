"use client";

import { useEffect, useState } from "react";
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

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setReviews(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="container-x testimonials-inner">
        <header className="testimonials-header">
          <div className="s-label s-label-center reveal">Client Stories</div>
          <TextReveal as="h2" className="lux-title" delay={0.08}>
            Words of <em>Distinction</em>
          </TextReveal>
        </header>

        {loading ? (
          <div className="testimonials-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="review-card review-card--skeleton" aria-hidden />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="testimonials-empty reveal">
            Client stories will appear here shortly.
          </p>
        ) : (
          <div className="testimonials-grid">
            {reviews.map((t, i) => (
              <article
                key={t.id}
                className="review-card reveal"
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <div className="review-quote" aria-hidden>
                  &ldquo;
                </div>
                <Stars rating={t.rating} />
                <blockquote className="review-text">{t.review_text}</blockquote>
                {t.detail && <p className="review-detail">{t.detail}</p>}
                <footer className="review-footer">
                  <cite className="review-name">{t.client_name}</cite>
                  <span className="review-meta">
                    {t.event_title}, {t.event_year}
                    {t.client_location ? (
                      <>
                        {" "}
                        · {t.client_location}
                      </>
                    ) : null}
                  </span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
