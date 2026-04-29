"use client";
import { useState, useEffect } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ full_name:"", email:"", phone:"", message:"" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

  useEffect(() => {
    const obs = new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("visible"); }), { threshold:0.1 });
    document.querySelectorAll(".reveal").forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setStatus("loading");
    try {
      const res = await fetch("/api/contacts", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (res.ok) { setStatus("success"); setForm({ full_name:"", email:"", phone:"", message:"" }); }
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">Reach Us</div>
          <h1 className="page-hero-title"><span className="gold-shimmer">Get in Touch</span></h1>
          <p className="page-hero-sub">We&apos;d love to hear about your upcoming event</p>
        </div>
      </div>

      <section className="section" style={{ background:"#011F23" }}>
        <div className="container-x grid-1-2" style={{ maxWidth: 1100, marginInline:"auto" }}>

          {/* Info */}
          <div>
            <div className="s-label reveal">Contact Information</div>
            <h2 className="lux-title reveal" style={{ transitionDelay:".1s", marginBottom:32 }}>Let&apos;s Start a <em>Conversation</em></h2>
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:36 }}>
              {[
                { icon:"◈", label:"Address", value:"London, United Kingdom" },
                { icon:"☏", label:"Phone", value:"+44 7700 000 000", href:"tel:+447700000000" },
                { icon:"✉", label:"Email", value:"info@regalevent.co.uk", href:"mailto:info@regalevent.co.uk" },
                { icon:"◷", label:"Hours", value:"Monday – Saturday · 9am – 8pm" },
              ].map(item=>(
                <div key={item.label} className="lux-card reveal" style={{ display:"flex", alignItems:"flex-start", gap:16, padding:"18px 20px", transitionDelay:".15s" }}>
                  <span style={{ color:"#FCCD97", fontSize:"1.1rem", flexShrink:0, marginTop:2 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(249,244,238,.35)", marginBottom:4 }}>{item.label}</p>
                    {item.href
                      ? <a href={item.href} style={{ color:"#F9F4EE", textDecoration:"none", fontSize:".88rem", transition:"color .3s" }}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="#FCCD97"}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="#F9F4EE"}
                        >{item.value}</a>
                      : <p style={{ color:"#F9F4EE", fontSize:".88rem" }}>{item.value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal" style={{ marginBottom:32 }}>
              <p style={{ fontSize:".68rem", letterSpacing:".2em", textTransform:"uppercase", color:"#FCCD97", marginBottom:14 }}>Follow Us</p>
              <div style={{ display:"flex", gap:10 }}>
                {[{l:"Instagram",h:"#"},{l:"Facebook",h:"#"},{l:"WhatsApp",h:"https://wa.me/447700000000"}].map(s=>(
                  <a key={s.l} href={s.h} style={{ padding:"10px 16px", border:"1px solid rgba(252,205,151,.2)", fontSize:".68rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(249,244,238,.5)", textDecoration:"none", transition:"all .3s", minHeight: 40, display:"inline-flex", alignItems:"center" }}
                    onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="#FCCD97"; el.style.color="#FCCD97"; }}
                    onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor="rgba(252,205,151,.2)"; el.style.color="rgba(249,244,238,.5)"; }}
                  >{s.l}</a>
                ))}
              </div>
            </div>

            <div className="reveal" style={{ overflow:"hidden", aspectRatio:"16/9", maxHeight: 240 }}>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d159287.98690218752!2d-0.3817765!3d51.52800745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a00baf21de75%3A0x52963a5addd52a99!2sLondon%2C%20UK!5e0!3m2!1sen!2s!4v1234567890" width="100%" height="100%" style={{ border:0, filter:"grayscale(1) invert(0.9)", display:"block" }} loading="lazy" title="London Map" />
            </div>
          </div>

          {/* Form */}
          <div>
            <div className="s-label reveal" style={{ transitionDelay:".05s" }}>Send a Message</div>
            <h2 className="lux-title reveal" style={{ transitionDelay:".1s", marginBottom:32 }}>We&apos;d Love to <em>Hear from You</em></h2>

            {status === "success" ? (
              <div className="lux-card reveal" style={{ padding:"clamp(28px,5vw,40px)", textAlign:"center", borderColor:"rgba(252,205,151,.3)" }}>
                <div style={{ fontSize:"2.5rem", color:"#FCCD97", marginBottom:16 }}>✦</div>
                <h3 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.4rem,2.5vw,1.8rem)", color:"#F9F4EE", marginBottom:12 }}>Message Sent!</h3>
                <p style={{ color:"rgba(249,244,238,.5)", marginBottom:24, fontSize:".88rem" }}>Thank you for reaching out. We&apos;ll be in touch within 24 hours.</p>
                <button onClick={()=>setStatus("idle")} className="btn-outline" style={{ background:"none", cursor:"pointer" }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }} className="reveal">
                {[
                  { key:"full_name", label:"Full Name", type:"text", req:true, ph:"Your full name" },
                  { key:"email", label:"Email Address", type:"email", req:true, ph:"your@email.com" },
                  { key:"phone", label:"Phone Number", type:"tel", req:false, ph:"+44 7700 000 000" },
                ].map(f=>(
                  <div key={f.key}>
                    <label className="lux-label">{f.label} {f.req && <span style={{ color:"#FCCD97" }}>*</span>}</label>
                    <input type={f.type} required={f.req} placeholder={f.ph}
                      value={form[f.key as keyof typeof form]}
                      onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                      className="lux-input" />
                  </div>
                ))}
                <div>
                  <label className="lux-label">Message <span style={{ color:"#FCCD97" }}>*</span></label>
                  <textarea required rows={5} placeholder="Tell us about your event..."
                    value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                    className="lux-input" style={{ resize:"none" }} />
                </div>
                {status==="error" && <p style={{ color:"#ef4444", fontSize:".83rem" }}>Something went wrong. Please try again.</p>}
                <button type="submit" disabled={status==="loading"} className="btn-gold" style={{ cursor:"pointer", opacity:status==="loading"?.6:1 }}>
                  <span>{status==="loading" ? "Sending..." : "Send Message ✦"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
