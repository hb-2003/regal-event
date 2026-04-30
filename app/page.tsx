"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import Magnetic from "@/components/Magnetic";
import TextReveal from "@/components/TextReveal";
import HeroWebGL from "@/components/HeroWebGL";
import Manifesto from "@/components/Manifesto";
import Showreel from "@/components/Showreel";

type Category = { id: number; name: string; slug: string; description: string; image: string | null };
type GalleryItem = { id: number; image_path: string; title: string };

const testimonials = [
  { name: "Lady Charlotte Ashworth", location: "Mayfair, London", text: "Regal Event transformed our vision into something that transcended our grandest expectations. Every detail was absolute perfection.", rating: 5, event: "Summer Wedding Gala, 2024", detail: "200 guests. Florals by Philippa Craddock, catering by Raymond Blanc. A seamless 14-hour experience." },
  { name: "James Whitmore", location: "CEO, Whitmore Capital", text: "Our annual gala has never been more spectacular. Regal Event's attention to the finest nuances is simply unmatched.", rating: 5, event: "Annual Investment Gala, 2024", detail: "500 executives at The Gherkin. Full AV, live jazz quartet, three-course Michelin menu. Flawless." },
  { name: "Priya & Oliver Shah", location: "Kensington, London", text: "From first consultation to the final champagne toast, Regal made us feel as though we were their only clients in the world.", rating: 5, event: "Engagement Soirée, 2024", detail: "Intimate dinner for 40 at a private Notting Hill townhouse. String quartet, gold-leaf personalised menus." },
];

const steps = [
  { num: "01", title: "The Vision Consultation", side: "right", desc: "An intimate conversation to understand your aspirations, aesthetic sensibilities, and the story you wish to tell." },
  { num: "02", title: "Bespoke Concept Design", side: "left", desc: "Our creative team develops a tailored concept — venue, florals, lighting, entertainment — every element considered." },
  { num: "03", title: "Seamless Coordination", side: "right", desc: "We manage every detail and supplier relationship with precision, ensuring flawless execution behind the scenes." },
  { num: "04", title: "The Extraordinary Moment", side: "left", desc: "Your event unfolds with effortless grace as you simply savour every extraordinary moment we have curated for you." },
];

const placeholderCats = [
  { id:0, name:"Luxury Weddings", slug:"weddings", description:"Timeless ceremonies crafted with meticulous precision.", image:null },
  { id:1, name:"Corporate Galas", slug:"corporate", description:"Sophisticated events that elevate your brand.", image:null },
  { id:2, name:"Private Dining", slug:"dining", description:"Exclusive dining in London's most distinguished venues.", image:null },
  { id:3, name:"Product Launches", slug:"launches", description:"Brand experiences that captivate and inspire.", image:null },
  { id:4, name:"Award Ceremonies", slug:"awards", description:"Prestigious celebrations of achievement.", image:null },
  { id:5, name:"Intimate Celebrations", slug:"celebrations", description:"Bespoke milestones curated with warmth.", image:null },
];

