import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Booking } from "@/server/database/entities/Booking.entity";
import { generateBookingId, requireAdmin } from "@/lib/auth";
import {
  sendBookingConfirmationToClient,
  sendBookingAlertToAdmin,
} from "@/lib/email";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const full_name = String(body.full_name ?? "").trim().slice(0, 120);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const event_date = String(body.event_date ?? "").trim().slice(0, 20);
  const category = String(body.category ?? "").trim().slice(0, 80);
  const venue = body.venue ? String(body.venue).trim().slice(0, 200) : null;
  const guests =
    body.guests != null && body.guests !== ""
      ? Math.max(1, Math.min(100000, Math.floor(Number(body.guests))))
      : null;
  const budget = body.budget ? String(body.budget).trim().slice(0, 80) : null;
  const notes = body.notes ? String(body.notes).trim().slice(0, 2000) : null;

  if (!full_name || !phone || !email || !event_date || !category) {
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
      venue,
      guests,
      budget,
      notes,
    })
  );

  try {
    await sendBookingConfirmationToClient({
      full_name,
      email,
      booking_id,
      event_date,
      category,
      venue: venue ?? undefined,
      guests: guests ?? undefined,
      budget: budget ?? undefined,
    });
    await sendBookingAlertToAdmin({
      full_name,
      email,
      phone,
      booking_id,
      event_date,
      category,
      venue: venue ?? undefined,
      guests: guests ?? undefined,
      budget: budget ?? undefined,
      notes: notes ?? undefined,
    });
  } catch (err) {
    console.error("[bookings] email send failed", err);
  }

  return NextResponse.json({ success: true, booking_id }, { status: 201 });
}
