import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Booking } from "@/server/database/entities/Booking.entity";
import { generateBookingId, requireAdmin } from "@/lib/auth";
import { resolvePackageBooking } from "@/lib/booking-package";
import {
  isEmailConfigured,
  sendBookingAlertToAdmin,
  sendBookingConfirmedToClient,
  sendNewBookingEmails,
  sendStatusUpdateToClient,
} from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"] as const;
const ADMIN_CREATE_STATUSES = ["Pending", "Confirmed"] as const;

async function notifyForNewBooking(
  booking: {
    full_name: string;
    email: string;
    phone: string;
    booking_id: string;
    event_date: string;
    category: string;
    venue: string | null;
    guests: number | null;
    budget: string | null;
    final_amount: string | null;
    notes: string | null;
    admin_notes: string | null;
    status: string;
  },
  sendEmails: boolean
): Promise<boolean> {
  if (!sendEmails || !isEmailConfigured()) return false;

  const client = {
    full_name: booking.full_name,
    email: booking.email,
    booking_id: booking.booking_id,
    event_date: booking.event_date,
    category: booking.category,
    venue: booking.venue ?? undefined,
    guests: booking.guests ?? undefined,
    budget: booking.budget ?? undefined,
    final_amount: booking.final_amount ?? undefined,
    admin_notes: booking.admin_notes ?? undefined,
  };

  if (booking.status === "Confirmed") {
    await Promise.all([
      sendBookingConfirmedToClient(client),
      sendBookingAlertToAdmin({
        full_name: booking.full_name,
        email: booking.email,
        phone: booking.phone,
        booking_id: booking.booking_id,
        event_date: booking.event_date,
        category: booking.category,
        venue: client.venue,
        guests: client.guests,
        budget: booking.budget ?? undefined,
        notes: booking.notes ?? undefined,
      }),
    ]);
    return true;
  }

  if (booking.status === "Pending") {
    return sendNewBookingEmails({
      full_name: booking.full_name,
      email: booking.email,
      phone: booking.phone,
      booking_id: booking.booking_id,
      event_date: booking.event_date,
      category: booking.category,
      venue: client.venue,
      guests: client.guests,
      budget: booking.budget ?? undefined,
      notes: booking.notes ?? undefined,
    });
  }

  await sendStatusUpdateToClient({ ...client, status: booking.status });
  return true;
}

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => "\\" + c);
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const repo = await getRepository(Booking);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const qb = repo
    .createQueryBuilder("booking")
    .orderBy("booking.created_at", "DESC")
    .take(500);

  if (status && status !== "all") {
    qb.andWhere("booking.status = :status", { status });
  }
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    qb.andWhere(
      "(booking.full_name ILIKE :pattern ESCAPE '\\' OR booking.booking_id ILIKE :pattern ESCAPE '\\' OR booking.email ILIKE :pattern ESCAPE '\\')",
      { pattern }
    );
  }

  const bookings = await qb.getMany();
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const auth = requireAdmin(request);
  const isAdmin = !(auth instanceof NextResponse);

  const full_name = String(body.full_name ?? "").trim().slice(0, 120);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const event_date = String(body.event_date ?? "").trim().slice(0, 20);
  let category = String(body.category ?? "").trim().slice(0, 80);
  const venue = body.venue ? String(body.venue).trim().slice(0, 200) : null;
  let guests =
    body.guests != null && body.guests !== ""
      ? Math.max(1, Math.min(100000, Math.floor(Number(body.guests))))
      : null;
  let budget = body.budget ? String(body.budget).trim().slice(0, 80) : null;
  let final_amount = body.final_amount
    ? String(body.final_amount).trim().slice(0, 80)
    : null;
  const notes = body.notes ? String(body.notes).trim().slice(0, 2000) : null;
  let admin_notes = body.admin_notes
    ? String(body.admin_notes).trim().slice(0, 2000)
    : null;
  let gallery_id =
    body.gallery_id != null && body.gallery_id !== ""
      ? Math.floor(Number(body.gallery_id))
      : null;

  const isPublicSubmit = body.source === "public";

  if (!full_name || !phone || !email || !event_date) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const date = new Date(event_date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid event date" }, { status: 400 });
  }
  if (Number.isNaN(Number(guests)) && body.guests !== undefined && body.guests !== "") {
    return NextResponse.json({ error: "Invalid guest count" }, { status: 400 });
  }

  if (gallery_id && gallery_id > 0) {
    const resolved = await resolvePackageBooking(
      gallery_id,
      event_date,
      guests,
      isAdmin && !isPublicSubmit
    );
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }
    category = resolved.data.category;
    budget = resolved.data.budget;
    guests = resolved.data.guests;
    if (isAdmin && !isPublicSubmit && resolved.data.quoteAdminNote) {
      admin_notes = admin_notes
        ? `${resolved.data.quoteAdminNote}\n\n---\n${admin_notes}`
        : resolved.data.quoteAdminNote;
    }
  }

  let status: string;
  if (isPublicSubmit || !isAdmin) {
    if (
      !isPublicSubmit &&
      body.status !== undefined &&
      body.status !== null &&
      body.status !== ""
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    status = "Pending";
    final_amount = null;
  } else {
    const s =
      body.status !== undefined && body.status !== null && body.status !== ""
        ? String(body.status).trim()
        : "Confirmed";
    if (!ADMIN_CREATE_STATUSES.includes(s as (typeof ADMIN_CREATE_STATUSES)[number])) {
      return NextResponse.json(
        {
          error:
            "New bookings can only be created as Pending or Confirmed. Mark Completed after the event.",
        },
        { status: 400 }
      );
    }
    status = s;
    if (status === "Confirmed" && !final_amount && budget) {
      final_amount = budget;
    }
    if (status === "Confirmed" && !final_amount) {
      return NextResponse.json(
        { error: "Enter the agreed price when creating a confirmed booking." },
        { status: 400 }
      );
    }
  }

  const sendEmails =
    isPublicSubmit || !isAdmin ? true : body.send_emails !== false;

  if (!category) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const booking_id = generateBookingId();
  const repo = await getRepository(Booking);
  await repo.save(
    repo.create({
      booking_id,
      full_name,
      phone,
      email,
      event_date,
      category,
      gallery_id: gallery_id && gallery_id > 0 ? gallery_id : null,
      venue,
      guests,
      budget,
      final_amount: isAdmin ? final_amount : null,
      notes,
      status,
      admin_notes: isAdmin ? admin_notes : null,
    })
  );

  let emailSent = false;
  try {
    emailSent = await notifyForNewBooking(
      {
        full_name,
        email,
        phone,
        booking_id,
        event_date,
        category,
        venue,
        guests,
        budget,
        final_amount: isAdmin ? final_amount : null,
        notes,
        admin_notes: isAdmin ? admin_notes : null,
        status,
      },
      sendEmails
    );
    if (sendEmails && !emailSent) {
      console.warn("[bookings] SMTP not configured — set EMAIL_* or SMTP_* in .env");
    }
  } catch (err) {
    console.error("[bookings] email send failed", err);
  }

  return NextResponse.json({ success: true, booking_id, emailSent, status }, { status: 201 });
}
