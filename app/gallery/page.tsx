"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type GalleryItem = { id:number; title:string; category:string; image_path:string };
type Category = { name:string };

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryItem|null>(null);

  useEffect(() => {
    fetch("/api/categories").then(r=>r.json()).then(setCategories).catch(()=>{});
    fetch("/api/gallery").then(r=>r.json()).then(setImages).catch(()=>{});
  }, []);

  const filtered = active==="all" ? images : images.filter(img=>img.category===active);

  useEffect(() => {
    const obs = new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("visible"); }), { threshold:0.08 });
    document.querySelectorAll(".reveal,.gal-item").forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  }, [filtered]);

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">Our Portfolio</div>
          <h1 className="page-hero-title"><span className="gold-shimmer">Our Gallery</span></h1>
          <p className="page-hero-sub">A glimpse into the beautiful events we&apos;ve created across London</p>
        </div>
      </div>

      <section className="section-tight" style={{ background:"#011F23" }}>
        <div className="container-x" style={{ maxWidth: 1200, marginInline:"auto" }}>
          {/* Filter tabs */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"clamp(28px,5vw,52px)", justifyContent:"center" }}>
            {["all",...categories.map(c=>c.name)].map(cat=>(
              <button key={cat} onClick={()=>setActive(cat)} style={{
                padding:"10px 20px", border:"1px solid",
                borderColor: active===cat ? "#FCCD97" : "rgba(252,205,151,.2)",
                background: active===cat ? "rgba(252,205,151,.1)" : "transparent",
                color: active===cat ? "#FCCD97" : "rgba(249,244,238,.5)",
                fontSize:".68rem", letterSpacing:".16em", textTransform:"uppercase", cursor:"pointer",
                transition:"all .3s", fontFamily:"var(--font-jost),sans-serif",
                minHeight: 40,
              }}>
                {cat==="all" ? "All Events" : cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <div style={{ fontSize:"clamp(2.4rem,5vw,4rem)", marginBottom:20, opacity:.2, color:"#FCCD97" }}>◈</div>
              <h3 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.6rem,3vw,2rem)", color:"#F9F4EE", marginBottom:10 }}>No Images Yet</h3>
              <p style={{ color:"rgba(249,244,238,.4)" }}>Gallery images will appear here once uploaded.</p>
            </div>
          ) : (
            <div className="gallery-cols">
              {filtered.map((img,i)=>(
                <div key={img.id} className="gal-item" style={{ transitionDelay:`${(i%9)*.065}s` }} onClick={()=>setLightbox(img)}>
                  <Image src={img.image_path} alt={img.title||""} width={500} height={400} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ width:"100%", height:"auto" }} />
                  <div className="gal-veil"><div className="gal-plus">+</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox on" onClick={()=>setLightbox(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ textAlign:"center" }}>
            <Image src={lightbox.image_path} alt={lightbox.title||""} width={1000} height={700} style={{ maxWidth:"86vw", maxHeight:"82vh", objectFit:"contain", border:"1px solid rgba(252,205,151,.1)" }} />
            {lightbox.title && <p style={{ color:"rgba(249,244,238,.45)", fontSize:".83rem", marginTop:12 }}>{lightbox.title}</p>}
          </div>
          <div className="lb-close" onClick={()=>setLightbox(null)}>✕</div>
        </div>
      )}
    </>
  );
}
