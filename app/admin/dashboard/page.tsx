"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCharts from "@/components/admin/DashboardCharts";

type Booking = {
  category: string;
  event_date: string;
  status: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bookingsRes, reviewsRes] = await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/reviews?status=pending"),
        ]);
        const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
        if (!cancelled) {
          setBookings(
            Array.isArray(bookingsData)
              ? bookingsData.map((b: Booking) => ({
                  category: b.category,
                  event_date: b.event_date,
                  status: b.status,
                  created_at: b.created_at,
                }))
              : []
          );
        }
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          if (!cancelled && Array.isArray(reviewsData)) {
            setPendingReviews(reviewsData.length);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    confirmed: bookings.filter((b) => b.status === "Confirmed").length,
    completed: bookings.filter((b) => b.status === "Completed").length,
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-bold"
          style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
        >
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#888" }}>
          Welcome back. Here&apos;s what&apos;s happening at Regal Event London.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Total Bookings", value: stats.total, color: "#015961", icon: "♢" },
          { label: "Pending", value: stats.pending, color: "#D4A567", icon: "◷" },
          { label: "Confirmed", value: stats.confirmed, color: "#015961", icon: "✓" },
          { label: "Completed", value: stats.completed, color: "#2d6a4f", icon: "✦" },
          {
            label: "Reviews to Moderate",
            value: pendingReviews,
            color: "#c1121f",
            icon: "❝",
            href: "/admin/reviews",
          },
        ].map((stat) => {
          const inner = (
            <div
              className="rounded-xl p-4 sm:p-5 h-full transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: "white", border: "1px solid #EDE5D8" }}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-lg sm:text-xl" style={{ color: stat.color }}>
                  {stat.icon}
                </span>
                <span
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: stat.color, fontFamily: "var(--font-cormorant), serif" }}
                >
                  {loading ? "—" : stat.value}
                </span>
              </div>
              <p
                className="text-[10px] sm:text-xs font-medium tracking-wider"
                style={{ color: "#888" }}
              >
                {stat.label.toUpperCase()}
              </p>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={stat.label}>{inner}</div>
          );
        })}
      </div>

      {!loading && <DashboardCharts bookings={bookings} />}
    </div>
  );
}
