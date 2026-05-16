import nodemailer from "nodemailer";

function emailEnv(key: "HOST" | "PORT" | "USER" | "PASS" | "FROM"): string | undefined {
  const map: Record<typeof key, string[]> = {
    HOST: ["EMAIL_HOST", "SMTP_HOST"],
    PORT: ["EMAIL_PORT", "SMTP_PORT"],
    USER: ["EMAIL_USER", "SMTP_USER"],
    PASS: ["EMAIL_PASS", "SMTP_PASS"],
    FROM: ["EMAIL_FROM", "MAIL_FROM"],
  };
  for (const name of map[key]) {
    const v = process.env[name];
    if (v) return v;
  }
  return undefined;
}

export function isEmailConfigured(): boolean {
  return Boolean(
    emailEnv("HOST") &&
      emailEnv("USER") &&
      emailEnv("PASS") &&
      emailEnv("FROM") &&
      (process.env.ADMIN_EMAIL || emailEnv("USER"))
  );
}

function getTransporter() {
  const port = Number(emailEnv("PORT")) || 587;
  const secure =
    process.env.EMAIL_SECURE === "true" ||
    process.env.SMTP_SECURE === "true" ||
    port === 465;
  return nodemailer.createTransport({
    host: emailEnv("HOST"),
    port,
    secure,
    auth: {
      user: emailEnv("USER"),
      pass: emailEnv("PASS"),
    },
  });
}

function mailFrom(): string {
  return emailEnv("FROM") || "Regal Event London <noreply@localhost>";
}

function adminRecipient(): string {
  return process.env.ADMIN_EMAIL || emailEnv("USER") || "";
}

/** Escape user-supplied strings before interpolating into HTML email bodies. */
function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}

/** Strip newlines from anything that becomes part of a header (subject, etc.). */
function header(value: unknown): string {
  return String(value ?? "").replace(/[\r\n]+/g, " ").slice(0, 200);
}

function formatEmailDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function bookingDetailsTable(booking: {
  event_date: string;
  category: string;
  venue?: string;
  guests?: number;
  budget?: string | null;
  final_amount?: string | null;
}) {
  const dateLabel = formatEmailDate(booking.event_date);
  const estimate = booking.budget?.trim();
  const confirmed = booking.final_amount?.trim();
  return `
    <table style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #EDE5D8;border-radius:6px;overflow:hidden;">
      <tr style="background:#012D32;">
        <td colspan="2" style="padding:12px 16px;color:#FCCD97;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Your Event</td>
      </tr>
      <tr><td style="padding:12px 16px;color:#666;width:38%;font-size:13px;border-top:1px solid #EDE5D8;">Service</td><td style="padding:12px 16px;color:#012D32;font-weight:600;border-top:1px solid #EDE5D8;">${esc(booking.category)}</td></tr>
      <tr style="background:#F9F4EE;"><td style="padding:12px 16px;color:#666;font-size:13px;">Date</td><td style="padding:12px 16px;color:#012D32;font-weight:600;">${esc(dateLabel)}</td></tr>
      ${booking.venue ? `<tr><td style="padding:12px 16px;color:#666;font-size:13px;">Venue</td><td style="padding:12px 16px;color:#222;">${esc(booking.venue)}</td></tr>` : ""}
      ${booking.guests ? `<tr style="background:#F9F4EE;"><td style="padding:12px 16px;color:#666;font-size:13px;">Guests</td><td style="padding:12px 16px;color:#222;">${esc(booking.guests)}</td></tr>` : ""}
      ${estimate ? `<tr><td style="padding:12px 16px;color:#666;font-size:13px;">Estimated budget</td><td style="padding:12px 16px;color:#222;">${esc(estimate)}</td></tr>` : ""}
      ${confirmed ? `<tr style="background:#F9F4EE;"><td style="padding:12px 16px;color:#666;font-size:13px;">Confirmed amount</td><td style="padding:12px 16px;color:#015961;font-weight:700;">${esc(confirmed)}</td></tr>` : ""}
    </table>`;
}

const baseStyle = `
  font-family: 'Georgia', serif;
  max-width: 600px;
  margin: 0 auto;
  background: #F9F4EE;
  border: 1px solid #FCCD97;
  border-radius: 8px;
  overflow: hidden;
`;

