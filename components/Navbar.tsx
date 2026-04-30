"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";



const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/categories", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/videos", label: "Videos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:1000,
      paddingTop: scrolled ? 10 : 18, paddingBottom: scrolled ? 10 : 18,
      paddingLeft: "var(--gutter)", paddingRight: "var(--gutter)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: scrolled ? "rgba(1,31,35,0.92)" : "linear-gradient(to bottom,rgba(1,31,35,0.85) 0%,transparent 100%)",
      backdropFilter: scrolled ? "blur(24px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(252,205,151,0.09)" : "none",
      transition:"padding .4s, background .4s",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:12, textDecoration:"none" }}>
        <div style={{
          width:48, height:48, flexShrink:0,
          filter:"drop-shadow(0 0 18px rgba(252,205,151,0.45)) drop-shadow(0 4px 14px rgba(0,0,0,0.55))",
        }}>
          <div style={{ width:"100%", height:"100%", borderRadius:"50%", overflow:"hidden", background:"#012D32" }}>
            <Image
              src="/Final Logo.png" alt="Regal Event London"
              width={48} height={48}
              style={{ objectFit:"cover", width:"100%", height:"100%", transform:"scale(1.04)" }}
              priority
            />
          </div>
        </div>
        <span style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"1.15rem", fontWeight:600, color:"#F9F4EE", letterSpacing:".12em", lineHeight:1.1 }}>
          REGAL<br/><span style={{ color:"#FCCD97", fontSize:".8rem", fontWeight:400, letterSpacing:".22em" }}>EVENT</span>
        </span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center" style={{ gap:2 }}>
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} className="nav-link-item" data-active={active}
              style={{
                position:"relative", padding:"8px 16px", textDecoration:"none",
                fontFamily:"var(--font-jost),sans-serif", fontSize:".71rem",
                fontWeight:400, letterSpacing:".15em", textTransform:"uppercase",
                color: active ? "#FCCD97" : "rgba(249,244,238,.6)", transition:"color .3s",
              }}
              onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLElement).style.color="#FCCD97"; }}
              onMouseLeave={e=>{ if(!active)(e.currentTarget as HTMLElement).style.color="rgba(249,244,238,.6)"; }}
            >
              {l.label}
              {/* Animated underline */}
              <span style={{
                position:"absolute", bottom:2, left:16, right:16, height:1,
                background:"#FCCD97",
                transformOrigin: active ? "left" : "right",
                transform: active ? "scaleX(1)" : "scaleX(0)",
                transition:"transform .35s cubic-bezier(.16,1,.3,1)",
              }} className="nav-underline" />
            </Link>
          );
        })}
        <Link href="/book" className="btn-gold btn-magnetic" style={{ marginLeft:14, padding:"10px 22px", fontSize:".68rem" }}>
          <span>Book Event</span>
        </Link>
      </div>

      <style jsx>{`
        .nav-link-item:hover .nav-underline {
          transform: scaleX(1) !important;
          transform-origin: left !important;
        }
      `}</style>

      {/* Mobile hamburger */}
      <button
        className="md:hidden inline-flex items-center justify-center"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        style={{
          background:"none", border:"none", cursor:"pointer", color:"#FCCD97",
          width:44, height:44,
        }}
      >
        <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* Mobile overlay */}
      <button
        type="button"
        className="md:hidden"
        aria-label="Close menu overlay"
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,10,12,0.62) 0%, rgba(0,8,10,0.76) 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .25s ease",
          border: "none",
          cursor: "pointer",
          zIndex: 0,
        }}
      />

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className="md:hidden"
        aria-hidden={!open}
        style={{
          position:"absolute", top:"100%", left:0, right:0,
          background:"linear-gradient(140deg, rgba(1,31,35,0.76) 0%, rgba(2,44,50,0.68) 55%, rgba(1,31,35,0.8) 100%)",
          backdropFilter:"blur(24px) saturate(140%)",
          WebkitBackdropFilter:"blur(24px) saturate(140%)",
          borderTop:"1px solid rgba(252,205,151,.24)",
          boxShadow:"0 30px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(252,205,151,.18)",
          paddingInline: "var(--gutter)",
          paddingBlock: open ? "20px 26px" : "0 26px",
          maxHeight: open ? "calc(100dvh - 80px)" : "0px",
          overflowY: "auto",
          overflowX: "hidden",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "max-height .35s cubic-bezier(.4,0,.2,1), opacity .25s ease, padding .25s ease",
          zIndex: 1,
        }}
      >
        {links.map((l) => (
          <Link key={l.href} href={l.href} style={{
            display:"block", padding:"11px 0", textDecoration:"none",
            fontFamily:"var(--font-jost),sans-serif", fontSize:".78rem",
            letterSpacing:".14em", textTransform:"uppercase",
            color: pathname===l.href ? "#FCCD97" : "rgba(249,244,238,.65)",
            borderBottom:"1px solid rgba(252,205,151,.06)",
          }}>{l.label}</Link>
        ))}
        <Link href="/book" className="btn-gold" style={{ display:"block", textAlign:"center", marginTop:18, padding:13 }}>
          <span>Book Event</span>
        </Link>
        <Link
          href="/track"
          className="btn-outline"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 10,
            padding: 13,
          }}
        >
          Track Booking
        </Link>
      </div>
    </nav>
  );
}
