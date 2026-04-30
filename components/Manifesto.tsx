"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

export default function Manifesto() {
  const textRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Split text into words
    const split = new SplitType(textRef.current, { types: "words" });

    // Set initial state (faded out)
    gsap.set(split.words, {
      opacity: 0.15,
      color: "rgba(249,244,238,0.2)"
    });

    const ctx = gsap.context(() => {
      // Scrubbing reveal effect
      gsap.to(split.words, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          end: "bottom 65%",
          scrub: 1, // Add slight lag for smooth feel
        },
        opacity: 1,
        color: "#F9F4EE",
        stagger: 0.1,
        ease: "none",
      });
    }, containerRef);

    const handleResize = () => split.split({ types: "words" });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
      split.revert();
    };
  }, []);

  return (
    <section ref={containerRef} className="section" style={{ background: "#011F23" }}>
      <div className="container-x" style={{ maxWidth: 1080, marginInline: "auto", textAlign: "center" }}>
        <div className="s-label s-label-center" style={{ marginBottom: 40 }}>Our Philosophy</div>
        <h2
          ref={textRef}
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 300,
            lineHeight: 1.3,
            color: "#F9F4EE",
          }}
        >
          We believe a true celebration transcends aesthetics. It is the invisible poetry of anticipation, the flawless execution of grandeur, and the lingering warmth of an unforgettable memory crafted with absolute precision.
        </h2>
      </div>
    </section>
  );
}
