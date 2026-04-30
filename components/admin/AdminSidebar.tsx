"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/admin/bookings",  label: "Bookings",  icon: "♢" },
  { href: "/admin/categories", label: "Categories", icon: "✦" },
  { href: "/admin/gallery",   label: "Gallery",   icon: "◇" },
  { href: "/admin/videos",    label: "Videos",    icon: "▶" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Reset open drawer on route change (derived-state pattern; safe during render)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (open) setOpen(false);
  }

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const linkStyle = (active: boolean): React.CSSProperties => active
    ? { backgroundColor: "#FCCD97", color: "#012D32" }
    : { color: "rgba(255,255,255,0.6)" };

  const linkInner = (
    <>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={linkStyle(active)}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
              }
            }}
          >
            <span className="text-base w-5 text-center" style={{ color: active ? "#012D32" : "#FCCD97" }}>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "#012D32", borderBottom: "1px solid rgba(252,205,151,0.1)" }}>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div style={{ width:32, height:32, borderRadius:"50%", overflow:"hidden", background:"#022C32", filter:"drop-shadow(0 0 8px rgba(252,205,151,0.28))" }}>
            <Image src="/Final Logo.png" alt="Regal Event" width={32} height={32} style={{ objectFit:"cover", width:"100%", height:"100%", display:"block", transform:"scale(1.04)" }} />
          </div>
          <span style={{ color:"#FCCD97", fontFamily:"var(--font-cormorant),serif", letterSpacing:".08em", fontWeight:600 }}>REGAL</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          style={{ color:"#FCCD97", padding:8, background:"transparent", border:"none", cursor:"pointer" }}
        >
          <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background:"rgba(1,15,18,.6)", backdropFilter:"blur(4px)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <aside
        className={`flex flex-col flex-shrink-0 fixed lg:sticky top-0 left-0 h-screen z-50 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          width: "min(82vw, 280px)",
          backgroundColor: "#012D32",
          borderRight: "1px solid rgba(252,205,151,0.1)",
        }}
      >
        {/* Header (desktop) */}
        <div
          className="p-5 border-b hidden lg:block"
          style={{ borderColor: "rgba(252,205,151,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0" style={{ filter:"drop-shadow(0 0 10px rgba(252,205,151,0.3)) drop-shadow(0 3px 8px rgba(0,0,0,0.5))" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", overflow:"hidden", background:"#022C32" }}>
                <Image src="/Final Logo.png" alt="Regal Event" width={44} height={44} style={{ objectFit:"cover", width:"100%", height:"100%", display:"block", transform:"scale(1.04)" }} />
              </div>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight"
                style={{ color: "#FCCD97", fontFamily: "var(--font-cormorant), serif", letterSpacing: "0.08em" }}>
                REGAL EVENT
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Mobile header (only inside open drawer) */}
        <div className="p-5 border-b lg:hidden flex items-center justify-between"
          style={{ borderColor: "rgba(252,205,151,0.1)" }}>
          <span style={{ color:"#FCCD97", fontFamily:"var(--font-cormorant),serif", letterSpacing:".08em", fontWeight:600 }}>REGAL EVENT</span>
          <button onClick={() => setOpen(false)} aria-label="Close" style={{ color:"#FCCD97", background:"transparent", border:"none", cursor:"pointer", padding:6 }}>
            <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {linkInner}
        </nav>

        <div className="p-3 border-t space-y-1" style={{ borderColor: "rgba(252,205,151,0.1)" }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span className="w-5 text-center" style={{ color:"#FCCD97" }}>◉</span>
            View Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 text-left" style={{ color: "rgba(255,255,255,0.5)", background:"transparent", border:"none", cursor:"pointer" }}>
            <span className="w-5 text-center" style={{ color:"#FCCD97" }}>↪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
