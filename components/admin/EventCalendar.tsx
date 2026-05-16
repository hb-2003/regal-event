"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusColors: Record<string, string> = {
  Pending: "#D4A567",
  Confirmed: "#015961",
  Completed: "#2d6a4f",
  Cancelled: "#c1121f",
};

export type CalendarBooking = {
  id: number;
  booking_id: string;
  full_name: string;
  event_date: string;
  category: string;
  venue: string | null;
  status: string;
};

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function eventDayKey(eventDate: string): string {
  const t = eventDate.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return t.slice(0, 10);
  return toYmd(d);
}

function monthDays(year: number, month: number): Date[] {
  const first = new Date(Date.UTC(year, month, 1));
  const startPad = (first.getUTCDay() + 6) % 7;
  const start = new Date(Date.UTC(year, month, 1 - startPad));
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    days.push(d);
  }
  return days;
}

type Props = {
  bookings: CalendarBooking[];
  loading?: boolean;
};

export default function EventCalendar({ bookings, loading }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedYmd, setSelectedYmd] = useState<string | null>(toYmd(today));

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const b of bookings) {
      if (b.status === "Cancelled") continue;
      const key = eventDayKey(b.event_date);
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }
    return map;
  }, [bookings]);

  const days = useMemo(() => monthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const selectedEvents = selectedYmd ? byDay.get(selectedYmd) ?? [] : [];

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  const todayYmd = toYmd(today);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      <div
        className="rounded-2xl p-4 sm:p-6 bg-white"
        style={{ border: "1px solid #EDE5D8" }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-[#F9F4EE]"
            style={{ color: "#015961" }}
            aria-label="Previous month"
          >
            ‹
          </button>
          <h2
            className="text-lg font-semibold"
            style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
          >
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-[#F9F4EE]"
            style={{ color: "#015961" }}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {loading ? (
          <p className="text-sm py-12 text-center" style={{ color: "#888" }}>
            Loading events…
          </p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="text-center text-[10px] font-semibold uppercase tracking-wider py-1"
                  style={{ color: "#888" }}
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => {
                const inMonth = d.getUTCMonth() === viewMonth;
                const ymd = toYmd(d);
                const events = byDay.get(ymd) ?? [];
                const count = events.length;
                const isToday = ymd === todayYmd;
                const isSelected = ymd === selectedYmd;

                return (
                  <button
                    key={ymd}
                    type="button"
                    onClick={() => inMonth && setSelectedYmd(ymd)}
                    disabled={!inMonth}
                    className="relative aspect-square text-xs rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 p-0.5"
                    style={{
                      opacity: inMonth ? 1 : 0.2,
                      backgroundColor: isSelected
                        ? "#015961"
                        : count > 0
                          ? "#F9F4EE"
                          : inMonth
                            ? "white"
                            : "transparent",
                      color: isSelected ? "#FCCD97" : count > 0 ? "#012D32" : "#333",
                      border: isToday
                        ? "2px solid #FCCD97"
                        : isSelected
                          ? "none"
                          : "1px solid #EDE5D8",
                      fontWeight: count > 0 || isSelected ? 600 : 400,
                      cursor: inMonth ? "pointer" : "default",
                    }}
                  >
                    <span>{d.getUTCDate()}</span>
                    {count > 0 && inMonth && (
                      <span
                        className="text-[9px] leading-none px-1 rounded"
                        style={{
                          backgroundColor: isSelected ? "rgba(252,205,151,0.25)" : "#015961",
                          color: isSelected ? "#FCCD97" : "white",
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-xs" style={{ borderColor: "#EDE5D8", color: "#666" }}>
              {Object.entries(statusColors).map(([status, color]) => (
                <span key={status} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  />
                  {status}
                </span>
              ))}
              <span className="text-[#888]">Cancelled bookings are hidden</span>
            </div>
          </>
        )}
      </div>

      <div
        className="rounded-2xl p-4 sm:p-5 bg-white h-fit xl:sticky xl:top-6"
        style={{ border: "1px solid #EDE5D8" }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: "#555" }}
        >
          {selectedYmd
            ? new Date(selectedYmd + "T12:00:00").toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Select a day"}
        </p>

        {selectedEvents.length === 0 ? (
          <p className="text-sm" style={{ color: "#888" }}>
            No events on this day.
          </p>
        ) : (
          <ul className="space-y-3">
            {selectedEvents.map((b) => (
              <li
                key={b.id}
                className="rounded-lg p-3"
                style={{ backgroundColor: "#F9F4EE", border: "1px solid #EDE5D8" }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: "#012D32" }}>
                    {b.full_name}
                  </p>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
                    style={{
                      backgroundColor: statusColors[b.status] ?? "#888",
                      color: b.status === "Pending" ? "#012D32" : "white",
                    }}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "#555" }}>
                  {b.category}
                </p>
                {b.venue && (
                  <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                    {b.venue}
                  </p>
                )}
                <p className="text-[10px] mt-2 font-mono" style={{ color: "#015961" }}>
                  {b.booking_id}
                </p>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/admin/bookings"
          className="mt-4 block text-center text-xs font-semibold tracking-wider py-2.5 rounded-lg"
          style={{ backgroundColor: "#015961", color: "#FCCD97" }}
        >
          Manage all bookings →
        </Link>
      </div>
    </div>
  );
}
