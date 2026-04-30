"use client";
import Link from "next/link";
import Image from "next/image";

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

  return (
    <footer style={{ background:"#010E10", borderTop:"1px solid rgba(252,205,151,.06)" }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: "1280px",
          paddingInline: "var(--gutter)",
          paddingBlock: "clamp(48px, 8vw, 72px)",
        }}
      >
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:14, textDecoration:"none", marginBottom:20 }}>
              <div style={{ flexShrink:0, filter:"drop-shadow(0 0 16px rgba(252,205,151,0.38)) drop-shadow(0 6px 16px rgba(0,0,0,0.55))" }}>
                <div style={{ width:60, height:60, borderRadius:"50%", overflow:"hidden", background:"#012D32" }}>
                  <Image src="/Final Logo.png" alt="Regal Event" width={60} height={60}
                    style={{ objectFit:"cover", width:"100%", height:"100%", display:"block", transform:"scale(1.04)" }} />
                </div>
              </div>
              <div>
                <span style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"1.25rem", fontWeight:600, color:"#F9F4EE", display:"block", letterSpacing:".1em" }}>REGAL EVENT</span>
                <span style={{ fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"rgba(252,205,151,.5)" }}>London</span>
              </div>
            </Link>
            <p style={{ fontSize:".83rem", color:"rgba(249,244,238,.38)", lineHeight:1.8, maxWidth:300 }}>
              London&apos;s premier event atelier, crafting extraordinary celebrations with elegance and care since 2019.
            </p>
            <div style={{ display:"flex", gap:10, marginTop:20, flexWrap:"wrap" }}>
              {socialLinks.map(s => (
                <a key={s.l} href={s.h} aria-label={s.label} style={{
                  width:38, height:38, border:"1px solid rgba(252,205,151,.15)", display:"flex",
                  alignItems:"center", justifyContent:"center", color:"rgba(249,244,238,.4)",
                  fontSize:".78rem", textDecoration:"none", transition:"border-color .3s,color .3s",
                }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="#FCCD97"; el.style.color="#FCCD97"; }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="rgba(252,205,151,.15)"; el.style.color="rgba(249,244,238,.4)"; }}
                >{s.l}</a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize:".67rem", fontWeight:500, letterSpacing:".2em", textTransform:"uppercase", color:"#FCCD97", marginBottom:22 }}>Quick Links</h4>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:11, padding:0, margin:0 }}>
              {quickLinks.map(([label,href])=>(
                <li key={href}>
                  <Link href={href} style={{ fontSize:".83rem", color:"rgba(249,244,238,.4)", textDecoration:"none", transition:"color .3s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#F9F4EE"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(249,244,238,.4)"}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize:".67rem", fontWeight:500, letterSpacing:".2em", textTransform:"uppercase", color:"#FCCD97", marginBottom:22 }}>Services</h4>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:11, padding:0, margin:0 }}>
              {services.map(s=>(
                <li key={s}>
                  <Link href="/categories" style={{ fontSize:".83rem", color:"rgba(249,244,238,.4)", textDecoration:"none", transition:"color .3s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#F9F4EE"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(249,244,238,.4)"}
                  >{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize:".67rem", fontWeight:500, letterSpacing:".2em", textTransform:"uppercase", color:"#FCCD97", marginBottom:22 }}>Contact Us</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {contactItems.map(item => (
                <div key={item.text} style={{ display:"flex", gap:11, alignItems:"flex-start" }}>
                  <span style={{ color:"#FCCD97", fontSize:".85rem", marginTop:1, flexShrink:0 }}>{item.icon}</span>
                  {item.href
                    ? <a href={item.href} style={{ fontSize:".83rem", color:"rgba(249,244,238,.4)", textDecoration:"none", lineHeight:1.6, transition:"color .3s", wordBreak:"break-word" }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#F9F4EE"}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(249,244,238,.4)"}
                      >{item.text}</a>
                    : <span style={{ fontSize:".83rem", color:"rgba(249,244,238,.4)", lineHeight:1.6 }}>{item.text}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left" style={{
          borderTop:"1px solid rgba(252,205,151,.06)",
          paddingTop:28, marginTop: "clamp(36px, 5vw, 52px)",
          display:"flex", alignItems:"center",
          flexWrap:"wrap", gap:14
        }}>
          <span style={{ fontSize:".76rem", color:"rgba(249,244,238,.3)" }}>© {year} Regal Event London. All rights reserved.</span>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {[["Track Booking","/track"],["Book an Event","/book"],["Admin","/admin/login"]].map(([l,h])=>(
              <Link key={h} href={h} style={{ fontSize:".73rem", color:"rgba(249,244,238,.3)", textDecoration:"none", transition:"color .3s" }}
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
          gap: 36px;
        }
        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px 48px;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr 1.4fr;
            gap: 56px;
          }
        }
      `}</style>
    </footer>
  );
}
