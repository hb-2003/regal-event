"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll lock
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
      },
    });

    // Simulate loading progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 1;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgress(100);

        // Preloader exit animation
        tl.to(textRef.current, {
          yPercent: -100,
          opacity: 0,
          duration: 0.6,
          ease: "power3.inOut",
          delay: 0.2,
        }).to(
          containerRef.current,
          {
            yPercent: -100,
            duration: 0.8,
            ease: "power3.inOut",
          },
          "-=0.2"
        );
      } else {
        setProgress(currentProgress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#011F23]"
    >
      <div ref={textRef} className="flex flex-col items-center gap-4">
        <div className="text-[#FCCD97] text-sm tracking-[0.3em] uppercase font-medium">
          Regal Events London
        </div>
        <div
          className="text-[#F9F4EE] text-6xl md:text-8xl font-light"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          {progress}%
        </div>
      </div>
    </div>
  );
}
