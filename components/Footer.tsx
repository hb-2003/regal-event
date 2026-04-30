"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const quickLinks = [["Home","/"],["About","/about"],["Services","/categories"],["Gallery","/gallery"],["Videos","/videos"],["Contact","/contact"]];
const services = ["Birthday Decoration","Baby Shower","Engagement","Haldi Ceremony","Corporate Event","Anniversary"];

const socialLinks = [
  { l: "in", h: "#", label: "LinkedIn" },
  { l: "ig", h: "#", label: "Instagram" },
  { l: "tw", h: "#", label: "Twitter" },
  { l: "wa", h: "https://wa.me/447700000000", label: "WhatsApp" },
];

const contactItems = [
  { icon: "◈", text: "London, United Kingdom" },
  { icon: "☏", text: "+44 7700 000 000", href: "tel:+447700000000" },
  { icon: "✉", text: "info@regalevent.co.uk", href: "mailto:info@regalevent.co.uk" },
  { icon: "◷", text: "Mon–Sat · 9am–8pm" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { yPercent: 40, scale: 0.9 },
        {
          yPercent: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: textRef.current.parentElement,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    }
  }, []);

  return (
    <footer style={{ background:"#010E10", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(252,205,151,.05)" }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: "1400px",
          paddingInline: "var(--gutter)",
          paddingTop: "clamp(60px, 10vw, 100px)",
          paddingBottom: "24px"
        }}
      >
        <div className="footer-grid">
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <Link href="/" style={{ textDecoration:"none", display: "inline-block", marginBottom: 32 }}>
                <span style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.8rem, 2.5vw, 2.2rem)", fontWeight:400, color:"#FCCD97", display:"block", lineHeight: 1 }}>
                  Regal Event
                </span>
                <span style={{ fontSize:".65rem", letterSpacing:".25em", textTransform:"uppercase", color:"rgba(249,244,238,.4)", marginTop: 8, display:"block" }}>
                  London
                </span>
              </Link>
              <p style={{ fontSize:".9rem", color:"rgba(249,244,238,.4)", lineHeight:1.8, maxWidth:320 }}>
                Crafting extraordinary celebrations with unparalleled elegance and meticulous care since 2019.
              </p>
            </div>

            <div style={{ display:"flex", gap:12, marginTop:40, flexWrap:"wrap" }}>
              {socialLinks.map(s => (
                <a key={s.l} href={s.h} aria-label={s.label} className="footer-social-link">
                  {s.l}
                </a>
              ))}
            </div>
          </div>

          {/* Links Section Wrapper */}
          <div className="footer-links-wrapper">
            {/* Quick Links */}
            <div>
              <h4 className="footer-heading">Explore</h4>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:16 }}>
                {quickLinks.map(([label,href])=>(
                  <li key={href}>
                    <Link href={href} className="footer-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="footer-heading">Services</h4>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:16 }}>
                {services.map(s=>(
                  <li key={s}>
                    <Link href="/categories" className="footer-link">{s}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="footer-heading">Contact</h4>
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                {contactItems.map(item => (
                  <div key={item.text} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <span style={{ color:"rgba(252,205,151,0.5)", fontSize:".9rem", marginTop:2 }}>{item.icon}</span>
                    {item.href
                      ? <a href={item.href} className="footer-link" style={{ lineHeight:1.5 }}>{item.text}</a>
                      : <span style={{ fontSize:".9rem", color:"rgba(249,244,238,.4)", lineHeight:1.5 }}>{item.text}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Massive Typography */}
        <div style={{
          marginTop: "clamp(80px, 12vw, 140px)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid rgba(252,205,151,.05)",
          paddingBottom: "clamp(20px, 4vw, 40px)",
          overflow: "hidden"
        }}>
          <span ref={textRef} style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(5rem, 18.5vw, 22rem)",
            fontWeight: 300,
            lineHeight: 0.75,
            letterSpacing: "-0.02em",
            color: "#F9F4EE",
            whiteSpace: "nowrap",
            opacity: 0.95,
            display: "inline-block"
          }}>
            R E G A L
          </span>
        </div>

        {/* Bottom */}
        <div style={{
          paddingTop: 24,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:16
        }}>
          <span style={{ fontSize:".75rem", color:"rgba(249,244,238,.3)", letterSpacing: ".05em" }}>
            © {year} REGAL EVENT LONDON. ALL RIGHTS RESERVED.
          </span>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {[["Track Booking","/track"],["Book an Event","/book"],["Admin","/admin/login"]].map(([l,h])=>(
              <Link key={h} href={h} style={{ fontSize:".75rem", color:"rgba(249,244,238,.3)", textDecoration:"none", transition:"color .3s", letterSpacing: ".05em" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#FCCD97"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(249,244,238,.3)"}
              >{l}</Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
        }
        .footer-links-wrapper {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        .footer-heading {
          font-size: .65rem;
          font-weight: 500;
          letter-spacing: .25em;
          text-transform: uppercase;
          color: #FCCD97;
          margin-bottom: 28px;
        }
        .footer-link {
          font-size: .95rem;
          color: rgba(249,244,238,.5);
          text-decoration: none;
          transition: color .3s, transform .3s;
          display: inline-block;
        }
        .footer-link:hover {
          color: #F9F4EE;
          transform: translateX(4px);
        }
        .footer-social-link {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(252,205,151,.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(249,244,238,.5);
          font-size: .8rem;
          text-decoration: none;
          transition: all .3s;
        }
        .footer-social-link:hover {
          border-color: #FCCD97;
          color: #111;
          background: #FCCD97;
          transform: translateY(-3px);
        }

        @media (min-width: 768px) {
          .footer-links-wrapper {
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1.8fr;
            gap: 80px;
          }
        }
      `}</style>
    </footer>
  );
}
