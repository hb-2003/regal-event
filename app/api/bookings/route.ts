import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
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

  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = "SELECT * FROM bookings";
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (status && status !== "all") {
    conditions.push("status = ?");
    params.push(status);
  }
  if (search) {
    const safe = `%${escapeLike(search)}%`;
    conditions.push(
      "(full_name LIKE ? ESCAPE '\\' OR booking_id LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\')"
    );
    params.push(safe, safe, safe);
  }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY created_at DESC LIMIT 500";

  const res = await db.execute({ sql: query, args: params });

  // Transform rows from @libsql/client
  const bookings = res.rows.map(row => {
    const obj: Record<string, any> = {};
    for (let i = 0; i < res.columns.length; i++) {
      obj[res.columns[i]] = row[i] ?? row[res.columns[i]];
    }
    return obj;
  });

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

  const db = await getDb();
  const booking_id = generateBookingId();

  await db.execute({
    sql: `
    INSERT INTO bookings (booking_id, full_name, phone, email, event_date, category, venue, guests, budget, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    args: [
      booking_id,
      full_name,
      phone,
      email,
      event_date,
      category,
      venue,
      guests,
      budget,
      notes
    ]
  });

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
