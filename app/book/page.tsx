"use client";
import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Select from "@/components/ui/Select";
import PackageBookingSummary from "@/components/PackageBookingSummary";
import {
  formatGalleryPrice,
  type GalleryPackageDto,
} from "@/lib/gallery";

const BUDGET_OPTIONS = [
  "Under £500",
  "£500 – £1,000",
  "£1,000 – £2,500",
  "£2,500 – £5,000",
  "£5,000+",
];

type Category = { id: number; name: string; slug: string };

function BookingForm() {
  const searchParams = useSearchParams();
  const preCategory = searchParams.get("category") || "";
  const packageId = searchParams.get("package") || "";
  const isPackageBooking = Boolean(packageId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryPackage, setGalleryPackage] = useState<GalleryPackageDto | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    event_date: "",
    category: preCategory,
    venue: "",
    guests: "",
    budget: "",
    notes: "",
  });

  const showGuestField = useMemo(() => {
    if (!isPackageBooking || !galleryPackage) return true;
    return (
      galleryPackage.require_guest_count || galleryPackage.guest_pricing_enabled
    );
  }, [isPackageBooking, galleryPackage]);

  const guestRequired =
    isPackageBooking &&
    galleryPackage != null &&
    galleryPackage.require_guest_count;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !Array.isArray(data)) {
          throw new Error(typeof data?.error === "string" ? data.error : "Failed to load categories");
        }
        return data as Category[];
      })
      .then((cats) => {
        if (cancelled) return;
        setCategories(cats);
        if (!isPackageBooking) {
          setForm((f) => {
            if (f.category) return f;
            const matched = cats.find(
              (c) => c.slug === preCategory || c.name === preCategory
            );
            return matched ? { ...f, category: matched.name } : f;
          });
        }
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [preCategory, isPackageBooking]);

  useEffect(() => {
    if (!packageId) {
      setGalleryPackage(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/gallery/${packageId}`)
      .then((r) => r.json())
      .then((pkgData) => {
        if (cancelled) return;
        if (pkgData?.error) throw new Error(pkgData.error);
        const pkg = pkgData as GalleryPackageDto;
        setGalleryPackage(pkg);

        const defaultGuests =
          pkg.require_guest_count || pkg.guest_pricing_enabled
            ? String(pkg.base_guest_capacity ?? "")
            : "";

        setForm((f) => ({
          ...f,
          category: pkg.category || f.category,
          guests: defaultGuests,
          budget: "",
          notes: "",
        }));
      })
      .catch(() => {
        if (!cancelled) setGalleryPackage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [packageId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category && !isPackageBooking) {
      setErrorMsg("Please select an event category.");
      setStatus("error");
      return;
    }
    if (guestRequired && !form.guests) {
      setErrorMsg("Please enter the number of guests.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guests: form.guests ? Number(form.guests) : undefined,
          gallery_id: galleryPackage?.id,
          source: "public",
          status: "Pending",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingId(data.booking_id);
        setStatus("success");
      } else {
        setErrorMsg(data?.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error");
      setStatus("error");
    }
  }

  const set = useCallback(
    (k: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value })),
    []
  );

  if (status === "success")
    return (
      <div style={{ maxWidth: 560, marginInline: "auto", textAlign: "center" }}>
        <div className="lux-card" style={{ padding: "clamp(28px,5vw,48px)", borderColor: "rgba(252,205,151,.3)" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "2px solid #FCCD97",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              color: "#FCCD97",
              margin: "0 auto 24px",
            }}
          >
            ✦
          </div>
          <h2
            style={{
              fontFamily: "var(--font-cormorant),serif",
              fontSize: "clamp(1.6rem,3vw,2rem)",
              fontWeight: 400,
              color: "#F9F4EE",
              marginBottom: 12,
            }}
          >
            Booking request received
          </h2>
          <p style={{ color: "rgba(249,244,238,.5)", marginBottom: 28, fontSize: ".88rem", lineHeight: 1.7 }}>
            Your request is <strong style={{ color: "#FCCD97" }}>pending review</strong>. Our team will
            confirm details and contact you within 24 hours. A confirmation email has been sent — please
            check your inbox and spam folder.
          </p>
          <div
            style={{
              background: "rgba(1,89,97,.15)",
              border: "1px solid rgba(252,205,151,.2)",
              padding: "20px 24px",
              marginBottom: 28,
            }}
          >
            <p
              style={{
                fontSize: ".65rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "rgba(249,244,238,.4)",
                marginBottom: 8,
              }}
            >
              Your Booking ID
            </p>
            <p
              style={{
                fontFamily: "var(--font-cormorant),serif",
                fontSize: "clamp(1.5rem,3.5vw,2.2rem)",
                fontWeight: 600,
                letterSpacing: ".08em",
                color: "#FCCD97",
                wordBreak: "break-all",
              }}
            >
              {bookingId}
            </p>
          </div>
          <p style={{ fontSize: ".8rem", color: "rgba(249,244,238,.4)", marginBottom: 24 }}>
            Save this ID to track your booking at any time.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`/track?id=${bookingId}`} className="btn-gold">
              <span>Track Booking →</span>
            </Link>
            <Link href="/" className="btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 720, marginInline: "auto" }}>
      <div className="lux-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "clamp(20px,3.5vw,28px) clamp(22px,4vw,36px)",
            background: "linear-gradient(90deg,#015961,#022C32)",
            borderBottom: "1px solid rgba(252,205,151,.12)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-cormorant),serif",
              fontSize: "clamp(1.5rem,2.6vw,1.9rem)",
              fontWeight: 400,
              color: "#FCCD97",
              marginBottom: 6,
            }}
          >
            {isPackageBooking ? "Book this package" : "Event Details"}
          </h2>
          <p style={{ fontSize: ".82rem", color: "rgba(249,244,238,.5)" }}>
            {isPackageBooking
              ? "Complete your details below. Your package and pricing are fixed for this booking."
              : "Fill in your details and we'll get back to you within 24 hours."}
          </p>
        </div>

        <div
          style={{
            padding: "clamp(22px,4vw,36px)",
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {galleryPackage && (
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                padding: 16,
                background: "rgba(1,89,97,.12)",
                border: "1px solid rgba(252,205,151,.15)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 88,
                  height: 66,
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={galleryPackage.image_path}
                  alt={galleryPackage.title || "Selected setup"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="88px"
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: ".65rem",
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "rgba(249,244,238,.45)",
                    marginBottom: 4,
                  }}
                >
                  Selected package
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant),serif",
                    fontSize: "1.15rem",
                    color: "#F9F4EE",
                    margin: 0,
                  }}
                >
                  {galleryPackage.title || "Event setup"}
                </p>
                {galleryPackage.price && (
                  <p style={{ color: "#FCCD97", fontSize: ".85rem", margin: "4px 0 0" }}>
                    From {formatGalleryPrice(galleryPackage.price)}
                  </p>
                )}
                <Link
                  href="/gallery"
                  style={{
                    fontSize: ".72rem",
                    color: "rgba(249,244,238,.45)",
                    textDecoration: "underline",
                    marginTop: 6,
                    display: "inline-block",
                  }}
                >
                  Choose a different package
                </Link>
              </div>
            </div>
          )}

          <div>
            <label className="lux-label">
              Full Name <span style={{ color: "#FCCD97" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Your full name"
              value={form.full_name}
              onChange={set("full_name")}
              className="lux-input"
            />
          </div>

          <div className="grid-1-2">
            <div>
              <label className="lux-label">
                Phone <span style={{ color: "#FCCD97" }}>*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+44 7700 000 000"
                value={form.phone}
                onChange={set("phone")}
                className="lux-input"
              />
            </div>
            <div>
              <label className="lux-label">
                Email Address <span style={{ color: "#FCCD97" }}>*</span>
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={set("email")}
                className="lux-input"
              />
            </div>
          </div>

          <div className="grid-1-2">
            <div>
              <label className="lux-label">
                Event Date <span style={{ color: "#FCCD97" }}>*</span>
              </label>
              <input
                type="date"
                required
                value={form.event_date}
                onChange={set("event_date")}
                min={new Date().toISOString().split("T")[0]}
                className="lux-input"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              {isPackageBooking && galleryPackage ? (
                <>
                  <label className="lux-label">Event category</label>
                  <input
                    type="text"
                    readOnly
                    value={form.category}
                    className="lux-input"
                    style={{ opacity: 0.85, cursor: "not-allowed" }}
                  />
                </>
              ) : (
                <Select
                  variant="lux"
                  label="Event category"
                  required
                  value={form.category}
                  onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                  placeholder="Select a category"
                  options={[
                    { value: "", label: "Select a category" },
                    ...categories.map((c) => ({ value: c.name, label: c.name })),
                  ]}
                />
              )}
            </div>
          </div>

          <div>
            <label className="lux-label">Venue / Location</label>
            <input
              type="text"
              placeholder="e.g. Home, hired venue, restaurant..."
              value={form.venue}
              onChange={set("venue")}
              className="lux-input"
            />
          </div>

          {(showGuestField || !isPackageBooking) && (
            <div className={isPackageBooking ? "" : "grid-1-2"}>
              {showGuestField && (
                <div>
                  <label className="lux-label">
                    Number of Guests
                    {guestRequired && <span style={{ color: "#FCCD97" }}> *</span>}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required={guestRequired}
                    placeholder="Approximate number"
                    value={form.guests}
                    onChange={set("guests")}
                    className="lux-input"
                  />
                </div>
              )}
              {!isPackageBooking && (
                <div>
                  <Select
                    variant="lux"
                    label="Estimated budget"
                    value={form.budget}
                    onChange={(v) => setForm((f) => ({ ...f, budget: v }))}
                    placeholder="Select estimated budget"
                    options={[
                      { value: "", label: "Select estimated budget" },
                      ...BUDGET_OPTIONS.map((b) => ({ value: b, label: b })),
                    ]}
                  />
                </div>
              )}
            </div>
          )}

          {isPackageBooking && galleryPackage && (
            <PackageBookingSummary
              pkg={galleryPackage}
              guestCount={form.guests}
              variant="lux"
            />
          )}

          <div>
            <label className="lux-label">Special Requests</label>
            <textarea
              rows={4}
              placeholder="Any specific themes, colours, or requirements..."
              value={form.notes}
              onChange={set("notes")}
              className="lux-input"
              style={{ resize: "vertical", minHeight: 96 }}
            />
          </div>

          {status === "error" && (
            <p style={{ color: "#ef4444", fontSize: ".83rem" }}>
              {errorMsg || "Something went wrong. Please try again."}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-gold"
            style={{
              cursor: status === "loading" ? "not-allowed" : "pointer",
              opacity: status === "loading" ? 0.6 : 1,
              width: "100%",
              padding: "16px 36px",
            }}
          >
            <span>{status === "loading" ? "Submitting..." : "Submit booking request ✦"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default function BookPage() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">Begin Your Journey</div>
          <h1 className="page-hero-title">
            <span className="gold-shimmer">Book Your Event</span>
          </h1>
          <p className="page-hero-sub">
            Tell us about your vision and we&apos;ll create something extraordinary
          </p>
        </div>
      </div>

      <section className="section-tight" style={{ background: "#011F23" }}>
        <div className="container-x" style={{ maxWidth: 800, marginInline: "auto" }}>
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: 500,
                  background: "rgba(1,89,97,.08)",
                  border: "1px solid rgba(252,205,151,.06)",
                }}
              />
            }
          >
            <BookingForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
