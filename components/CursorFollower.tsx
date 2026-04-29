"use client";
import { useEffect, useRef } from "react";

export default function CursorFollower() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    let mouseX = -300, mouseY = -300;
    let ringX  = -300, ringY  = -300;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 2.5}px, ${mouseY - 2.5}px)`;
      }
    };

    const onDown = () => ringRef.current?.classList.add("is-clicking");
    const onUp   = () => ringRef.current?.classList.remove("is-clicking");

    const tick = () => {
      raf = requestAnimationFrame(tick);
      ringX += (mouseX - ringX) * 0.11;
      ringY += (mouseY - ringY) * 0.11;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 17}px, ${ringY - 17}px)`;
      }
    };
    tick();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    const addHover    = () => ringRef.current?.classList.add("is-hovering");
    const removeHover = () => ringRef.current?.classList.remove("is-hovering");

    // Attach after a short delay so dynamic content is rendered
    const attachTimer = setTimeout(() => {
      document.querySelectorAll("a, button, [role='button'], .cat-card").forEach(el => {
        el.addEventListener("mouseenter", addHover);
        el.addEventListener("mouseleave", removeHover);
      });
    }, 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(attachTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      document.querySelectorAll("a, button, [role='button'], .cat-card").forEach(el => {
        el.removeEventListener("mouseenter", addHover);
        el.removeEventListener("mouseleave", removeHover);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