const mosaicImgs = [
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const ctaBgRef = useRef<HTMLDivElement>(null);
  const tlProgRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsStarted = useRef(false);

  useEffect(() => {
    fetch("/api/categories").then(r=>r.json()).then(d=>setCategories(d.slice(0,6))).catch(()=>{});
    fetch("/api/gallery").then(r=>r.json()).then(d=>setGallery(d.slice(0,9))).catch(()=>{});
  }, []);

  // Mosaic mousemove — optimized with GSAP for Awwwards-level smoothness
  useEffect(() => {
    const hero = heroRef.current, mosaic = mosaicRef.current;
    if (!hero || !mosaic) return;
    if (window.matchMedia("(hover: none), (max-width: 1023px)").matches) return;

    let ctx = gsap.context(() => {
      const rotYTo = gsap.quickTo(mosaic, "rotationY", { duration: 0.8, ease: "power3.out" });
      const rotXTo = gsap.quickTo(mosaic, "rotationX", { duration: 0.8, ease: "power3.out" });

      const onMove = (e: MouseEvent) => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width/2) / r.width;
        const dy = (e.clientY - r.top - r.height/2) / r.height;
        rotYTo(dx * 15);
        rotXTo(-dy * 15);
      };

      const onLeave = () => {
        rotYTo(0);
        rotXTo(0);
      };

      hero.addEventListener("mousemove", onMove);
      hero.addEventListener("mouseleave", onLeave);

      return () => {
        hero.removeEventListener("mousemove", onMove);
        hero.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => ctx.revert();
  }, []);

  // GSAP + ScrollTrigger
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    Promise.all([
      import("gsap").then(m => m.gsap),
      import("gsap/ScrollTrigger").then(m => m.ScrollTrigger),
    ]).then(([gsap, ScrollTrigger]) => {
      gsap.registerPlugin(ScrollTrigger);

      if (heroBgRef.current)
        gsap.to(heroBgRef.current, { yPercent:14, ease:"none", scrollTrigger: { trigger:"#hero", start:"top top", end:"bottom top", scrub:true } });
      if (ctaBgRef.current)
        gsap.to(ctaBgRef.current, { yPercent:20, ease:"none", scrollTrigger: { trigger:"#cta-section", start:"top bottom", end:"bottom top", scrub:true } });
      if (tlProgRef.current)
        gsap.to(tlProgRef.current, { height:"100%", ease:"none", scrollTrigger: { trigger:"#timeline", start:"top 65%", end:"bottom 65%", scrub:true } });

      // Gallery Image Parallax
      gsap.utils.toArray<HTMLElement>(".gal-item img").forEach((img) => {
        gsap.fromTo(img,
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          }
        );
      });

      ctx = gsap.context(() => {});
    });

    return () => { ctx?.revert(); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(el => { if (el.isIntersecting) el.target.classList.add("visible"); });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal, .tl-row, .gal-item").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [categories, gallery]);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsStarted.current) {
        statsStarted.current = true;
        document.querySelectorAll<HTMLElement>(".stat-num-el").forEach(el => {
          const to = parseInt(el.dataset.to || "0");
          const sfx = el.dataset.sfx || "";
          let cur = 0;
          const step = to / (1600 / 16);
          const t = setInterval(() => {
            cur = Math.min(cur + step, to);
            el.textContent = Math.round(cur) + sfx;
            if (cur >= to) clearInterval(t);
          }, 16);
        });
      }
    }, { threshold: 0.4 });
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Category 3D tilt — disabled on touch devices
  const handleCatMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(hover: none)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width/2) / r.width;
    const dy = (e.clientY - r.top - r.height/2) / r.height;
    (e.currentTarget as HTMLElement).style.transform = `perspective(760px) rotateX(${-dy*9}deg) rotateY(${dx*9}deg) scale(1.018)`;
    (e.currentTarget as HTMLElement).style.transition = "transform .06s ease";
  };
  const handleCatLeave = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.transform = "perspective(760px) rotateX(0) rotateY(0) scale(1)";
    (e.currentTarget as HTMLElement).style.transition = "transform .5s ease";
  };

  const displayCats = categories.length > 0 ? categories : placeholderCats;

  const catBgs = [
    "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&q=80",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=800&q=80",
  ];
  const catIcons = ["♢","◈","◇","✦","⬡","◉"];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        id="hero"
        ref={heroRef}
        className="hero-section"
      >
        <div ref={heroBgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scale(1.15)' }}>
          <HeroWebGL />
        </div>

        <div className="hero-grid container-x">
          {/* Main content */}
          <div className="hero-content" style={{ paddingTop: '10vh' }}>
            <div className="hero-eyebrow">
              <span />
              London&apos;s Premier Event Atelier
            </div>

            <h1 className="hero-title">
              <TextReveal delay={0.6}>
                We Craft <span className="gold-shimmer">Extraordinary</span> Moments
              </TextReveal>
            </h1>

            <p className="hero-sub" style={{ fontSize: '1.1rem', maxWidth: '540px' }}>
              From intimate private dinners to grand galas, Regal Event orchestrates moments of unparalleled distinction across London and beyond.
            </p>

            <div className="hero-actions">
              <Magnetic>
                <Link href="/book" className="btn-gold">
                  <span>Begin Your Journey</span>
                </Link>
              </Magnetic>
              <Magnetic intensity={0.3}>
                <Link href="/gallery" className="hero-link">
                  <span className="hero-link-icon">▶</span>
                  View Portfolio
                </Link>
              </Magnetic>
            </div>
          </div>

          {/* 5-Image Mosaic */}
          <div className="hero-mosaic-wrap">
            <div ref={mosaicRef} className="hero-mosaic">
              {mosaicImgs.map((src, i) => (
                <div key={i} className={`mosaic-pic mosaic-p${i+1}`}>
                  <Image src={src} alt="Regal Event Portfolio" fill style={{ objectFit: "cover" }} sizes="(max-width: 1024px) 0vw, 33vw" priority={i < 2} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint — hidden on mobile */}
        <div className="hero-scroll-hint">
          <div style={{ width:1, height:52, background:"linear-gradient(#FCCD97,transparent)", animation:"particleFloat 2.2s ease-in-out infinite" }} />
          <span style={{ fontSize:".6rem", letterSpacing:".22em", textTransform:"uppercase", color:"rgba(249,244,238,.38)", writingMode:"vertical-rl", transform:"rotate(180deg)" }}>Scroll</span>
        </div>
      </section>

      <Manifesto />

      {/* ── STATS ────────────────────────────────────────────── */}
      <section style={{ paddingBlock: "clamp(48px, 8vw, 76px)", background:"#022C32", borderTop:"1px solid rgba(252,205,151,.06)", borderBottom:"1px solid rgba(252,205,151,.06)" }}>
        <div ref={statsRef} className="container-x grid-1-4" style={{ maxWidth: 1080, marginInline:"auto" }}>
          {[
            { to:500, sfx:"+", label:"Events Curated" },
            { to:5, sfx:"+", label:"Years of Excellence" },
            { to:98, sfx:"%", label:"Client Satisfaction" },
            { to:24, sfx:"/7", label:"Dedicated Support" },
          ].map((s, i) => (
            <div key={i} className="stat-item reveal" style={{ transitionDelay:`${i*.1}s` }}>
              <span className="stat-num-el" data-to={s.to} data-sfx={s.sfx}
                style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(2.4rem, 5vw, 4.5rem)", fontWeight:300, lineHeight:1, color:"#FCCD97", display:"block" }}>
                0{s.sfx}
              </span>
              <span style={{ fontSize:".67rem", fontWeight:400, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(249,244,238,.38)", marginTop:10, display:"block" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────── */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="marquee-item">
              <span className="marquee-dot">✦</span> Bespoke <span className="marquee-dot">✦</span> Unforgettable <span className="marquee-dot">✦</span> London&apos;s Finest <span className="marquee-dot">✦</span> Extraordinary
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="section" style={{ background:"#011F23" }}>
        <div className="container-x" style={{ maxWidth: 1200, marginInline:"auto" }}>
          <div style={{ maxWidth:520, marginBottom:"clamp(36px,6vw,60px)" }}>
            <div className="s-label reveal">Our Expertise</div>
            <TextReveal as="h2" className="lux-title" delay={0.1}>Crafted for Every <em>Occasion</em></TextReveal>
          </div>
          <div className="grid-1-2-3">
            {displayCats.map((cat, i) => (
              <Link key={cat.id} href={`/book?category=${cat.slug}`}
                className="cat-card reveal"
                style={{ aspectRatio:"4/5", display:"block", textDecoration:"none", transitionDelay:`${i*.08}s` }}
                onMouseMove={handleCatMove} onMouseLeave={handleCatLeave}
              >
                {cat.image
                  ? <div className="cat-bg"><Image src={cat.image} alt={cat.name} fill style={{ objectFit:"cover" }} /></div>
                  : <div className="cat-bg" style={{ backgroundImage:`url('${catBgs[i % catBgs.length]}')` }} />
                }
                <div className="cat-darken" />
                <div className="cat-body">
                  <span style={{ fontSize:"1.2rem", color:"#FCCD97", display:"block", marginBottom:10 }}>{catIcons[i % catIcons.length]}</span>
                  <div style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.3rem,2.4vw,1.7rem)", fontWeight:400, color:"#F9F4EE", marginBottom:8 }}>{cat.name}</div>
                  <div className="cat-desc">{cat.description || "Bespoke experiences crafted with precision and elegance."}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWREEL ─────────────────────────────────────────── */}
      <Showreel />

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="section" style={{ background:"#011F23", padding: "clamp(80px, 12vw, 140px) 0" }}>
        <div className="container-x" style={{ maxWidth: 1200, marginInline:"auto" }}>
          <div className="process-grid">

            {/* Sticky Left Column */}
            <div className="process-sticky">
              <div className="s-label reveal">The Regal Process</div>
              <TextReveal as="h2" className="lux-title" delay={0.1} style={{ marginBottom: 24 }}>From Vision to<br/><em>Reality</em></TextReveal>
              <p className="reveal" style={{ fontSize: "1.05rem", color: "rgba(249,244,238,.55)", lineHeight: 1.8, maxWidth: 380, transitionDelay: ".2s" }}>
                A meticulous four-step journey designed to ensure your event unfolds with effortless grace.
              </p>
            </div>

            {/* Scrolling Right Column */}
            <div id="process-list" style={{ display: "flex", flexDirection: "column", gap: "clamp(60px, 10vw, 100px)", marginTop: "clamp(40px, 0vw, 0px)" }}>
              {steps.map((s, i) => (
                <div key={i} className="process-step reveal" style={{ position: "relative", transitionDelay: `${i*0.1}s` }}>
                  <span style={{
                    fontFamily: "var(--font-cormorant),serif",
                    fontSize: "clamp(4rem, 8vw, 6rem)",
                    fontWeight: 300,
                    color: "rgba(252,205,151,0.15)",
                    lineHeight: 0.8,
                    display: "block",
                    marginBottom: 24,
                    transform: "translateX(-4px)"
                  }}>
                    {s.num}
                  </span>
                  <div style={{ borderTop: "1px solid rgba(252,205,151,0.2)", paddingTop: 32 }}>
                    <h3 style={{
                      fontFamily: "var(--font-cormorant),serif",
                      fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                      fontWeight: 400,
                      color: "#F9F4EE",
                      marginBottom: 16
                    }}>
                      {s.title}
                    </h3>
                    <p style={{ fontSize: "1.05rem", color: "rgba(249,244,238,.55)", lineHeight: 1.8, maxWidth: 480 }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────── */}
      {gallery.length > 0 && (
        <section className="section" style={{ background:"#011F23" }}>
          <div className="container-x" style={{ maxWidth: 1200, marginInline:"auto" }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"clamp(28px,5vw,52px)", flexWrap:"wrap", gap:16 }}>
              <div>
                <div className="s-label">Portfolio</div>
                <TextReveal as="h2" className="lux-title">A Glimpse of <em>Distinction</em></TextReveal>
              </div>
              <Link href="/gallery" style={{ fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(249,244,238,.55)", textDecoration:"none", transition:"color .3s" }}
                onMouseEnter={(e)=>(e.currentTarget as HTMLElement).style.color="#FCCD97"}
                onMouseLeave={(e)=>(e.currentTarget as HTMLElement).style.color="rgba(249,244,238,.55)"}
              >View All →</Link>
            </div>
            <div className="gallery-cols">
              {gallery.map((img, i) => (
                <div key={img.id} className="gal-item" style={{ transitionDelay:`${i*.065}s` }} onClick={() => setLightbox(img.image_path)}>
                  <Image src={img.image_path} alt={img.title || ""} width={500} height={400} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ width:"100%", height:"auto", objectFit:"cover" }} />
                  <div className="gal-veil"><div className="gal-plus">+</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="section" style={{ background:"#022C32" }}>
        <div className="container-x" style={{ maxWidth: 1200, marginInline:"auto" }}>
          <div style={{ textAlign:"center", marginBottom:"clamp(60px,10vw,100px)" }}>
            <div className="s-label s-label-center reveal">Client Stories</div>
            <TextReveal as="h2" className="lux-title" delay={0.1}>Words of <em>Distinction</em></TextReveal>
          </div>
          <div className="grid-1-2-3" style={{ gap: "clamp(40px, 6vw, 80px)" }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="reveal"
                style={{ transitionDelay:`${i*.15}s`, display: "flex", flexDirection: "column" }}
              >
                <div style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(3.5rem, 6vw, 5rem)", color:"#FCCD97", opacity: 0.2, lineHeight:0.5, marginBottom: 24 }}>&ldquo;</div>
                <p style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.1rem,1.8vw,1.3rem)", fontWeight:300, fontStyle:"italic", color:"#F9F4EE", lineHeight:1.7, flex:1, paddingLeft: 12, borderLeft: "1px solid rgba(252,205,151,0.15)" }}>
                  {t.text}
                </p>
                <div style={{ paddingLeft: 12, marginTop: 32 }}>
                  <span style={{ fontSize:".9rem", fontWeight:500, letterSpacing: ".1em", color:"#F9F4EE", display:"block", marginBottom: 6, textTransform: "uppercase" }}>{t.name}</span>
                  <span style={{ fontSize:".75rem", color:"rgba(249,244,238,.4)", display:"block", letterSpacing: ".05em" }}>{t.event} &nbsp;·&nbsp; {t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARALLAX CTA ─────────────────────────────────────── */}
      <section id="cta-section" style={{ position:"relative", minHeight: "clamp(420px, 60vw, 490px)", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div ref={ctaBgRef} style={{
          position:"absolute", inset:"-22%",
          backgroundImage:"url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')",
          backgroundSize:"cover", backgroundPosition:"center",
        }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,rgba(1,31,35,.92) 0%,rgba(1,89,97,.76) 100%)" }} />
        <div className="reveal container-x" style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:680 }}>
          <span style={{ fontSize:".68rem", fontWeight:500, letterSpacing:".26em", textTransform:"uppercase", color:"#FCCD97", display:"block", marginBottom:14 }}>Begin Today</span>
          <div className="orn" style={{ justifyContent:"center", margin:"0 auto 20px" }}>
            <div className="orn-line rev" /><div className="orn-diamond" /><div className="orn-line" />
          </div>
          <TextReveal as="h2" style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"var(--text-4xl)", fontWeight:300, lineHeight:1.1, color:"#F9F4EE", marginBottom:20 }}>
            Your Extraordinary <span className="gold-shimmer">Moment</span> Awaits
          </TextReveal>
          <p style={{ fontSize:".93rem", color:"rgba(249,244,238,.65)", lineHeight:1.76, marginBottom:36, maxWidth: 540, marginInline:"auto" }}>
            Let us craft an experience that reflects the remarkable occasion you deserve.
          </p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
            <Magnetic>
              <Link href="/book" className="btn-gold"><span>Schedule a Consultation</span></Link>
            </Magnetic>
            <Magnetic>
              <Link href="/contact" className="btn-outline">Get in Touch</Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox on" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()} />
          <div className="lb-close" onClick={() => setLightbox(null)}>✕</div>
        </div>
      )}

      <style jsx>{`
        .hero-section {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-top: clamp(96px, 14vw, 130px);
          padding-bottom: clamp(40px, 8vw, 72px);
        }

        .hero-grid {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(24px, 4vw, 48px);
          align-items: center;
          width: 100%;
          max-width: 1400px;
          margin-inline: auto;
        }
        .hero-content { max-width: 640px; }

        .hero-eyebrow {
          display: flex; align-items: center; gap: 14px;
          font-size: .68rem; font-weight: 500; letter-spacing: .26em;
          text-transform: uppercase; color: #FCCD97; margin-bottom: 24px;
          animation: fadeUp .7s ease .15s both;
        }
        .hero-eyebrow span {
          display: block; width: 30px; height: 1px; background: #FCCD97; flex-shrink: 0;
        }
        .hero-title {
          font-family: var(--font-cormorant), serif;
          font-size: var(--text-6xl);
          font-weight: 300; line-height: 1.05; letter-spacing: -.01em;
          color: #F9F4EE; margin-bottom: 24px;
        }
        .hero-sub {
          font-size: var(--text-base); line-height: 1.82;
          color: rgba(249,244,238,.65); max-width: 460px; margin-bottom: 36px;
          animation: fadeUp .8s ease .85s both;
        }
        .hero-actions {
          display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
          animation: fadeUp .8s ease 1s both;
        }
        .hero-link {
          display: flex; align-items: center; gap: 10px;
          font-size: .72rem; letter-spacing: .14em; text-transform: uppercase;
          color: rgba(249,244,238,.6); text-decoration: none;
          transition: color .3s;
        }
        .hero-link:hover { color: #FCCD97; }
        .hero-link-icon {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid rgba(252,205,151,.28);
          display: flex; align-items: center; justify-content: center;
          font-size: .8rem;
        }

        .hero-mosaic-wrap { display: none; }
        .hero-scroll-hint { display: none; }

        .mosaic-pic {
          position: absolute;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          transition: transform 0.4s ease;
        }
        .mosaic-pic img { transition: transform 0.6s ease; }
        .mosaic-pic:hover img { transform: scale(1.08); }

        .mosaic-p1 { width: 48%; height: 52%; top: 0; left: 8%; z-index: 2; transform: translateZ(20px); }
        .mosaic-p2 { width: 44%; height: 48%; top: 12%; right: 0; z-index: 1; transform: translateZ(-10px); }
        .mosaic-p3 { width: 52%; height: 56%; bottom: 8%; left: 0; z-index: 3; transform: translateZ(40px); }
        .mosaic-p4 { width: 42%; height: 46%; bottom: 0; right: 8%; z-index: 2; transform: translateZ(15px); }
        .mosaic-p5 { width: 38%; height: 42%; top: 38%; left: 32%; z-index: 4; transform: translateZ(60px); }

        .process-grid {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .process-sticky {
          position: relative;
          z-index: 10;
        }

        @media (min-width: 1024px) {
          .process-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: start;
          }
          .process-sticky {
            position: sticky;
            top: 140px;
            height: fit-content;
          }
          .hero-grid {
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
            gap: 56px;
          }
          .hero-mosaic-wrap {
            display: block;
            position: relative;
            perspective: 1100px;
            justify-self: end;
            width: 100%;
            max-width: 540px;
          }
          .hero-mosaic {
            position: relative;
            width: 100%;
            aspect-ratio: 5 / 6;
            transform-style: preserve-3d;
          }
          .hero-scroll-hint {
            position: absolute; bottom: 32px; left: var(--gutter);
            z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 10px;
            animation: fadeUp .6s ease 1.2s both;
          }
        }

        @media (max-width: 767px) {
          .testimonial-hint { display: none; }
        }

        @media (max-width: 480px) {
          .hero-section {
            min-height: auto;
            padding-top: 80px;
            padding-bottom: 32px;
          }
          .hero-title { font-size: clamp(2.1rem, 9vw, 2.8rem); }
          .hero-eyebrow {
            letter-spacing: .14em;
            font-size: .62rem;
            gap: 10px;
          }
          .hero-sub { margin-bottom: 24px; }
          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}
