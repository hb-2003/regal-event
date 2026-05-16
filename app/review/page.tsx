"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type InviteInfo = {
  booking_id: string;
  full_name: string;
  category: string;
  event_date: string;
  event_title: string;
  event_year: number;
};

function ReviewForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!token) {
      setLoadError("Missing review link. Please use the link from your email.");
      setLoading(false);
      return;
    }
    fetch(`/api/reviews/invite?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Invalid link");
        setInvite(data);
      })
      .catch((e) => setLoadError(e.message || "Could not load review form"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          review_text: reviewText,
          detail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="review-page-card">
        <p style={{ color: "rgba(249,244,238,.5)" }}>Loading your review form…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="review-page-card">
        <h1 className="review-page-title">Review Link Invalid</h1>
        <p className="review-page-lead">{loadError}</p>
        <Link href="/contact" className="btn-gold" style={{ marginTop: 24, display: "inline-block" }}>
          Contact Us
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="review-page-card review-page-card--success">
        <h1 className="review-page-title">Thank You</h1>
        <p className="review-page-lead">
          Your review has been received. Our team will moderate it shortly — once approved,
          it will appear on our website.
        </p>
        <Link href="/" className="btn-gold" style={{ marginTop: 28, display: "inline-block" }}>
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="review-page-card">
      <p className="s-label" style={{ marginBottom: 12 }}>
        Share Your Experience
      </p>
      <h1 className="review-page-title">Dear {invite?.full_name}</h1>
      <p className="review-page-lead">
        We hope your <strong>{invite?.category}</strong> on{" "}
        <strong>{invite?.event_date}</strong> was extraordinary. Your words mean the world
        to us.
      </p>

      <form onSubmit={handleSubmit} className="review-form">
        <label className="review-label">
          Overall rating
          <div className="review-rating-input">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={n <= rating ? "review-rating-btn is-on" : "review-rating-btn"}
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </label>

        <div className="review-readonly-field" aria-readonly="true">
          <span className="review-label" style={{ marginBottom: 8 }}>
            Event
          </span>
          <p className="review-readonly-value">{invite?.event_title}</p>
          <p className="review-readonly-meta">
            {invite?.category} · {invite?.event_date}
          </p>
        </div>

        <label className="review-label">
          Your review
          <textarea
            className="lux-input"
            rows={5}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about your experience with Regal Event London…"
            minLength={20}
            maxLength={2000}
            required
          />
        </label>

        <label className="review-label">
          Additional details <span className="review-optional">(optional)</span>
          <textarea
            className="lux-input"
            rows={2}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Guest count, highlights, etc."
            maxLength={500}
          />
        </label>

        {error && <p className="review-error">{error}</p>}

        <button type="submit" className="btn-gold" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
        <p className="review-disclaimer">
          Reviews are moderated before publication. Booking {invite?.booking_id}.
        </p>
      </form>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <div className="review-page">
      <Suspense
        fallback={
          <div className="review-page-card">
            <p style={{ color: "rgba(249,244,238,.5)" }}>Loading…</p>
          </div>
        }
      >
        <ReviewForm />
      </Suspense>
    </div>
  );
}
