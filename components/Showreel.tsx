"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

export default function Showreel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (videoWrapRef.current) {
      // Parallax effect on the video/poster
      gsap.to(videoWrapRef.current, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }, []);

  return (
    <>
      <section
        className="section"
        style={{ background: "#010E10", position: "relative", zIndex: 1 }}
      >
        <div className="container-x">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(32px, 5vw, 48px)" }}>
            <div>
              <div className="s-label reveal">The Experience</div>
              <h2 className="lux-title reveal" style={{ transitionDelay: ".1s" }}>The Art of <em>Celebration</em></h2>
            </div>
            <p className="reveal" style={{ transitionDelay: ".2s", color: "rgba(249,244,238,.45)", maxWidth: 380, fontSize: ".9rem", lineHeight: 1.6, display: "none" }}>
              Watch how we transform blank canvases into unforgettable immersive environments.
            </p>
          </div>

          <div
            ref={containerRef}
            onClick={() => setIsPlaying(true)}
            style={{
              position: "relative",
              width: "100%",
              height: "clamp(400px, 60vh, 800px)",
              overflow: "hidden",
              cursor: "pointer", // Make it clickable
            }}
          >
            {/* Parallax Image / Video Wrap */}
            <div
              ref={videoWrapRef}
              style={{
                position: "absolute",
                top: "-15%",
                left: 0,
                width: "100%",
                height: "130%",
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80"
                alt="Event Reel"
                fill
                style={{ objectFit: "cover", filter: "brightness(0.7)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Video Player */}
      {isPlaying && (
        <div
          className="lightbox on"
          onClick={() => setIsPlaying(false)}
          style={{ zIndex: 99999 }}
        >
          <div style={{ width: "90%", maxWidth: 1080, aspectRatio: "16/9", background: "#000", position: "relative" }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Showreel"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="lb-close" onClick={() => setIsPlaying(false)}>✕</div>
        </div>
      )}
    </>
  );
}
