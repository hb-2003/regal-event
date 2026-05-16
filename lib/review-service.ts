import { getRepository } from "@/lib/db";
import { Booking } from "@/server/database/entities/Booking.entity";
import { Review } from "@/server/database/entities/Review.entity";
import { ReviewInvite } from "@/server/database/entities/ReviewInvite.entity";
import {
  buildReviewUrl,
  generateReviewToken,
  getReviewInviteExpiry,
} from "@/lib/review-invite";
import {
  sendReviewInviteToClient,
  sendReviewSubmittedAlertToAdmin,
} from "@/lib/email";

export async function ensureReviewInviteForBooking(
  booking: Booking
): Promise<{ sent: boolean; reviewUrl?: string }> {
  const reviewRepo = await getRepository(Review);
  const existingReview = await reviewRepo.findOne({
    where: { booking_id: booking.booking_id },
  });
  if (existingReview && existingReview.status !== "rejected") {
    return { sent: false };
  }

  const inviteRepo = await getRepository(ReviewInvite);
  let invite = await inviteRepo.findOneBy({ booking_id: booking.booking_id });

  if (invite?.used_at) {
    return { sent: false };
  }

  if (!invite || invite.expires_at < new Date()) {
    const token = generateReviewToken();
    if (invite) {
      await inviteRepo.remove(invite);
    }
    invite = inviteRepo.create({
      booking_id: booking.booking_id,
      token,
      expires_at: getReviewInviteExpiry(),
      sent_at: new Date(),
    });
    await inviteRepo.save(invite);
  } else {
    invite.sent_at = new Date();
    await inviteRepo.save(invite);
  }

  const reviewUrl = buildReviewUrl(invite.token);
  await sendReviewInviteToClient({
    full_name: booking.full_name,
    email: booking.email,
    booking_id: booking.booking_id,
    event_date: booking.event_date,
    category: booking.category,
    review_url: reviewUrl,
  });

  return { sent: true, reviewUrl };
}

export async function submitReviewFromInvite(input: {
  token: string;
  rating: number;
  review_text: string;
  detail?: string;
}) {
  const inviteRepo = await getRepository(ReviewInvite);
  const invite = await inviteRepo.findOneBy({ token: input.token });

  if (!invite) {
    return { ok: false as const, error: "Invalid or expired review link." };
  }
  if (invite.used_at) {
    return { ok: false as const, error: "A review has already been submitted for this event." };
  }
  if (invite.expires_at < new Date()) {
    return { ok: false as const, error: "This review link has expired. Please contact us for assistance." };
  }

  const bookingRepo = await getRepository(Booking);
  const booking = await bookingRepo.findOneBy({ booking_id: invite.booking_id });
  if (!booking) {
    return { ok: false as const, error: "Booking not found." };
  }

  const reviewRepo = await getRepository(Review);
  const duplicate = await reviewRepo.findOne({
    where: { booking_id: booking.booking_id },
  });
  if (duplicate && duplicate.status !== "rejected") {
    return { ok: false as const, error: "A review is already pending or published for this booking." };
  }

  const eventYear = new Date(booking.event_date).getFullYear();
  const eventTitle = `${booking.category} Celebration`.slice(0, 120);
  const clientLocation = booking.venue?.trim().slice(0, 120) || null;

  const review = reviewRepo.create({
    booking_id: booking.booking_id,
    client_name: booking.full_name,
    client_location: clientLocation,
    event_title: eventTitle,
    event_year: Number.isFinite(eventYear) ? eventYear : new Date().getFullYear(),
    rating: input.rating,
    review_text: input.review_text.trim().slice(0, 2000),
    detail: input.detail?.trim().slice(0, 500) || null,
    status: "pending",
    submitted_at: new Date(),
  });
  await reviewRepo.save(review);

  invite.used_at = new Date();
  await inviteRepo.save(invite);

  try {
    await sendReviewSubmittedAlertToAdmin({
      client_name: review.client_name,
      booking_id: booking.booking_id,
      event_title: review.event_title,
      rating: review.rating,
    });
  } catch (err) {
    console.error("[reviews] admin alert email failed", err);
  }

  return { ok: true as const, reviewId: review.id };
}

export function toPublicReview(review: Review) {
  return {
    id: review.id,
    client_name: review.client_name,
    client_location: review.client_location,
    event_title: review.event_title,
    event_year: review.event_year,
    rating: review.rating,
    review_text: review.review_text,
    detail: review.detail,
  };
}
