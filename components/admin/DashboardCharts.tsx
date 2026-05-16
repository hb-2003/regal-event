"use client";

import { useMemo } from "react";

type Booking = {
  category: string;
  event_date: string;
  status: string;
  created_at: string;
};

const STATUS_ORDER = ["Pending", "Confirmed", "Completed", "Cancelled"] as const;
const STATUS_COLORS: Record<string, string> = {
  Pending: "#D4A567",
  Confirmed: "#015961",
  Completed: "#2d6a4f",
  Cancelled: "#c1121f",
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-5 sm:p-6 h-full flex flex-col"
      style={{ backgroundColor: "white", border: "1px solid #EDE5D8" }}
    >
      <div className="mb-5">
        <h3
          className="text-lg font-bold"
          style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "#888" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

function DonutChart({
  segments,
  total,
}: {
  segments: { label: string; value: number; color: string }[];
  total: number;
}) {
  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const active = segments.filter((s) => s.value > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EDE5D8"
            strokeWidth={stroke}
          />
        </svg>
        <p className="text-sm" style={{ color: "#888" }}>
          No booking data yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {active.map((seg) => {
            const dash = (seg.value / total) * circumference;
            const circle = (
              <circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <span
            className="text-3xl font-bold"
            style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
          >
            {total}
          </span>
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "#888" }}>
            Total
          </span>
        </div>
      </div>
      <ul className="flex-1 space-y-3 w-full">
        {active.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span style={{ color: "#444" }}>{seg.label}</span>
            </span>
            <span className="font-semibold tabular-nums" style={{ color: "#012D32" }}>
              {seg.value}
              <span className="font-normal text-xs ml-1" style={{ color: "#999" }}>
                ({Math.round((seg.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarChart({
  items,
  maxValue,
}: {
  items: { label: string; value: number }[];
  maxValue: number;
}) {
  const peak = maxValue || 1;

  if (items.every((i) => i.value === 0)) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "#888" }}>
        No data for this period
      </p>
    );
  }

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-3 h-44 pt-2">
      {items.map((item) => {
        const pct = Math.max((item.value / peak) * 100, item.value > 0 ? 8 : 0);
        return (
          <div
            key={item.label}
            className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0 h-full"
          >
            <span className="text-xs font-semibold tabular-nums" style={{ color: "#015961" }}>
              {item.value > 0 ? item.value : ""}
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${pct}%`,
                minHeight: item.value > 0 ? 6 : 0,
                background: "linear-gradient(180deg, #015961, #012D32)",
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span
              className="text-[10px] sm:text-xs text-center leading-tight truncate w-full"
              style={{ color: "#666" }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBars({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  if (items.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "#888" }}>
        No categories yet
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={item.label}>
          <div className="flex justify-between text-xs mb-1 gap-2">
            <span className="truncate" style={{ color: "#444" }}>
              {item.label}
            </span>
            <span className="font-semibold tabular-nums shrink-0" style={{ color: "#012D32" }}>
              {item.value}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F9F4EE" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: `linear-gradient(90deg, #FCCD97, ${i % 2 === 0 ? "#015961" : "#012D32"})`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function buildMonthBuckets(bookings: Booking[]) {
  const now = new Date();
  const months: { key: string; label: string; value: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short" });
    months.push({ key, label, value: 0 });
  }

  for (const b of bookings) {
    const raw = b.created_at || b.event_date;
    if (!raw) continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.value += 1;
  }

  return months.map(({ label, value }) => ({ label, value }));
}

export default function DashboardCharts({ bookings }: { bookings: Booking[] }) {
  const statusSegments = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUS_ORDER) counts[s] = 0;
    for (const b of bookings) {
      counts[b.status] = (counts[b.status] || 0) + 1;
    }
    return STATUS_ORDER.map((label) => ({
      label,
      value: counts[label] || 0,
      color: STATUS_COLORS[label],
    }));
  }, [bookings]);

  const statusTotal = bookings.length;

  const monthBars = useMemo(() => buildMonthBuckets(bookings), [bookings]);
  const monthMax = Math.max(...monthBars.map((m) => m.value), 0);

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bookings) {
      const cat = b.category?.trim() || "Uncategorised";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [bookings]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <ChartCard title="Booking status" subtitle="Share of enquiries by pipeline stage">
        <DonutChart segments={statusSegments} total={statusTotal} />
      </ChartCard>

      <ChartCard title="Bookings over time" subtitle="New requests by month (last 6 months)">
        <BarChart items={monthBars} maxValue={monthMax} />
      </ChartCard>

      <ChartCard title="Popular services" subtitle="Most requested event categories">
        <HorizontalBars items={topCategories} />
      </ChartCard>

      <ChartCard title="Pipeline health" subtitle="At-a-glance workload">
        <div className="grid grid-cols-2 gap-3 h-full content-center">
          {STATUS_ORDER.map((status) => {
            const count = bookings.filter((b) => b.status === status).length;
            return (
              <div
                key={status}
                className="rounded-lg p-4 text-center"
                style={{
                  backgroundColor: STATUS_COLORS[status] + "14",
                  border: `1px solid ${STATUS_COLORS[status]}33`,
                }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: STATUS_COLORS[status],
                    fontFamily: "var(--font-cormorant), serif",
                  }}
                >
                  {count}
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "#666" }}>
                  {status}
                </p>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