const headerHtml = `
  <div style="background:#012D32;padding:32px;text-align:center;">
    <h1 style="color:#FCCD97;font-size:26px;margin:0;letter-spacing:2px;">REGAL EVENT</h1>
    <p style="color:#FCCD97;opacity:0.7;margin:6px 0 0;font-size:13px;letter-spacing:3px;">LONDON</p>
  </div>
`;

const footerHtml = `
  <div style="background:#012D32;padding:16px;text-align:center;">
    <p style="color:#FCCD97;opacity:0.5;margin:0;font-size:11px;letter-spacing:1px;">© ${new Date().getFullYear()} REGAL EVENT LONDON · EXCELLENCE IN EVERY DETAIL</p>
  </div>
`;

export async function sendBookingConfirmationToClient(booking: {
  full_name: string;
  email: string;
  booking_id: string;
  event_date: string;
  category: string;
  venue?: string;
  guests?: number;
  budget?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const trackUrl = `${siteUrl}/track?id=${encodeURIComponent(booking.booking_id)}`;
  await getTransporter().sendMail({
    from: mailFrom(),
    to: booking.email,
    subject: header(`Booking Received – ${booking.booking_id} | Regal Event London`),
    html: `<div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:32px;">
        <h2 style="color:#015961;font-size:22px;margin:0 0 16px;">Booking Received ✦</h2>
        <p style="color:#444;line-height:1.7;">Dear <strong>${esc(booking.full_name)}</strong>,</p>
        <p style="color:#444;line-height:1.7;">Thank you for choosing Regal Event London. We have received your booking and our team will be in touch within 24 hours to discuss the details.</p>
        <div style="background:#EDE5D8;border-left:4px solid #FCCD97;padding:20px;border-radius:4px;margin:24px 0;">
          <p style="margin:0 0 6px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Your Booking ID</p>
          <p style="margin:0;font-size:28px;color:#015961;font-weight:bold;letter-spacing:3px;">${esc(booking.booking_id)}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:10px 8px;color:#666;width:40%;font-size:13px;">Event Date</td><td style="padding:10px 8px;color:#222;font-weight:600;">${esc(booking.event_date)}</td></tr>
          <tr style="background:#EDE5D8;"><td style="padding:10px 8px;color:#666;font-size:13px;">Category</td><td style="padding:10px 8px;color:#222;font-weight:600;">${esc(booking.category)}</td></tr>
          ${booking.venue ? `<tr><td style="padding:10px 8px;color:#666;font-size:13px;">Venue</td><td style="padding:10px 8px;color:#222;">${esc(booking.venue)}</td></tr>` : ""}
          ${booking.guests ? `<tr style="background:#EDE5D8;"><td style="padding:10px 8px;color:#666;font-size:13px;">Guests</td><td style="padding:10px 8px;color:#222;">${esc(booking.guests)}</td></tr>` : ""}
          ${booking.budget ? `<tr><td style="padding:10px 8px;color:#666;font-size:13px;">Budget</td><td style="padding:10px 8px;color:#222;">${esc(booking.budget)}</td></tr>` : ""}
        </table>
        <a href="${esc(trackUrl)}" style="display:inline-block;background:#015961;color:#FCCD97;padding:14px 28px;border-radius:4px;text-decoration:none;font-weight:bold;margin-top:8px;letter-spacing:1px;">Track Your Booking →</a>
      </div>
      ${footerHtml}
    </div>`,
  });
}

export async function sendBookingAlertToAdmin(booking: {
  full_name: string;
  email: string;
  phone: string;
  booking_id: string;
  event_date: string;
  category: string;
  venue?: string;
  guests?: number;
  budget?: string;
  notes?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await getTransporter().sendMail({
    from: mailFrom(),
    to: adminRecipient(),
    subject: header(`New Booking: ${booking.booking_id} – ${booking.full_name}`),
    html: `<div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:24px;">
        <h2 style="color:#015961;">New Booking Alert</h2>
        <p style="color:#015961;font-weight:bold;font-size:18px;">${esc(booking.booking_id)}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;color:#666;width:35%;">Name</td><td style="padding:8px;font-weight:600;">${esc(booking.full_name)}</td></tr>
          <tr style="background:#EDE5D8;"><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;">${esc(booking.email)}</td></tr>
          <tr><td style="padding:8px;color:#666;">Phone</td><td style="padding:8px;">${esc(booking.phone)}</td></tr>
          <tr style="background:#EDE5D8;"><td style="padding:8px;color:#666;">Event Date</td><td style="padding:8px;font-weight:600;">${esc(booking.event_date)}</td></tr>
          <tr><td style="padding:8px;color:#666;">Category</td><td style="padding:8px;">${esc(booking.category)}</td></tr>
          ${booking.venue ? `<tr style="background:#EDE5D8;"><td style="padding:8px;color:#666;">Venue</td><td style="padding:8px;">${esc(booking.venue)}</td></tr>` : ""}
          ${booking.guests ? `<tr><td style="padding:8px;color:#666;">Guests</td><td style="padding:8px;">${esc(booking.guests)}</td></tr>` : ""}
          ${booking.budget ? `<tr style="background:#EDE5D8;"><td style="padding:8px;color:#666;">Budget</td><td style="padding:8px;">${esc(booking.budget)}</td></tr>` : ""}
          ${booking.notes ? `<tr><td style="padding:8px;color:#666;">Notes</td><td style="padding:8px;white-space:pre-wrap;">${esc(booking.notes)}</td></tr>` : ""}
        </table>
        <a href="${esc(siteUrl)}/admin/bookings" style="display:inline-block;background:#015961;color:white;padding:12px 24px;border-radius:4px;text-decoration:none;margin-top:16px;">View in Admin Panel</a>
      </div>
      ${footerHtml}
    </div>`,
  });
}

export async function sendBookingConfirmedToClient(booking: {
  full_name: string;
  email: string;
  booking_id: string;
  event_date: string;
  category: string;
  venue?: string;
  guests?: number;
  budget?: string | null;
  final_amount?: string | null;
  admin_notes?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const trackUrl = `${siteUrl}/track?id=${encodeURIComponent(booking.booking_id)}`;
  const firstName = esc(booking.full_name.split(/\s+/)[0] || booking.full_name);

  await getTransporter().sendMail({
    from: mailFrom(),
    to: booking.email,
    subject: header(`Your event is confirmed – ${booking.booking_id} | Regal Event London`),
    text: [
      `Dear ${booking.full_name},`,
      "",
      "Wonderful news — Regal Event London has confirmed your booking.",
      "",
      `Booking ID: ${booking.booking_id}`,
      `Service: ${booking.category}`,
      `Date: ${formatEmailDate(booking.event_date)}`,
      booking.venue ? `Venue: ${booking.venue}` : "",
      booking.guests ? `Guests: ${booking.guests}` : "",
      booking.budget ? `Estimated budget: ${booking.budget}` : "",
      booking.final_amount ? `Confirmed amount: ${booking.final_amount}` : "",
      booking.admin_notes ? `Note from our team: ${booking.admin_notes}` : "",
      "",
      `View your booking: ${trackUrl}`,
      "",
      "We look forward to creating something extraordinary for you.",
      "Regal Event London",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `<div style="${baseStyle}">
      ${headerHtml}
      <div style="background:linear-gradient(135deg,#015961,#012D32);padding:28px 32px;text-align:center;">
        <p style="margin:0 0 8px;color:#FCCD97;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Booking confirmed</p>
        <h2 style="margin:0;color:#F9F4EE;font-size:24px;font-weight:400;">Your celebration is on the calendar</h2>
      </div>
      <div style="padding:32px;">
        <p style="color:#444;line-height:1.8;margin:0 0 16px;font-size:15px;">Dear <strong>${esc(booking.full_name)}</strong>,</p>
        <p style="color:#444;line-height:1.8;margin:0 0 20px;font-size:15px;">
          We are delighted to confirm your <strong>${esc(booking.category)}</strong> with Regal Event London.
          Our team is preparing every detail so your event reflects the elegance you expect from us.
        </p>
        <div style="text-align:center;background:#EDE5D8;border:1px solid #FCCD97;border-radius:8px;padding:20px;margin:0 0 8px;">
          <p style="margin:0 0 6px;color:#666;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Reference</p>
          <p style="margin:0;font-size:26px;color:#015961;font-weight:bold;letter-spacing:2px;">${esc(booking.booking_id)}</p>
        </div>
        ${bookingDetailsTable(booking)}
        ${booking.admin_notes ? `<div style="background:#fff;border:1px solid #FCCD97;border-radius:6px;padding:18px;margin:20px 0;"><p style="margin:0 0 8px;color:#015961;font-size:12px;font-weight:bold;letter-spacing:1px;">MESSAGE FROM OUR TEAM</p><p style="margin:0;color:#444;line-height:1.7;white-space:pre-wrap;">${esc(booking.admin_notes)}</p></div>` : ""}
        <div style="background:#F9F4EE;border-radius:6px;padding:18px 20px;margin:24px 0;">
          <p style="margin:0 0 10px;color:#015961;font-size:13px;font-weight:bold;letter-spacing:1px;">WHAT HAPPENS NEXT</p>
          <ul style="margin:0;padding-left:18px;color:#555;line-height:1.8;font-size:14px;">
            <li>We may contact you to finalise décor, timings, and special requests.</li>
            <li>Keep your booking reference safe to track your enquiry online.</li>
            <li>If your plans change, reply to this email or contact us as soon as possible.</li>
          </ul>
        </div>
        <div style="text-align:center;margin-top:28px;">
          <a href="${esc(trackUrl)}" style="display:inline-block;background:#015961;color:#FCCD97;padding:14px 32px;border-radius:4px;text-decoration:none;font-weight:bold;letter-spacing:1px;font-size:14px;">View your booking →</a>
        </div>
        <p style="color:#888;font-size:13px;line-height:1.6;margin:28px 0 0;text-align:center;">
          Thank you for choosing Regal Event London, ${firstName}. We cannot wait to bring your vision to life.
        </p>
      </div>
      ${footerHtml}
    </div>`,
  });
}

/** Notify client when admin changes booking status (skips if unchanged). */
export async function sendBookingStatusChangeEmail(
  booking: {
    full_name: string;
    email: string;
    booking_id: string;
    event_date: string;
    category: string;
    venue?: string | null;
    guests?: number | null;
    admin_notes?: string | null;
    budget?: string | null;
    final_amount?: string | null;
  },
  previousStatus: string,
  newStatus: string
): Promise<boolean> {
  if (!isEmailConfigured() || previousStatus === newStatus) return false;

  const payload = {
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

  const next = newStatus.trim();
  if (next === "Confirmed") {
    await sendBookingConfirmedToClient(payload);
  } else {
    await sendStatusUpdateToClient({ ...payload, status: next });
  }
  return true;
}

/** Emails sent when a new booking is created (public form or admin). */
export async function sendNewBookingEmails(booking: {
  full_name: string;
  email: string;
  phone: string;
  booking_id: string;
  event_date: string;
  category: string;
  venue?: string;
  guests?: number;
  budget?: string;
  notes?: string;
}): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  await Promise.all([
    sendBookingConfirmationToClient(booking),
    sendBookingAlertToAdmin(booking),
  ]);
  return true;
}

export async function sendStatusUpdateToClient(booking: {
  full_name: string;
  email: string;
  booking_id: string;
  status: string;
  admin_notes?: string;
  event_date: string;
  category: string;
}) {
  if (booking.status.trim() === "Confirmed") {
    await sendBookingConfirmedToClient({
      full_name: booking.full_name,
      email: booking.email,
      booking_id: booking.booking_id,
      event_date: booking.event_date,
      category: booking.category,
      admin_notes: booking.admin_notes,
    });
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const trackUrl = `${siteUrl}/track?id=${encodeURIComponent(booking.booking_id)}`;
  const statusColors: Record<string, string> = {
    Pending: "#D4A567",
    Confirmed: "#015961",
    Completed: "#2d6a4f",
    Cancelled: "#c1121f",
  };
  const color = statusColors[booking.status] || "#015961";
  const statusMessages: Record<string, string> = {
    Pending: "Your enquiry is in our queue. We will review the details and be in touch shortly.",
    Completed: "Your event with Regal Event London is marked complete. Thank you for celebrating with us.",
    Cancelled: "This booking has been cancelled. If you have questions, please contact our team.",
  };
  const message =
    statusMessages[booking.status] ||
    `Your booking status is now ${booking.status}.`;

  await getTransporter().sendMail({
    from: mailFrom(),
    to: booking.email,
    subject: header(`Booking update – ${booking.booking_id} | Regal Event London`),
    html: `<div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:32px;">
        <h2 style="color:#015961;font-size:22px;margin:0 0 12px;">Booking update</h2>
        <p style="color:#444;line-height:1.7;">Dear <strong>${esc(booking.full_name)}</strong>,</p>
        <p style="color:#444;line-height:1.7;">${esc(message)}</p>
        <p style="color:#666;font-size:13px;margin:16px 0;">Reference: <strong>${esc(booking.booking_id)}</strong> · ${esc(booking.category)} · ${esc(formatEmailDate(booking.event_date))}</p>
        <div style="display:inline-block;background:${color};color:white;padding:10px 24px;border-radius:20px;font-size:16px;font-weight:bold;margin:8px 0 16px;">${esc(booking.status)}</div>
        ${booking.admin_notes ? `<div style="background:#EDE5D8;border-left:4px solid #FCCD97;padding:16px;border-radius:4px;margin:16px 0;"><p style="margin:0 0 4px;color:#666;font-size:12px;">Note from our team:</p><p style="margin:0;color:#333;white-space:pre-wrap;">${esc(booking.admin_notes)}</p></div>` : ""}
        <a href="${esc(trackUrl)}" style="display:inline-block;background:#015961;color:#FCCD97;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;margin-top:8px;">View your booking →</a>
      </div>
      ${footerHtml}
    </div>`,
  });
}

export async function sendReviewInviteToClient(booking: {
  full_name: string;
  email: string;
  booking_id: string;
  event_date: string;
  category: string;
  review_url: string;
}) {
  await getTransporter().sendMail({
    from: mailFrom(),
    to: booking.email,
    subject: header(`Share Your Experience – ${booking.booking_id} | Regal Event London`),
    html: `<div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:32px;">
        <h2 style="color:#015961;font-size:22px;margin:0 0 16px;">We Hope Your Event Was Extraordinary</h2>
        <p style="color:#444;line-height:1.7;">Dear <strong>${esc(booking.full_name)}</strong>,</p>
        <p style="color:#444;line-height:1.7;">Thank you for trusting Regal Event London with your <strong>${esc(booking.category)}</strong> on <strong>${esc(formatEmailDate(booking.event_date))}</strong>. We would be honoured to hear about your experience.</p>
        <p style="color:#444;line-height:1.7;">Your words help future clients discover the care and craft behind every celebration we design.</p>
        <a href="${esc(booking.review_url)}" style="display:inline-block;background:#015961;color:#FCCD97;padding:14px 28px;border-radius:4px;text-decoration:none;font-weight:bold;margin:20px 0;">Leave Your Review →</a>
        <p style="color:#888;font-size:12px;line-height:1.6;">This personal link expires in 90 days. Reviews are moderated before appearing on our website.</p>
      </div>
      ${footerHtml}
    </div>`,
  });
}

export async function sendReviewSubmittedAlertToAdmin(review: {
  client_name: string;
  booking_id: string;
  event_title: string;
  rating: number;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await getTransporter().sendMail({
    from: mailFrom(),
    to: adminRecipient(),
    subject: header(`New Review Pending – ${review.client_name}`),
    html: `<div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:24px;">
        <h2 style="color:#015961;">Review Awaiting Approval</h2>
        <p style="color:#444;"><strong>${esc(review.client_name)}</strong> submitted a ${esc(review.rating)}★ review for booking <strong>${esc(review.booking_id)}</strong>.</p>
        <p style="color:#666;">Event: ${esc(review.event_title)}</p>
        <a href="${esc(siteUrl)}/admin/reviews" style="display:inline-block;background:#015961;color:white;padding:12px 24px;border-radius:4px;text-decoration:none;margin-top:16px;">Moderate in Admin →</a>
      </div>
      ${footerHtml}
    </div>`,
  });
}

export async function sendContactAlertToAdmin(contact: {
  full_name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  await getTransporter().sendMail({
    from: mailFrom(),
    to: adminRecipient(),
    subject: header(`New Contact Message from ${contact.full_name}`),
    html: `<div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:24px;">
        <h2 style="color:#015961;">New Contact Enquiry</h2>
        <p><strong>Name:</strong> ${esc(contact.full_name)}</p>
        <p><strong>Email:</strong> ${esc(contact.email)}</p>
        ${contact.phone ? `<p><strong>Phone:</strong> ${esc(contact.phone)}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p style="background:#EDE5D8;padding:16px;border-radius:4px;line-height:1.7;white-space:pre-wrap;">${esc(contact.message)}</p>
      </div>
      ${footerHtml}
    </div>`,
  });
}
