"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/admin/bookings", label: "Bookings", icon: "♢" },
  { href: "/admin/reviews", label: "Reviews", icon: "❝" },
  { href: "/admin/categories", label: "Categories", icon: "✦" },
  { href: "/admin/gallery", label: "Gallery", icon: "◇" },
  { href: "/admin/videos", label: "Videos", icon: "▶" },
  { href: "/admin/settings", label: "Settings", icon: "⬡" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [prevPath, setPrevPath] = useState(pathname);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (open) onClose();
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const linkStyle = (active: boolean): React.CSSProperties =>
    active
      ? { backgroundColor: "#FCCD97", color: "#012D32" }
      : { color: "rgba(255,255,255,0.6)" };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(82vw,280px)] shrink-0 flex-col border-r transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{
        backgroundColor: "#012D32",
        borderColor: "rgba(252,205,151,0.1)",
      }}
      aria-label="Admin navigation"
    >
      <div
        className="hidden border-b p-5 lg:block"
        style={{ borderColor: "rgba(252,205,151,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0"
            style={{
              filter:
                "drop-shadow(0 0 10px rgba(252,205,151,0.3)) drop-shadow(0 3px 8px rgba(0,0,0,0.5))",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#022C32",
              }}
            >
              <Image
                src="/Final Logo.png"
                alt="Regal Event"
                width={44}
                height={44}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  display: "block",
                  transform: "scale(1.04)",
                }}
              />
            </div>
          </div>
          <div>
            <p
              className="text-sm font-bold leading-tight"
              style={{
                color: "#FCCD97",
                fontFamily: "var(--font-cormorant), serif",
                letterSpacing: "0.08em",
              }}
            >
              REGAL EVENT
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between border-b p-5 lg:hidden"
        style={{ borderColor: "rgba(252,205,151,0.1)" }}
      >
        <span
          style={{
            color: "#FCCD97",
            fontFamily: "var(--font-cormorant),serif",
            letterSpacing: ".08em",
            fontWeight: 600,
          }}
        >
          REGAL EVENT
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          style={{
            color: "#FCCD97",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 6,
          }}
        >
          <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200"
              style={linkStyle(active)}
            >
              <span
                className="w-5 text-center text-base"
                style={{ color: active ? "#012D32" : "#FCCD97" }}
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="space-y-1 border-t p-3"
        style={{ borderColor: "rgba(252,205,151,0.1)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <span className="w-5 text-center" style={{ color: "#FCCD97" }}>
            ◉
          </span>
          View Site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all duration-200"
          style={{
            color: "rgba(255,255,255,0.5)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span className="w-5 text-center" style={{ color: "#FCCD97" }}>
            ↪
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
