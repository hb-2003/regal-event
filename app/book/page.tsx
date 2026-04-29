"use client";
import { useEffect, useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Category = { id:number; name:string; slug:string };

function BookingForm() {
  const searchParams = useSearchParams();
  const preCategory = searchParams.get("category") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [form, setForm] = useState({
    full_name:"", phone:"", email:"", event_date:"",
    category:preCategory, venue:"", guests:"", budget:"", notes:""
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories").then(r=>r.json()).then((cats:Category[]) => {
      if (cancelled) return;
      setCategories(cats);
      setForm(f => {
        if (f.category) return f;
        const matched = cats.find(c=>c.slug===preCategory||c.name===preCategory);
        return matched ? {...f, category: matched.name} : f;
      });
    }).catch(()=>{});
    return () => { cancelled = true; };
  }, [preCategory]);

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault();
    setStatus("loading"); setErrorMsg("");
    try {
      const res = await fetch("/api/bookings", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form, guests:form.guests?Number(form.guests):undefined})
      });
      const data = await res.json();
      if (res.ok) { setBookingId(data.booking_id); setStatus("success"); }
      else { setErrorMsg(data?.error || "Something went wrong"); setStatus("error"); }
    } catch { setErrorMsg("Network error"); setStatus("error"); }
  }

  const set = useCallback((k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(f=>({...f,[k]:e.target.value})), []);

  if (status==="success") return (
    <div style={{ maxWidth:560, marginInline:"auto", textAlign:"center" }}>
      <div className="lux-card" style={{ padding:"clamp(28px,5vw,48px)", borderColor:"rgba(252,205,151,.3)" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", border:"2px solid #FCCD97", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem", color:"#FCCD97", margin:"0 auto 24px" }}>✦</div>
        <h2 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.6rem,3vw,2rem)", fontWeight:400, color:"#F9F4EE", marginBottom:12 }}>Booking Received!</h2>
        <p style={{ color:"rgba(249,244,238,.5)", marginBottom:28, fontSize:".88rem", lineHeight:1.7 }}>
          Thank you for choosing Regal Event London. Our team will be in touch within 24 hours.
        </p>
        <div style={{ background:"rgba(1,89,97,.15)", border:"1px solid rgba(252,205,151,.2)", padding:"20px 24px", marginBottom:28 }}>
          <p style={{ fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(249,244,238,.4)", marginBottom:8 }}>Your Booking ID</p>
          <p style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.5rem,3.5vw,2.2rem)", fontWeight:600, letterSpacing:".08em", color:"#FCCD97", wordBreak:"break-all" }}>{bookingId}</p>
        </div>
        <p style={{ fontSize:".8rem", color:"rgba(249,244,238,.4)", marginBottom:24 }}>Save this ID to track your booking at any time.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href={`/track?id=${bookingId}`} className="btn-gold"><span>Track Booking →</span></Link>
          <Link href="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth:720, marginInline:"auto" }}>
      <div className="lux-card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"clamp(20px,3.5vw,28px) clamp(22px,4vw,36px)", background:"linear-gradient(90deg,#015961,#022C32)", borderBottom:"1px solid rgba(252,205,151,.12)" }}>
          <h2 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.5rem,2.6vw,1.9rem)", fontWeight:400, color:"#FCCD97", marginBottom:6 }}>Event Details</h2>
          <p style={{ fontSize:".82rem", color:"rgba(249,244,238,.5)" }}>Fill in your details and we&apos;ll get back to you within 24 hours.</p>
        </div>

        <div style={{ padding:"clamp(22px,4vw,36px)", display:"flex", flexDirection:"column", gap:22 }}>
          <div>
            <label className="lux-label">Full Name <span style={{ color:"#FCCD97" }}>*</span></label>
            <input type="text" required placeholder="Your full name" value={form.full_name} onChange={set("full_name")} className="lux-input" />
          </div>

          <div className="grid-1-2">
            <div>
              <label className="lux-label">Phone <span style={{ color:"#FCCD97" }}>*</span></label>
              <input type="tel" required placeholder="+44 7700 000 000" value={form.phone} onChange={set("phone")} className="lux-input" />
            </div>
            <div>
              <label className="lux-label">Email Address <span style={{ color:"#FCCD97" }}>*</span></label>
              <input type="email" required placeholder="your@email.com" value={form.email} onChange={set("email")} className="lux-input" />
            </div>
          </div>

          <div className="grid-1-2">
            <div>
              <label className="lux-label">Event Date <span style={{ color:"#FCCD97" }}>*</span></label>
              <input type="date" required value={form.event_date} onChange={set("event_date")}
                min={new Date().toISOString().split("T")[0]}
                className="lux-input" style={{ colorScheme:"dark" }}
              />
            </div>
            <div>
              <label className="lux-label">Event Category <span style={{ color:"#FCCD97" }}>*</span></label>
              <select required value={form.category} onChange={set("category")} className="lux-input" style={{ cursor:"pointer" }}>
                <option value="">Select a category</option>
                {categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="lux-label">Venue / Location</label>
            <input type="text" placeholder="e.g. Home, hired venue, restaurant..." value={form.venue} onChange={set("venue")} className="lux-input" />
          </div>

          <div className="grid-1-2">
            <div>
              <label className="lux-label">Number of Guests</label>
              <input type="number" min="1" placeholder="Approximate number" value={form.guests} onChange={set("guests")} className="lux-input" />
            </div>
            <div>
              <label className="lux-label">Budget Range</label>
              <select value={form.budget} onChange={set("budget")} className="lux-input" style={{ cursor:"pointer" }}>
                <option value="">Select budget</option>
                {["Under £500","£500 – £1,000","£1,000 – £2,500","£2,500 – £5,000","£5,000+"].map(b=>(
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="lux-label">Special Requests</label>
            <textarea rows={4} placeholder="Any specific themes, colours, or requirements..." value={form.notes} onChange={set("notes")}
              className="lux-input" style={{ resize:"vertical", minHeight: 96 }} />
          </div>

          {status==="error" && (
            <p style={{ color:"#ef4444", fontSize:".83rem" }}>{errorMsg || "Something went wrong. Please try again."}</p>
          )}

          <button type="submit" disabled={status==="loading"} className="btn-gold" style={{
            cursor: status==="loading" ? "not-allowed" : "pointer",
            opacity: status==="loading" ? .6 : 1, width:"100%", padding:"16px 36px"
          }}>
            <span>{status==="loading" ? "Submitting..." : "Submit Booking ✦"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default function BookPage() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">Begin Your Journey</div>
          <h1 className="page-hero-title"><span className="gold-shimmer">Book Your Event</span></h1>
          <p className="page-hero-sub">Tell us about your vision and we&apos;ll create something extraordinary</p>
        </div>
      </div>

      <section className="section-tight" style={{ background:"#011F23" }}>
        <div className="container-x" style={{ maxWidth: 800, marginInline:"auto" }}>
          <Suspense fallback={
            <div style={{ minHeight: 500, background:"rgba(1,89,97,.08)", border:"1px solid rgba(252,205,151,.06)" }} />
          }>
            <BookingForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
