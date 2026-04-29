"use client";
import { useState, Suspense, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Booking = { booking_id:string; full_name:string; phone?:string; email?:string; event_date:string; category:string; venue:string; guests:number; budget:string; notes:string; status:string; admin_notes:string; created_at:string };

const statusSteps = ["Pending","Confirmed","Completed"];
const statusCfg: Record<string,{color:string;label:string;desc:string}> = {
  Pending:   { color:"#FCCD97", label:"Pending Review",   desc:"Your booking has been received and is awaiting review by our team." },
  Confirmed: { color:"#4ECDC4", label:"Confirmed",        desc:"Great news! Your booking has been confirmed. Our team is working on your event." },
  Completed: { color:"#95D5B2", label:"Completed",        desc:"Your event has been successfully completed. Thank you for choosing Regal Event London!" },
  Cancelled: { color:"#e07070", label:"Cancelled",        desc:"This booking has been cancelled. Please contact us if you have any questions." },
};

function TrackForm() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [query, setQuery] = useState(initialId);
  const [booking, setBooking] = useState<Booking|null>(null);
  const [fetchStatus, setFetchStatus] = useState<"idle"|"loading"|"found"|"not_found">("idle");
  const abortRef = useRef<AbortController|null>(null);

  const doSearch = useCallback(async (id?: string) => {
    const target = (id ?? query).trim();
    if (!target) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setFetchStatus("loading"); setBooking(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(target)}`, { signal: ac.signal });
      if (ac.signal.aborted) return;
      if (res.ok) { setBooking(await res.json()); setFetchStatus("found"); }
      else setFetchStatus("not_found");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setFetchStatus("not_found");
    }
  }, [query]);

  useEffect(() => {
    if (!initialId) return () => abortRef.current?.abort();
    // Defer state-changing call out of the synchronous effect body
    const t = setTimeout(() => { doSearch(initialId); }, 0);
    return () => { clearTimeout(t); abortRef.current?.abort(); };
  }, [initialId, doSearch]);

  return (
    <div style={{ maxWidth:680, marginInline:"auto" }}>
      <form onSubmit={e => { e.preventDefault(); doSearch(); }} style={{ display:"flex", gap:12, marginBottom:36, flexWrap:"wrap" }}>
        <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="e.g. RE-2401-ABCDEFGH" className="lux-input" style={{ flex:"1 1 240px", minWidth: 0 }} />
        <button type="submit" disabled={fetchStatus==="loading"} className="btn-gold" style={{ cursor:"pointer", padding:"14px 28px", flexShrink:0, opacity:fetchStatus==="loading"?.6:1 }}>
          <span>{fetchStatus==="loading" ? "..." : "Search"}</span>
        </button>
      </form>

      {fetchStatus==="not_found" && (
        <div className="lux-card" style={{ padding:"clamp(28px,5vw,48px)", textAlign:"center" }}>
          <div style={{ fontSize:"clamp(2rem,5vw,3rem)", color:"rgba(249,244,238,.2)", marginBottom:20 }}>◈</div>
          <h3 style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.4rem,3vw,1.8rem)", color:"#F9F4EE", marginBottom:10 }}>Booking Not Found</h3>
          <p style={{ color:"rgba(249,244,238,.4)", fontSize:".88rem" }}>No booking found with ID &ldquo;<strong style={{ color:"#F9F4EE", wordBreak:"break-all" }}>{query}</strong>&rdquo;. Please check the ID and try again.</p>
        </div>
      )}

      {fetchStatus==="found" && booking && (()=>{
        const sc = statusCfg[booking.status]||statusCfg["Pending"];
        const stepIdx = statusSteps.indexOf(booking.status);
        return (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Status */}
            <div className="lux-card" style={{ padding:"clamp(20px,3.5vw,28px)", borderColor:`${sc.color}30` }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:12 }}>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(249,244,238,.35)", marginBottom:6 }}>Booking ID</p>
                  <p style={{ fontFamily:"var(--font-cormorant),serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, color:"#FCCD97", letterSpacing:".06em", wordBreak:"break-all" }}>{booking.booking_id}</p>
                </div>
                <div style={{ padding:"6px 18px", border:`1px solid ${sc.color}`, color:sc.color, fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase", flexShrink:0 }}>{sc.label}</div>
              </div>
              <p style={{ fontSize:".83rem", color:"rgba(249,244,238,.5)", lineHeight:1.65 }}>{sc.desc}</p>
            </div>

            {/* Progress */}
            {booking.status !== "Cancelled" && (
              <div className="lux-card" style={{ padding:"clamp(20px,3.5vw,28px)" }}>
                <p style={{ fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(249,244,238,.35)", marginBottom:20 }}>Progress</p>
                <div style={{ display:"flex", alignItems:"center" }}>
                  {statusSteps.map((step,i)=>(
                    <div key={step} style={{ display:"flex", alignItems:"center", flex: i<statusSteps.length-1 ? 1 : "initial" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".83rem", fontWeight:500, background: i<=stepIdx?"#FCCD97":"rgba(1,89,97,.2)", color: i<=stepIdx?"#011F23":"rgba(249,244,238,.3)", transition:"all .3s" }}>
                          {i<stepIdx ? "✓" : i+1}
                        </div>
                        <p style={{ fontSize:".68rem", marginTop:6, color: i<=stepIdx?"#FCCD97":"rgba(249,244,238,.3)", letterSpacing:".06em", textAlign:"center" }}>{step}</p>
                      </div>
                      {i<statusSteps.length-1 && (
                        <div style={{ flex:1, height:1, margin:"0 8px 20px", background: i<stepIdx?"#FCCD97":"rgba(252,205,151,.1)", transition:"background .3s" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="lux-card" style={{ padding:"clamp(20px,3.5vw,28px)" }}>
              <p style={{ fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(249,244,238,.35)", marginBottom:16 }}>Event Details</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:10 }}>
                {[
                  ["Client Name",booking.full_name],["Event Category",booking.category],
                  ["Event Date",booking.event_date],["Venue",booking.venue||"—"],
                  ["Guests",booking.guests?String(booking.guests):"—"],["Budget",booking.budget||"—"],
                ].map(([label,value])=>(
                  <div key={label} style={{ padding:12, background:"rgba(1,89,97,.08)", border:"1px solid rgba(252,205,151,.07)" }}>
                    <p style={{ fontSize:".65rem", color:"rgba(249,244,238,.35)", marginBottom:4, letterSpacing:".1em", textTransform:"uppercase" }}>{label}</p>
                    <p style={{ fontSize:".88rem", color:"#F9F4EE", fontWeight:400, wordBreak:"break-word" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {booking.admin_notes && (
              <div style={{ padding:"18px 20px", background:"rgba(252,205,151,.06)", borderLeft:"2px solid #FCCD97" }}>
                <p style={{ fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"#FCCD97", marginBottom:8 }}>Note from Our Team</p>
                <p style={{ fontSize:".88rem", color:"rgba(249,244,238,.6)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{booking.admin_notes}</p>
              </div>
            )}

            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <Link href="/contact" className="btn-outline" style={{ flex:"1 1 180px", justifyContent:"center" }}>Contact Us</Link>
              <Link href="/book" className="btn-gold" style={{ flex:"1 1 180px", justifyContent:"center" }}><span>New Booking</span></Link>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function TrackPage() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow">Booking Status</div>
          <h1 className="page-hero-title"><span className="gold-shimmer">Track Your Booking</span></h1>
          <p className="page-hero-sub">Enter your Booking ID to see the latest status</p>
        </div>
      </div>
      <section className="section-tight" style={{ background:"#011F23" }}>
        <div className="container-x" style={{ maxWidth: 760, marginInline:"auto" }}>
          <Suspense fallback={<div style={{ minHeight:200, background:"rgba(1,89,97,.08)", border:"1px solid rgba(252,205,151,.06)" }} />}>
            <TrackForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
