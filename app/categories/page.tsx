"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Category = { id:number; name:string; slug:string; description:string; image:string|null };

const CATEGORY_GRADIENTS: Record<string,string> = {
  "baby-shower":       "linear-gradient(135deg,#1a6b5c,#0d4a3e)",
  "baby-welcome":      "linear-gradient(135deg,#2d5a6b,#1a3d4a)",
  "birthday-decoration":"linear-gradient(135deg,#6b3a1f,#3d1f0d)",
  "naming-ceremony":   "linear-gradient(135deg,#4a2d6b,#2d1a4a)",
  "room-decoration":   "linear-gradient(135deg,#1a4a6b,#0d2d4a)",
  "theme-decoration":  "linear-gradient(135deg,#6b4a1a,#4a2d0d)",
  "haldi-ceremony":    "linear-gradient(135deg,#6b5a1a,#4a3d0d)",
  "bride-to-be":       "linear-gradient(135deg,#6b1a3a,#4a0d25)",
  "engagement":        "linear-gradient(135deg,#3a1a6b,#25104a)",
  "shop-inauguration": "linear-gradient(135deg,#1a5a3a,#0d3a25)",
  "corporate-event":   "linear-gradient(135deg,#1a2d6b,#0d1a4a)",
  "surprise-planning": "linear-gradient(135deg,#5a1a6b,#3a0d4a)",
  "anniversary":       "linear-gradient(135deg,#6b1a1a,#4a0d0d)",
  "national-festival": "linear-gradient(135deg,#1a6b2d,#0d4a1a)",
};

// Brand-aligned glyphs (replaces clashing emojis)
const CATEGORY_ICONS: Record<string,string> = {
  "baby-shower":        "♢",
  "baby-welcome":       "✦",
  "birthday-decoration":"◈",
  "naming-ceremony":    "✧",
  "room-decoration":    "◇",
  "theme-decoration":   "⬡",
  "haldi-ceremony":     "◉",
  "bride-to-be":        "❀",
  "engagement":         "♡",
  "shop-inauguration":  "✦",
  "corporate-event":    "◈",
  "surprise-planning":  "♢",
  "anniversary":        "❀",
  "national-festival":  "✧",
};

