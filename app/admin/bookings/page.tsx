"use client";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Booking = {
  id: number;
  booking_id: string;
  full_name: string;
  email: string;
  phone: string;
  category: string;
  event_date: string;
  venue: string;
  guests: number;
  budget: string;
  notes: string;
  status: string;
  admin_notes: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  Pending: "#D4A567",
  Confirmed: "#015961",
  Completed: "#2d6a4f",
  Cancelled: "#c1121f",
};

const tabs = ["all", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    setLoading(true);
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (cancelled) return;
      setBookings(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let data = bookings;
    if (tab !== "all") data = data.filter((b) => b.status === tab);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (b) =>
          b.full_name.toLowerCase().includes(q) ||
          b.booking_id.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q)
      );
    }
    return data;
  }, [bookings, tab, search]);

  function openModal(b: Booking) {
    setSelected(b);
    setEditStatus(b.status);
    setEditNotes(b.admin_notes || "");
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/bookings/${selected.booking_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus, admin_notes: editNotes }),
    });
    setSaving(false);
    setSelected(null);
    loadBookings();
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ backgroundColor: "#F9F4EE" }}>
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-w-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
            >
              Bookings
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "#888" }}>
              Manage and update all event bookings.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex gap-2 flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider transition-all"
                  style={{
                    minHeight: 36,
                    ...(tab === t
                      ? { backgroundColor: "#015961", color: "#FCCD97" }
                      : { backgroundColor: "white", color: "#555", border: "1px solid #EDE5D8" })
                  }}
                >
                  {t === "all" ? "ALL" : t.toUpperCase()}
                  {t !== "all" && (
                    <span className="ml-1.5 opacity-70">
                      ({bookings.filter((b) => b.status === t).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID or email..."
              className="flex-1 px-4 py-2 rounded-lg text-sm w-full"
              style={{ border: "1px solid #EDE5D8", backgroundColor: "white", color: "#222", minHeight: 40 }}
            />
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "white", border: "1px solid #EDE5D8" }}>
            {loading ? (
              <div className="p-10 text-center" style={{ color: "#888" }}>Loading bookings...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center" style={{ color: "#888" }}>No bookings found.</div>
            ) : (
              <>
              {/* Mobile card list */}
              <div className="md:hidden divide-y" style={{ borderColor:"#F9F4EE" }}>
                {filtered.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => openModal(b)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    style={{ display:"block" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] font-bold" style={{ color:"#015961" }}>{b.booking_id}</div>
                        <div className="text-sm font-medium truncate" style={{ color:"#222" }}>{b.full_name}</div>
                        <div className="text-xs truncate" style={{ color:"#666" }}>{b.email}</div>
                        <div className="text-[11px] mt-1" style={{ color:"#888" }}>
                          {b.category} · {b.event_date}{b.guests ? ` · ${b.guests} guests` : ""}
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0"
                        style={{ backgroundColor: (statusColors[b.status] || "#888") + "22", color: statusColors[b.status] || "#888" }}
                      >{b.status}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F9F4EE" }}>
                      {["ID", "Name", "Email", "Category", "Date", "Guests", "Budget", "Status", "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold tracking-wider" style={{ color: "#888" }}>
                          {h.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, i) => (
                      <tr
                        key={b.id}
                        style={{ borderTop: i > 0 ? "1px solid #F9F4EE" : "none" }}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => openModal(b)}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: "#015961" }}>{b.booking_id}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: "#222" }}>{b.full_name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>{b.email}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>{b.category}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>{b.event_date}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>{b.guests || "—"}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>{b.budget || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: (statusColors[b.status] || "#888") + "22",
                              color: statusColors[b.status] || "#888",
                            }}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal(b); }}
                            className="text-xs font-semibold tracking-wider px-3 py-1.5 rounded transition-colors"
                            style={{ backgroundColor: "#EDE5D8", color: "#015961" }}
                          >
                            EDIT
                          </button>
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

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: "#EDE5D8" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                    Booking Details
                  </h2>
                  <p className="text-xs font-mono font-bold mt-0.5" style={{ color: "#015961" }}>
                    {selected.booking_id}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close" className="text-2xl text-gray-400 hover:text-gray-600 leading-none w-9 h-9 flex items-center justify-center">×</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Name", value: selected.full_name },
                  { label: "Email", value: selected.email },
                  { label: "Phone", value: selected.phone },
                  { label: "Event Date", value: selected.event_date },
                  { label: "Category", value: selected.category },
                  { label: "Venue", value: selected.venue || "—" },
                  { label: "Guests", value: selected.guests ? String(selected.guests) : "—" },
                  { label: "Budget", value: selected.budget || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg" style={{ backgroundColor: "#F9F4EE" }}>
                    <p className="text-xs" style={{ color: "#999" }}>{label}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "#222" }}>{value}</p>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: "#EDE5D8" }}>
                  <p className="text-xs mb-1" style={{ color: "#999" }}>Special Requests</p>
                  <p className="text-sm" style={{ color: "#333" }}>{selected.notes}</p>
                </div>
              )}

              {/* Status update */}
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  Update Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                >
                  {["Pending", "Confirmed", "Completed", "Cancelled"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  Admin Notes (sent to client)
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add a note for the client..."
                  className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 rounded-lg text-sm font-semibold tracking-wider transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ backgroundColor: "#015961", color: "#FCCD97" }}
              >
                {saving ? "SAVING..." : "UPDATE & SEND EMAIL ✦"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
