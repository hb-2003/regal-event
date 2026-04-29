"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Booking = {
  id: number;
  booking_id: string;
  full_name: string;
  email: string;
  category: string;
  event_date: string;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  Pending: "#D4A567",
  Confirmed: "#015961",
  Completed: "#2d6a4f",
  Cancelled: "#c1121f",
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/bookings");
        const d = await r.json();
        if (cancelled) return;
        setBookings(d);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    confirmed: bookings.filter((b) => b.status === "Confirmed").length,
    completed: bookings.filter((b) => b.status === "Completed").length,
  };

  const recent = bookings.slice(0, 10);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ backgroundColor: "#F9F4EE" }}>
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-w-0">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
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

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: "Total Bookings", value: stats.total, color: "#015961", icon: "♢" },
              { label: "Pending",        value: stats.pending,   color: "#D4A567", icon: "◷" },
              { label: "Confirmed",      value: stats.confirmed, color: "#015961", icon: "✓" },
              { label: "Completed",      value: stats.completed, color: "#2d6a4f", icon: "✦" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4 sm:p-5"
                style={{ backgroundColor: "white", border: "1px solid #EDE5D8" }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-lg sm:text-xl" style={{ color: stat.color }}>{stat.icon}</span>
                  <span
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: stat.color, fontFamily: "var(--font-cormorant), serif" }}
                  >
                    {loading ? "—" : stat.value}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs font-medium tracking-wider" style={{ color: "#888" }}>
                  {stat.label.toUpperCase()}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 sm:mb-8">
            {[
              { href: "/admin/bookings",   label: "Manage Bookings",  icon: "♢" },
              { href: "/admin/categories", label: "Edit Categories",  icon: "✦" },
              { href: "/admin/gallery",    label: "Upload Gallery",   icon: "◇" },
              { href: "/admin/videos",     label: "Add Videos",       icon: "▶" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: "white", border: "1px solid #EDE5D8", color: "#012D32", minHeight: 44 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#FCCD97"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#EDE5D8"; }}
              >
                <span className="text-lg sm:text-xl" style={{ color:"#FCCD97" }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Recent bookings */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "white", border: "1px solid #EDE5D8" }}
          >
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4"
              style={{ borderBottom: "1px solid #EDE5D8" }}
            >
              <h2
                className="text-lg sm:text-xl font-bold"
                style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
              >
                Recent Bookings
              </h2>
              <Link
                href="/admin/bookings"
                className="text-sm font-medium"
                style={{ color: "#015961" }}
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center" style={{ color: "#888" }}>Loading...</div>
            ) : recent.length === 0 ? (
              <div className="p-10 text-center" style={{ color: "#888" }}>
                No bookings yet. They will appear here once submitted.
              </div>
            ) : (
              <>
              {/* Mobile: card list */}
              <div className="md:hidden divide-y" style={{ borderColor:"#F9F4EE" }}>
                {recent.map((b) => (
                  <Link key={b.id} href="/admin/bookings" className="flex items-start justify-between gap-3 px-4 py-3" style={{ color:"#222" }}>
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] font-bold" style={{ color:"#015961" }}>{b.booking_id}</div>
                      <div className="text-sm font-medium truncate" style={{ color:"#222" }}>{b.full_name}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color:"#666" }}>{b.category} · {b.event_date}</div>
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0"
                      style={{ backgroundColor: (statusColors[b.status] || "#888") + "22", color: statusColors[b.status] || "#888" }}
                    >{b.status}</span>
                  </Link>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F9F4EE" }}>
                      {["Booking ID", "Client", "Category", "Event Date", "Status", ""].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-xs font-semibold tracking-wider"
                          style={{ color: "#888" }}
                        >
                          {h.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((b, i) => (
                      <tr
                        key={b.id}
                        style={{ borderTop: i > 0 ? "1px solid #F9F4EE" : "none" }}
                        className="hover:bg-cream/50 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: "#015961" }}>
                          {b.booking_id}
                        </td>
                        <td className="px-5 py-3.5 font-medium" style={{ color: "#222" }}>
                          {b.full_name}
                        </td>
                        <td className="px-5 py-3.5" style={{ color: "#555" }}>
                          {b.category}
                        </td>
                        <td className="px-5 py-3.5" style={{ color: "#555" }}>
                          {b.event_date}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: (statusColors[b.status] || "#888") + "22",
                              color: statusColors[b.status] || "#888",
                            }}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href="/admin/bookings"
                            className="text-xs font-medium"
                            style={{ color: "#015961" }}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
