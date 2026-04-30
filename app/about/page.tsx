"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/TextReveal";
import Magnetic from "@/components/Magnetic";

const whyUs = [
  { icon:"♢", title:"Bespoke Designs", desc:"Every event uniquely crafted to reflect your personality, culture, and vision." },
  { icon:"◈", title:"London-Based Team", desc:"Local experts who know the city and deliver seamlessly across all of London." },
  { icon:"✦", title:"500+ Events", desc:"A proven track record of delivering extraordinary events since 2019." },
  { icon:"◇", title:"Full Planning Support", desc:"We handle every detail from concept to completion — completely stress-free." },
  { icon:"⬡", title:"Competitive Pricing", desc:"Premium quality event planning at prices that respect your budget." },
  { icon:"◉", title:"5★ Reviews", desc:"Consistently rated 5 stars by our delighted clients across London." },
];
const values = [
  { icon:"♢", title:"Excellence", desc:"We hold ourselves to the highest standards in every detail, from the grandest centrepiece to the smallest finishing touch." },
  { icon:"◈", title:"Creativity", desc:"Our team brings fresh, imaginative ideas to every event, ensuring your celebration is truly one-of-a-kind." },
  { icon:"✦", title:"Care", desc:"We genuinely care about making your event perfect. Your happiness is our greatest achievement." },
];

