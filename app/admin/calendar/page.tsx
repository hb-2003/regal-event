"use client";

import { useEffect, useState } from "react";
import EventCalendar, { type CalendarBooking } from "@/components/admin/EventCalendar";

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/bookings");
        const data = res.ok ? await res.json() : [];
        if (!cancelled && Array.isArray(data)) {
          setBookings(
            data.map((b: CalendarBooking) => ({
              id: b.id,
              booking_id: b.booking_id,
              full_name: b.full_name,
              event_date: b.event_date,
              category: b.category,
              venue: b.venue ?? null,
              status: b.status,
            }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-bold"
          style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
        >
          Event calendar
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#888" }}>
          All bookings by event date. Click a day to see what is scheduled.
        </p>
      </div>

      <EventCalendar bookings={bookings} loading={loading} />
    </div>
  );
}