const placeholderCats: Category[] = [
  { id:0, name:"Luxury Weddings", slug:"weddings", description:"Timeless ceremonies crafted with meticulous precision.", image:null },
  { id:1, name:"Corporate Galas", slug:"corporate", description:"Sophisticated events that elevate your brand.", image:null },
  { id:2, name:"Private Dining", slug:"dining", description:"Exclusive dining in London's most distinguished venues.", image:null },
  { id:3, name:"Product Launches", slug:"launches", description:"Brand experiences that captivate and inspire.", image:null },
  { id:4, name:"Award Ceremonies", slug:"awards", description:"Prestigious celebrations of achievement.", image:null },
  { id:5, name:"Intimate Celebrations", slug:"celebrations", description:"Bespoke milestones curated with warmth.", image:null },
];

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then(r=>r.json())
      .then((data) => {
        setCats(data && data.length > 0 ? data : placeholderCats);
        setLoading(false);
      })
      .catch(() => {
        setCats(placeholderCats);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries=>entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold:0.1 }
    );
    document.querySelectorAll(".reveal,.cat-card").forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  }, [cats]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(hover: none)").matches) return;
    const r=e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.transform=`perspective(760px) rotateX(${-(e.clientY-r.top-r.height/2)/r.height*9}deg) rotateY(${(e.clientX-r.left-r.width/2)/r.width*9}deg) scale(1.018)`;
    e.currentTarget.style.transition="transform .06s ease";
  };
  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform="perspective(760px) rotateX(0) rotateY(0) scale(1)";
    e.currentTarget.style.transition="transform .5s ease";
  };

  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">What We Do</div>
          <h1 className="page-hero-title"><span className="gold-shimmer">Our Services</span></h1>
          <p className="page-hero-sub">Bespoke event categories, tailored to every occasion</p>
        </div>
      </div>

      {/* Grid */}
      <section className="section" style={{ background:"#011F23" }}>
        <div className="container-x" style={{ maxWidth: 1200, marginInline:"auto" }}>
          {loading ? (
            <div className="grid-1-2-3">
              {[...Array(9)].map((_,i)=>(
                <div key={i} style={{ height:"clamp(280px, 40vw, 380px)", background:"rgba(1,89,97,.08)", border:"1px solid rgba(252,205,151,.06)" }} />
              ))}
            </div>
          ) : (
            <div className="grid-1-2-3">
              {cats.map((cat)=>(
                <div key={cat.id} className="cat-card" style={{ position:"relative", overflow:"hidden", cursor:"pointer", border:"1px solid rgba(252,205,151,0)", transition:"border-color .4s" }}
                  onMouseMove={handleMove} onMouseLeave={handleLeave}
                >
                  {/* Image / Fallback */}
                  <div style={{ position:"relative", width:"100%", aspectRatio:"4/3", overflow:"hidden" }}>
                    {cat.image ? (
                      <>
                        <Image
                          src={cat.image} alt={cat.name} fill
                          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                          style={{ objectFit:"cover", transition:"transform .65s ease" }}
                          onError={(e)=>{
                            (e.currentTarget as HTMLElement).style.display="none";
                            const fallback = (e.currentTarget as HTMLElement).nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display="flex";
                          }}
                        />
                        <div style={{
                          display:"none", position:"absolute", inset:0, flexDirection:"column",
                          alignItems:"center", justifyContent:"center", gap:12,
                          background:CATEGORY_GRADIENTS[cat.slug]||"linear-gradient(135deg,#015961,#012D32)",
                        }}>
                          <span style={{ fontSize:"clamp(32px,6vw,48px)", color:"rgba(252,205,151,.85)" }}>{CATEGORY_ICONS[cat.slug]||"✦"}</span>
                          <span style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(14px,2vw,18px)", color:"rgba(252,205,151,.7)", letterSpacing:2, textAlign:"center", padding:"0 16px" }}>{cat.name}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{
                        width:"100%", height:"100%", display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center", gap:12,
                        background:CATEGORY_GRADIENTS[cat.slug]||"linear-gradient(135deg,#015961,#012D32)",
                      }}>
                        <span style={{ fontSize:"clamp(32px,6vw,48px)", color:"rgba(252,205,151,.85)" }}>{CATEGORY_ICONS[cat.slug]||"✦"}</span>
                        <span style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(14px,2vw,18px)", color:"rgba(252,205,151,.7)", letterSpacing:2, textAlign:"center", padding:"0 16px" }}>{cat.name}</span>
                      </div>
                    )}
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(1,31,35,.92) 0%,rgba(1,31,35,.3) 55%,transparent 100%)", transition:"background .4s" }} />
                  </div>

                  {/* Body */}
                  <div style={{ padding:"clamp(18px,3vw,24px) clamp(20px,3vw,28px)", background:"rgba(1,31,35,.55)" }}>
                    <div style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.4rem,2.4vw,1.75rem)", fontWeight:400, color:"#F9F4EE", marginBottom:8, lineHeight:1.15 }}>{cat.name}</div>
                    <p style={{ fontSize:".84rem", lineHeight:1.68, color:"rgba(249,244,238,.45)", marginBottom:16 }}>
                      {cat.description || "Bespoke experiences crafted with precision and elegance."}
                    </p>
                    <Link href={`/book?category=${cat.slug}`} style={{
                      display:"inline-flex", alignItems:"center", gap:6,
                      fontSize:".68rem", letterSpacing:".14em", textTransform:"uppercase",
                      color:"#FCCD97", textDecoration:"none",
                      borderBottom:"1px solid rgba(252,205,151,.35)", paddingBottom:2,
                    }}>Book This Event →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingBlock:"clamp(56px,8vw,80px)", textAlign:"center", background:"linear-gradient(135deg,#015961 0%,#022C32 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 70% 50%,rgba(252,205,151,.06) 0%,transparent 60%)" }} />
        <div className="container-x" style={{ position:"relative", zIndex:10, maxWidth:560, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"var(--text-3xl)", fontWeight:300, lineHeight:1.1, color:"#F9F4EE", marginBottom:14 }}>
            Can&apos;t Find What You&apos;re <em style={{ color:"#FCCD97" }}>Looking For?</em>
          </h2>
          <p style={{ color:"rgba(249,244,238,.55)", marginBottom:32 }}>Contact us to discuss a fully custom event package.</p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/contact" className="btn-gold"><span>Get in Touch</span></Link>
            <Link href="/book" className="btn-outline">Book an Event</Link>
          </div>
        </div>
      </section>
    </>
  );
}
