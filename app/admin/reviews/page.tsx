"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ReviewRow = {
  id: number;
  booking_id: string | null;
  client_name: string;
  client_location: string | null;
  event_title: string;
  event_year: number;
  rating: number;
  review_text: string;
  detail: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  sort_order: number;
  submitted_at: string | null;
  moderated_at: string | null;
};

const tabs = ["pending", "approved", "rejected", "all"] as const;
const statusColors: Record<string, string> = {
  pending: "#D4A567",
  approved: "#2d6a4f",
  rejected: "#c1121f",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReviewRow | null>(null);
  const [notes, setNotes] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const q = tab === "all" ? "" : `?status=${tab}`;
    const res = await fetch(`/api/reviews${q}`);
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = useMemo(
    () => reviews.filter((r) => r.status === "pending").length,
    [reviews]
  );

  function openReview(r: ReviewRow) {
    setSelected(r);
    setNotes(r.admin_notes || "");
    setSortOrder(r.sort_order ?? 0);
  }

  async function moderate(status: "approved" | "rejected") {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/reviews/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        admin_notes: notes,
        sort_order: sortOrder,
      }),
    });
    setSaving(false);
    setSelected(null);
    load();
  }

  async function handleDelete() {
    if (!selected || !confirm("Delete this review permanently?")) return;
    setSaving(true);
    await fetch(`/api/reviews/${selected.id}`, { method: "DELETE" });
    setSaving(false);
    setSelected(null);
    load();
  }

  return (
    <>
        <div className="mb-6">
          <h1
            className="text-2xl font-light"
            style={{ fontFamily: "var(--font-cormorant),serif", color: "#F9F4EE" }}
          >
            Reviews
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(249,244,238,.45)" }}>
            Approve or reject client submissions before they appear on the site.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-xs uppercase tracking-widest transition-all"
              style={{
                background: tab === t ? "#FCCD97" : "rgba(255,255,255,.06)",
                color: tab === t ? "#012D32" : "rgba(249,244,238,.6)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t}
              {t === "pending" && pendingCount > 0 && tab !== "pending" ? ` (${pendingCount})` : ""}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "rgba(249,244,238,.4)" }}>Loading…</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: "rgba(249,244,238,.4)" }}>No reviews in this tab.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => openReview(r)}
                className="w-full text-left p-4 rounded-xl transition-colors"
                style={{
                  background: "rgba(1,45,50,.6)",
                  border: "1px solid rgba(252,205,151,.1)",
                  cursor: "pointer",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span style={{ color: "#F9F4EE", fontWeight: 500 }}>{r.client_name}</span>
                  <span
                    className="text-xs px-3 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      background: `${statusColors[r.status]}22`,
                      color: statusColors[r.status],
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                <p style={{ color: "rgba(249,244,238,.55)", fontSize: ".85rem" }}>
                  {r.event_title}, {r.event_year} · {"★".repeat(r.rating)}
                  {r.booking_id ? ` · ${r.booking_id}` : ""}
                </p>
                <p
                  className="mt-2 line-clamp-2"
                  style={{ color: "rgba(249,244,238,.7)", fontSize: ".9rem" }}
                >
                  {r.review_text}
                </p>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(1,15,18,.75)" }}
            onClick={() => !saving && setSelected(null)}
          >
            <div
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-6"
              style={{ background: "#012D32", border: "1px solid rgba(252,205,151,.15)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-xl mb-1"
                style={{ fontFamily: "var(--font-cormorant),serif", color: "#F9F4EE" }}
              >
                {selected.client_name}
              </h2>
              <p className="text-sm mb-4" style={{ color: "rgba(249,244,238,.45)" }}>
                {selected.event_title}, {selected.event_year}
                {selected.client_location ? ` · ${selected.client_location}` : ""}
              </p>
              <p
                className="mb-4 italic"
                style={{
                  fontFamily: "var(--font-cormorant),serif",
                  color: "#F9F4EE",
                  lineHeight: 1.7,
                }}
              >
                &ldquo;{selected.review_text}&rdquo;
              </p>
              {selected.detail && (
                <p className="text-sm mb-4" style={{ color: "rgba(249,244,238,.5)" }}>
                  {selected.detail}
                </p>
              )}

              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#FCCD97" }}>
                Display order (lower = first)
              </label>
              <input
                type="number"
                className="lux-input mb-4"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />

              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#FCCD97" }}>
                Admin notes
              </label>
              <textarea
                className="lux-input mb-6"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes or rejection reason"
              />

              <div className="flex flex-wrap gap-3">
                {selected.status !== "approved" && (
                  <button
                    type="button"
                    className="btn-gold"
                    disabled={saving}
                    onClick={() => moderate("approved")}
                  >
                    Approve
                  </button>
                )}
                {selected.status !== "rejected" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => moderate("rejected")}
                    style={{
                      padding: "12px 20px",
                      border: "1px solid #c1121f",
                      color: "#f8a5a5",
                      background: "transparent",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleDelete}
                  style={{
                    padding: "12px 20px",
                    border: "1px solid rgba(249,244,238,.2)",
                    color: "rgba(249,244,238,.5)",
                    background: "transparent",
                    borderRadius: 4,
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