export default function AboutPage() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }), { threshold:0.15 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

    gsap.registerPlugin(ScrollTrigger);

    // Subtle parallax and rotation for the badge on scroll
    if (badgeRef.current && ringRef.current) {
      gsap.to(badgeRef.current, {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: badgeRef.current.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      // Continuous slow rotation for the outer decorative ring
      gsap.to(ringRef.current, {
        rotation: 360,
        duration: 25,
        repeat: -1,
        ease: "none"
      });
    }

    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Page Hero */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">Who We Are</div>
          <TextReveal as="h1" className="page-hero-title"><span className="gold-shimmer">About Regal Event</span></TextReveal>
          <p className="page-hero-sub fade-up" style={{ animationDelay: "0.5s", opacity: 0 }}>London&apos;s trusted event decoration and planning specialists</p>
        </div>
      </div>

      {/* Story */}
      <section className="section" style={{ background:"#011F23" }}>
        <div className="container-x grid-1-2" style={{ maxWidth: 1100, marginInline:"auto", alignItems:"center" }}>
          <div>
            <div className="s-label reveal">Our Story</div>
            <TextReveal as="h2" className="lux-title" delay={0.1} style={{ marginBottom:24 }}>Creating Magic<br/>Across <em>London</em></TextReveal>
            <p className="reveal" style={{ color:"rgba(249,244,238,.55)", lineHeight:1.82, marginBottom:16, transitionDelay:".15s" }}>
              Regal Event London was founded with a single mission: to create extraordinary celebrations that leave lasting memories. Based in the heart of London, we have been transforming events across the city since 2019.
            </p>
            <p className="reveal" style={{ color:"rgba(249,244,238,.55)", lineHeight:1.82, marginBottom:32, transitionDelay:".2s" }}>
              From intimate family gatherings to large-scale corporate galas, we bring the same level of passion, precision, and elegance to every project — turning your vision into an unforgettable reality.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16, marginTop:8 }}>
              {[
                { label:"Our Mission", text:"To deliver bespoke, stunning event experiences that exceed expectations and create cherished memories." },
                { label:"Our Vision", text:"To become London's most celebrated event atelier, known for excellence, creativity, and unmatched client care." },
              ].map(item => (
                <div key={item.label} className="reveal lux-card" style={{ padding:20, borderLeft:"2px solid #FCCD97", transitionDelay:".25s" }}>
                  <p style={{ fontSize:".67rem", fontWeight:500, letterSpacing:".18em", textTransform:"uppercase", color:"#FCCD97", marginBottom:8 }}>{item.label}</p>
                  <p style={{ fontSize:".83rem", lineHeight:1.7, color:"rgba(249,244,238,.5)" }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Logo showcase */}
          <div className="reveal" style={{ display:"flex", justifyContent:"center", transitionDelay:".2s" }}>
            <div ref={badgeRef} style={{ position:"relative", width:"clamp(260px, 42vw, 400px)", aspectRatio:"1/1", display:"flex", alignItems:"center", justifyContent:"center" }}>

              {/* Unique Rotating SVG Text Ring */}
              <div ref={ringRef} style={{ position: "absolute", inset: -20, zIndex: 1 }}>
                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  <path id="textPath" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" fill="none" />
                  <text fill="#FCCD97" fontSize="11" fontWeight="500" letterSpacing="0.25em" style={{ textTransform: "uppercase", fontFamily: "var(--font-jost), sans-serif" }}>
                    <textPath href="#textPath" startOffset="0%">
                      London's Premier Event Atelier • Excellence in Every Detail •
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* The Logo Container */}
              <div style={{
                width:"82%", height:"82%", borderRadius:"50%", overflow:"hidden",
                boxShadow:"0 0 0 1px rgba(252,205,151,0.3), 0 20px 60px rgba(0,0,0,0.5)",
                background:"#F9F4EE",
                position: "relative",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Image src="/Final Logo.png" alt="Regal Event" width={320} height={320}
                  style={{ objectFit:"contain", width:"100%", height:"100%", transform:"scale(1.15)", mixBlendMode:"multiply" }} />
              </div>

              {/* Magnetic 500+ Badge */}
              <Magnetic intensity={0.6}>
                <div style={{
                  position:"absolute", bottom:"0%", right:"0%", width:"32%", aspectRatio:"1/1",
                  borderRadius:"50%", background:"#022C32", border:"1px solid rgba(252,205,151,.6)",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  textAlign:"center", zIndex: 10,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  cursor: "pointer"
                }}>
                  <span style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.1rem, 3.5vw, 1.6rem)", fontWeight:600, color:"#FCCD97", lineHeight:1 }}>500+</span>
                  <span style={{ fontSize:".55rem", letterSpacing:".12em", color:"rgba(249,244,238,.6)", marginTop:4 }}>EVENTS</span>
                </div>
              </Magnetic>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section" style={{ background:"#022C32" }}>
        <div className="container-x" style={{ maxWidth: 1200, marginInline:"auto" }}>
          <div style={{ textAlign:"center", marginBottom:"clamp(36px,6vw,60px)" }}>
            <div className="s-label s-label-center reveal">The Regal Difference</div>
            <TextReveal as="h2" className="lux-title" delay={0.1}>Why Choose <em>Us</em></TextReveal>
          </div>
          <div className="grid-1-2-3">
            {whyUs.map((item,i)=>(
              <div key={item.title} className="lux-card reveal" style={{ padding:"clamp(22px,3vw,32px)", transitionDelay:`${i*.08}s` }}>
                <span style={{ fontSize:"1.5rem", color:"#FCCD97", display:"block", marginBottom:16 }}>{item.icon}</span>
                <h3 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.2rem, 2vw, 1.45rem)", fontWeight:500, color:"#F9F4EE", marginBottom:10 }}>{item.title}</h3>
                <p style={{ fontSize:".85rem", lineHeight:1.7, color:"rgba(249,244,238,.45)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background:"#011F23" }}>
        <div className="container-x" style={{ maxWidth: 880, marginInline:"auto" }}>
          <div style={{ textAlign:"center", marginBottom:"clamp(36px,6vw,60px)" }}>
            <div className="s-label s-label-center reveal">What Drives Us</div>
            <TextReveal as="h2" className="lux-title" delay={0.1}>Our <em>Values</em></TextReveal>
          </div>
          <div className="grid-1-2-3">
            {values.map((v,i)=>(
              <div key={v.title} className="reveal" style={{ textAlign:"center", transitionDelay:`${i*.1}s` }}>
                <div style={{ width:72, height:72, borderRadius:"50%", border:"1px solid rgba(252,205,151,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", color:"#FCCD97", margin:"0 auto 20px" }}>{v.icon}</div>
                <h3 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.35rem, 2.2vw, 1.6rem)", fontWeight:400, color:"#F9F4EE", marginBottom:12 }}>{v.title}</h3>
                <p style={{ fontSize:".85rem", lineHeight:1.75, color:"rgba(249,244,238,.45)" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingBlock:"clamp(60px, 9vw, 90px)", textAlign:"center", background:"linear-gradient(135deg,#015961 0%,#022C32 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 50%,rgba(252,205,151,.06) 0%,transparent 60%)" }} />
        <div className="container-x" style={{ position:"relative", zIndex:10, maxWidth:560, margin:"0 auto" }}>
          <TextReveal as="h2" className="lux-title" delay={0.1} style={{ marginBottom:16 }}>Let&apos;s Create Something <em>Beautiful</em></TextReveal>
          <p className="reveal" style={{ color:"rgba(249,244,238,.55)", marginBottom:36, transitionDelay:".1s" }}>Ready to start planning your perfect event?</p>
          <div className="reveal" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", transitionDelay:".2s" }}>
            <Magnetic>
              <Link href="/book" className="btn-gold"><span>Book Your Event ✦</span></Link>
            </Magnetic>
            <Magnetic>
              <Link href="/contact" className="btn-outline">Get in Touch</Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </>
  );
}
