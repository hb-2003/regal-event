"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#011F23" }}>
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu backdrop"
        />
      )}
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden"
          style={{
            backgroundColor: "#012D32",
            borderColor: "rgba(252,205,151,0.1)",
          }}
        >
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#022C32",
              }}
            >
              <Image
                src="/Final Logo.png"
                alt="Regal Event"
                width={32}
                height={32}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            </div>
            <span
              style={{
                color: "#FCCD97",
                fontFamily: "var(--font-cormorant),serif",
                letterSpacing: ".08em",
                fontWeight: 600,
              }}
            >
              REGAL
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            style={{
              color: "#FCCD97",
              padding: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        <main
          className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8"
          style={{ backgroundColor: "#F9F4EE" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
