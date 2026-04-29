"use client";
import { useEffect, useState } from "react";

type Video = { id:number; title:string; youtube_url:string; description:string };

function getYTId(url:string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([^&?/\s]{11})/);
  return m ? m[1] : "";
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<Video|null>(null);

  useEffect(() => {
    fetch("/api/videos").then(r=>r.json()).then(setVideos).catch(()=>{});
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("visible"); }), { threshold:0.1 });
    document.querySelectorAll(".reveal,.vid-card").forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  }, [videos]);

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">Event Highlights</div>
          <h1 className="page-hero-title"><span className="gold-shimmer">Our Videos</span></h1>
          <p className="page-hero-sub">Watch our event highlights and behind-the-scenes moments</p>
        </div>
      </div>

      <section className="section" style={{ background:"#011F23" }}>
        <div className="container-x" style={{ maxWidth: 1200, marginInline:"auto" }}>
          {videos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <div style={{ fontSize:"clamp(2.4rem,5vw,4rem)", marginBottom:20, opacity:.2, color:"#FCCD97" }}>▶</div>
              <h3 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.6rem,3vw,2rem)", color:"#F9F4EE", marginBottom:10 }}>No Videos Yet</h3>
              <p style={{ color:"rgba(249,244,238,.4)" }}>Videos will appear here once added by the team.</p>
            </div>
          ) : (
            <div className="grid-1-2-3">
              {videos.map((video,i)=>{
                const ytId = getYTId(video.youtube_url);
                const thumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
                return (
                  <div key={video.id} className="vid-card reveal" style={{ transitionDelay:`${i*.08}s`, cursor:"pointer" }} onClick={()=>setActive(video)}>
                    <div style={{ position:"relative", aspectRatio:"16/9", overflow:"hidden", background:"#011F23" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt={video.title} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .6s ease" }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="scale(1.06)"}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="scale(1)"}
                      />
                      <div className="play-btn">
                        <div className="play-circle">▶</div>
                      </div>
                    </div>
                    <div style={{ padding:"20px clamp(18px,3vw,24px)" }}>
                      <h3 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.15rem,2vw,1.35rem)", fontWeight:400, color:"#F9F4EE", marginBottom:8 }}>{video.title}</h3>
                      {video.description && <p style={{ fontSize:".83rem", color:"rgba(249,244,238,.4)", lineHeight:1.6 }} className="line-clamp-2">{video.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Video modal */}
      {active && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(1,31,35,.97)", padding:"clamp(16px,3vw,24px)" }} onClick={()=>setActive(null)}>
          <div style={{ position:"relative", width:"100%", maxWidth:900 }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setActive(null)} aria-label="Close" style={{ position:"absolute", top:16, right:16, zIndex:1, background:"rgba(1,31,35,.5)", border:"1px solid rgba(252,205,151,.3)", borderRadius:"50%", width:42, height:42, color:"#F9F4EE", fontSize:"1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            <div style={{ aspectRatio:"16/9", borderRadius:2, overflow:"hidden" }}>
              <iframe src={`https://www.youtube.com/embed/${getYTId(active.youtube_url)}?autoplay=1`} title={active.title} style={{ width:"100%", height:"100%", border:0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
            <p style={{ color:"rgba(249,244,238,.45)", fontSize:".83rem", textAlign:"center", marginTop:12 }}>{active.title}</p>
          </div>
        </div>
      )}
    </>
  );
}
