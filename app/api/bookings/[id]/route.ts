import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { sendStatusUpdateToClient } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";

type Booking = {
  id: number;
  booking_id: string;
  full_name: string;
  phone: string;
  email: string;
  event_date: string;
  category: string;
  venue: string;
  guests: number;
  budget: string;
  notes: string;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
};

const ALLOWED_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"] as const;
type Status = (typeof ALLOWED_STATUSES)[number];

const BOOKING_ID_RE = /^RE-\d{4}-[A-Z0-9]{4,16}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!BOOKING_ID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const db = getDb();
  const booking = db
    .prepare("SELECT * FROM bookings WHERE booking_id = ?")
    .get(id) as Booking | undefined;

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Admins get the full record; public callers get a minimal, less-sensitive view.
  const token = request.cookies.get("admin_token")?.value;
  const isAdmin = token ? requireAdmin(request) : null;
  if (isAdmin && !(isAdmin instanceof NextResponse)) {
    return NextResponse.json(booking);
  }

  // Public/track view: redact phone + email, keep what /track displays
  const { phone: _phone, email: _email, ...publicView } = booking;
  void _phone;
  void _email;
  return NextResponse.json(publicView);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  if (!BOOKING_ID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  let body: { status?: string; admin_notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status;
  if (!status || !ALLOWED_STATUSES.includes(status as Status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const admin_notes = body.admin_notes
    ? String(body.admin_notes).slice(0, 2000)
    : null;

  const db = getDb();
  const booking = db
    .prepare("SELECT * FROM bookings WHERE booking_id = ?")
    .get(id) as Booking | undefined;
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  db.prepare(
    "UPDATE bookings SET status = ?, admin_notes = ?, updated_at = datetime('now') WHERE booking_id = ?"
  ).run(status, admin_notes, id);

  try {
    await sendStatusUpdateToClient({
      full_name: booking.full_name,
      email: booking.email,
      booking_id: booking.booking_id,
      status,
      admin_notes: admin_notes ?? undefined,
      event_date: booking.event_date,
      category: booking.category,
    });
  } catch (err) {
    console.error("[bookings] status email failed", err);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  if (!BOOKING_ID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }
  const db = getDb();
  db.prepare("DELETE FROM bookings WHERE booking_id = ?").run(id);
  return NextResponse.json({ success: true });
}
