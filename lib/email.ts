import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
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
    from: process.env.EMAIL_FROM,
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
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
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

export async function sendStatusUpdateToClient(booking: {
  full_name: string;
  email: string;
  booking_id: string;
  status: string;
  admin_notes?: string;
  event_date: string;
  category: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const trackUrl = `${siteUrl}/track?id=${encodeURIComponent(booking.booking_id)}`;
  const statusColors: Record<string, string> = {
    Pending: "#D4A567",
    Confirmed: "#015961",
    Completed: "#2d6a4f",
    Cancelled: "#c1121f",
  };
  const color = statusColors[booking.status] || "#015961";
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: booking.email,
    subject: header(`Booking Update – ${booking.booking_id} is now ${booking.status}`),
    html: `<div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:32px;">
        <h2 style="color:#015961;">Booking Status Updated</h2>
        <p style="color:#444;">Dear <strong>${esc(booking.full_name)}</strong>, your booking <strong>${esc(booking.booking_id)}</strong> has been updated.</p>
        <div style="display:inline-block;background:${color};color:white;padding:10px 24px;border-radius:20px;font-size:18px;font-weight:bold;margin:16px 0;">${esc(booking.status)}</div>
        ${booking.admin_notes ? `<div style="background:#EDE5D8;border-left:4px solid #FCCD97;padding:16px;border-radius:4px;margin:16px 0;"><p style="margin:0 0 4px;color:#666;font-size:12px;">Note from our team:</p><p style="margin:0;color:#333;white-space:pre-wrap;">${esc(booking.admin_notes)}</p></div>` : ""}
        <a href="${esc(trackUrl)}" style="display:inline-block;background:#015961;color:#FCCD97;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;margin-top:16px;">Track Your Booking →</a>
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
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
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
