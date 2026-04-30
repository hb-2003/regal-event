"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const words = ["VISION", "DESIGN", "ELEGANCE", "PERFECTION"];

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll lock
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
      },
    });

    let currentProgress = 0;

    // Animate words flashing
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 250);

    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 2;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        clearInterval(wordInterval);
        setProgress(100);

        // Preloader exit animation - Cinematic Split Reveal
        tl.to(textRef.current, {
          yPercent: -100,
          opacity: 0,
          duration: 0.6,
          ease: "power3.inOut",
          delay: 0.2,
        })
        .to(leftCurtainRef.current, {
          xPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
        }, "-=0.2")
        .to(rightCurtainRef.current, {
          xPercent: 100,
          duration: 1.2,
          ease: "power4.inOut",
        }, "-=1.2");

      } else {
        setProgress(currentProgress);
      }
    }, 60);

    return () => {
      clearInterval(interval);
      clearInterval(wordInterval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] pointer-events-none"
    >
      {/* Split Curtains */}
      <div
        ref={leftCurtainRef}
        className="absolute inset-y-0 left-0 w-1/2 bg-[#011F23]"
        style={{ borderRight: "1px solid rgba(252,205,151,0.05)" }}
      />
      <div
        ref={rightCurtainRef}
        className="absolute inset-y-0 right-0 w-1/2 bg-[#011F23]"
        style={{ borderLeft: "1px solid rgba(252,205,151,0.05)" }}
      />

      {/* Content */}
      <div ref={textRef} className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <div
          className="text-[#FCCD97] text-xs md:text-sm tracking-[0.4em] uppercase font-medium"
          style={{ fontFamily: "var(--font-jost), sans-serif", minHeight: "20px" }}
        >
          {progress < 100 ? words[wordIndex] : "REGAL EVENTS"}
        </div>

        <div
          className="text-[#F9F4EE] text-7xl md:text-9xl font-light"
          style={{ fontFamily: "var(--font-cormorant), serif", lineHeight: 0.8 }}
        >
          {progress}%
        </div>
      </div>
    </div>
  );
}
