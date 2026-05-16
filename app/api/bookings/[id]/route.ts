import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Booking } from "@/server/database/entities/Booking.entity";
import { sendStatusUpdateToClient } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";

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

  const repo = await getRepository(Booking);
  const booking = await repo.findOneBy({ booking_id: id });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const token = request.cookies.get("admin_token")?.value;
  const isAdmin = token ? requireAdmin(request) : null;
  if (isAdmin && !(isAdmin instanceof NextResponse)) {
    return NextResponse.json(booking);
  }

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

  const repo = await getRepository(Booking);
  const booking = await repo.findOneBy({ booking_id: id });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  booking.status = status;
  booking.admin_notes = admin_notes;
  await repo.save(booking);

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

  const repo = await getRepository(Booking);
  await repo.delete({ booking_id: id });
  return NextResponse.json({ success: true });
}
