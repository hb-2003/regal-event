import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Booking } from "@/server/database/entities/Booking.entity";
import { ReviewInvite } from "@/server/database/entities/ReviewInvite.entity";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token || token.length < 32 || token.length > 128) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const inviteRepo = await getRepository(ReviewInvite);
  const invite = await inviteRepo.findOneBy({ token });
  if (!invite) {
    return NextResponse.json({ error: "Invalid or expired review link" }, { status: 404 });
  }
  if (invite.used_at) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 410 });
  }
  if (invite.expires_at < new Date()) {
    return NextResponse.json({ error: "This review link has expired" }, { status: 410 });
  }

  const bookingRepo = await getRepository(Booking);
  const booking = await bookingRepo.findOneBy({ booking_id: invite.booking_id });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const eventYear = new Date(booking.event_date).getFullYear();

  return NextResponse.json({
    booking_id: booking.booking_id,
    full_name: booking.full_name,
    category: booking.category,
    event_date: booking.event_date,
    event_title: `${booking.category} Celebration`,
    event_year: Number.isFinite(eventYear) ? eventYear : new Date().getFullYear(),
  });
}
