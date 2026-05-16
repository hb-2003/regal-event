"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
  final_amount: string;
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
/** Statuses allowed when admin first creates a booking (not Completed/Cancelled). */
const createStatusOptions = ["Pending", "Confirmed"];

type Category = { id: number; name: string };

const emptyCreateForm = () => ({
  full_name: "",
  phone: "",
  email: "",
  event_date: "",
  category: "",
  venue: "",
  guests: "",
  quoted_price: "",
  notes: "",
  status: "Confirmed",
  admin_notes: "",
  send_emails: true,
});

const inputClass =
  "w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#015961]/30";
const inputStyle = { border: "1px solid #EDE5D8", color: "#222", backgroundColor: "white" } as const;
const labelClass = "block text-xs font-semibold tracking-widest uppercase mb-1.5";
const labelStyle = { color: "#555" } as const;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createError, setCreateError] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editFinalAmount, setEditFinalAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
      const [bookingsRes, categoriesRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/categories"),
      ]);
      if (cancelled) return;
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      if (categoriesRes.ok) {
        const cats = await categoriesRes.json();
        if (Array.isArray(cats)) setCategories(cats);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
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
    setEditFinalAmount(b.final_amount || "");
  }

  function openCreateModal() {
    setCreateForm(emptyCreateForm());
    setCreateError("");
    setCreateOpen(true);
  }

  function setCreateField(key: keyof ReturnType<typeof emptyCreateForm>, value: string | boolean) {
    setCreateForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (createForm.status === "Confirmed" && !createForm.quoted_price.trim()) {
      setCreateError("Enter the agreed price for a confirmed booking.");
      return;
    }
    setCreating(true);
    try {
      const price = createForm.quoted_price.trim();
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: createForm.full_name,
          phone: createForm.phone,
          email: createForm.email,
          event_date: createForm.event_date,
          category: createForm.category,
          venue: createForm.venue || undefined,
          guests: createForm.guests ? Number(createForm.guests) : undefined,
          budget: price || undefined,
          final_amount:
            createForm.status === "Confirmed" && price ? price : undefined,
          notes: createForm.notes || undefined,
          status: createForm.status,
          admin_notes: createForm.admin_notes || undefined,
          send_emails: createForm.send_emails,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(data?.error || "Could not create booking.");
        return;
      }
      setCreateOpen(false);
      await loadBookings();
      const id = data.booking_id as string;
      if (createForm.send_emails && data.emailSent) {
        alert(
          createForm.status === "Confirmed"
            ? `Booking ${id} created. Confirmation email sent to the client.`
            : `Booking ${id} created. Notification email sent.`
        );
      } else if (createForm.send_emails && !data.emailSent) {
        alert(`Booking ${id} created, but email could not be sent. Check SMTP settings.`);
      } else {
        alert(`Booking ${id} created.`);
      }
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSave() {
    if (!selected) return;
    if (editStatus === "Confirmed" && !editFinalAmount.trim()) {
      alert("Please enter the confirmed amount / payment before confirming.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/bookings/${selected.booking_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: editStatus,
        admin_notes: editNotes,
        final_amount: editFinalAmount.trim() || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      alert(data?.error || "Could not update booking.");
      return;
    }
    setSelected(null);
    loadBookings();
    if (data.statusChanged && editStatus === "Confirmed") {
      alert(
        data.emailSent
          ? "Booking confirmed. A confirmation email was sent to the client."
          : "Booking confirmed, but the confirmation email could not be sent. Check SMTP settings."
      );
    } else if (data.statusChanged && data.emailSent) {
      alert(`Status updated to ${editStatus}. The client has been emailed.`);
    } else if (data.statusChanged && !data.emailSent) {
      alert(`Status updated to ${editStatus}, but the notification email could not be sent.`);
    }
  }

  return (
    <>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
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
            <button
              type="button"
              onClick={openCreateModal}
              className="shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-all hover:shadow-md"
              style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}
            >
              {"+ Add booking"}
            </button>
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
                      {["ID", "Name", "Email", "Category", "Date", "Guests", "Estimate", "Final", "Status", "Action"].map((h) => (
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
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: b.final_amount ? "#015961" : "#666" }}>
                          {b.final_amount || "—"}
                        </td>
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
                  { label: "Estimated budget", value: selected.budget || "—" },
                  ...(selected.final_amount
                    ? [{ label: "Confirmed amount", value: selected.final_amount }]
                    : []),
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
                  onChange={(e) => {
                    const next = e.target.value;
                    setEditStatus(next);
                    if (
                      next === "Confirmed" &&
                      !editFinalAmount.trim() &&
                      selected?.budget
                    ) {
                      setEditFinalAmount(selected.budget);
                    }
                  }}
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
                  Confirmed amount / payment
                </label>
                <input
                  type="text"
                  value={editFinalAmount}
                  onChange={(e) => setEditFinalAmount(e.target.value)}
                  placeholder="e.g. £2,500 or £2,500 deposit paid"
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
                <p className="text-[11px] mt-1.5" style={{ color: "#888" }}>
                  Required when status is Confirmed. Shown to the client in the confirmation email and on the track page.
                </p>
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
                {saving ? "Saving..." : "Update & send email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {createOpen &&
        mounted &&
        createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 sm:p-6"
          onClick={() => !creating && setCreateOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-booking-title"
            className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-xl"
            style={{ maxHeight: "min(90dvh, calc(100dvh - 2rem))" }}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <div
              className="shrink-0 px-6 py-5 border-b"
              style={{ borderColor: "#EDE5D8" }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2
                    id="create-booking-title"
                    className="text-xl font-bold"
                    style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
                  >
                    Add booking
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                    Enter client and event details manually.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  disabled={creating}
                  aria-label="Close"
                  className="text-2xl text-gray-400 hover:text-gray-600 leading-none w-9 h-9 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div
              className="admin-modal-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain p-6"
              data-lenis-prevent
            >
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass} style={labelStyle}>
                    Full name <span style={{ color: "#c1121f" }}>*</span>
                  </label>
                  <input
                    required
                    value={createForm.full_name}
                    onChange={(e) => setCreateField("full_name", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Client full name"
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Phone <span style={{ color: "#c1121f" }}>*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateField("phone", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="+44 7700 000000"
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Email <span style={{ color: "#c1121f" }}>*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateField("email", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="client@email.com"
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Event date <span style={{ color: "#c1121f" }}>*</span>
                  </label>
                  <input
                    required
                    type="date"
                    value={createForm.event_date}
                    onChange={(e) => setCreateField("event_date", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Category <span style={{ color: "#c1121f" }}>*</span>
                  </label>
                  <select
                    required
                    value={createForm.category}
                    onChange={(e) => setCreateField("category", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} style={labelStyle}>
                    Venue / location
                  </label>
                  <input
                    value={createForm.venue}
                    onChange={(e) => setCreateField("venue", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Venue or address"
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.guests}
                    onChange={(e) => setCreateField("guests", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Approximate count"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} style={labelStyle}>
                    Initial status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateField("status", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  >
                    {createStatusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] mt-1.5" style={{ color: "#888" }}>
                    Use Confirmed for booked events. Set Completed later from the bookings list.
                  </p>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#444" }}>
                    <input
                      type="checkbox"
                      checked={createForm.send_emails}
                      onChange={(e) => setCreateField("send_emails", e.target.checked)}
                      className="rounded"
                    />
                    Send email to client
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} style={labelStyle}>
                    Client notes
                  </label>
                  <textarea
                    rows={2}
                    value={createForm.notes}
                    onChange={(e) => setCreateField("notes", e.target.value)}
                    className={`${inputClass} resize-none`}
                    style={inputStyle}
                    placeholder="Special requests from the client"
                  />
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: "#F9F4EE", border: "1px solid #EDE5D8" }}
              >
                  <label className={labelClass} style={labelStyle}>
                    Agreed price (£)
                    {createForm.status === "Confirmed" && (
                      <span style={{ color: "#c1121f" }}> *</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={createForm.quoted_price}
                    onChange={(e) => setCreateField("quoted_price", e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="e.g. £2,500"
                    required={createForm.status === "Confirmed"}
                  />
                  <p className="text-[11px] mt-1.5" style={{ color: "#888" }}>
                    Direct price (not a budget range). Required when status is Confirmed.
                  </p>
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Admin notes (included in confirmation email)
                  </label>
                  <textarea
                    rows={2}
                    value={createForm.admin_notes}
                    onChange={(e) => setCreateField("admin_notes", e.target.value)}
                    className={`${inputClass} resize-none`}
                    style={inputStyle}
                    placeholder="Optional note for the client"
                  />
                </div>

              {createError && (
                <p className="text-sm" style={{ color: "#c1121f" }}>
                  {createError}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  disabled={creating}
                  className="flex-1 py-3 rounded-lg text-sm font-semibold"
                  style={{ border: "1px solid #EDE5D8", color: "#555" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-lg text-sm font-semibold tracking-wider disabled:opacity-60"
                  style={{ backgroundColor: "#015961", color: "#FCCD97" }}
                >
                  {creating ? "Creating..." : "Create booking"}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
