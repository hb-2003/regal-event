import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Booking } from "@/server/database/entities/Booking.entity";
import { Gallery } from "@/server/database/entities/Gallery.entity";
import { sendBookingStatusChangeEmail } from "@/lib/email";
import { ensureReviewInviteForBooking } from "@/lib/review-service";
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

  let package_title: string | null = null;
  if (booking.gallery_id) {
    const galleryRepo = await getRepository(Gallery);
    const pkg = await galleryRepo.findOneBy({ id: booking.gallery_id });
    package_title = pkg?.title ?? null;
  }

  return NextResponse.json({
    ...publicView,
    package_title,
    estimated_total: booking.budget,
  });
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

  let body: { status?: string; admin_notes?: string; final_amount?: string | null };
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

  let final_amount = booking.final_amount;
  if (body.final_amount !== undefined) {
    final_amount = body.final_amount
      ? String(body.final_amount).trim().slice(0, 80)
      : null;
  }

  if (status === "Confirmed" && !final_amount) {
    return NextResponse.json(
      { error: "Please enter the confirmed amount / payment before confirming." },
      { status: 400 }
    );
  }

  const previousStatus = booking.status;
  booking.status = status;
  booking.admin_notes = admin_notes;
  booking.final_amount = final_amount;
  await repo.save(booking);

  let emailSent = false;
  try {
    emailSent = await sendBookingStatusChangeEmail(
      {
        full_name: booking.full_name,
        email: booking.email,
        booking_id: booking.booking_id,
        event_date: booking.event_date,
        category: booking.category,
        venue: booking.venue,
        guests: booking.guests,
        admin_notes,
        budget: booking.budget,
        final_amount: booking.final_amount,
      },
      previousStatus,
      status
    );
    if (!emailSent && previousStatus !== status) {
      console.warn("[bookings] status email skipped — SMTP not configured");
    }
  } catch (err) {
    console.error("[bookings] status email failed", err);
  }

  if (status === "Completed") {
    try {
      await ensureReviewInviteForBooking(booking);
    } catch (err) {
      console.error("[bookings] review invite failed", err);
    }
  }

  return NextResponse.json({
    success: true,
    emailSent,
    statusChanged: previousStatus !== status,
  });
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
