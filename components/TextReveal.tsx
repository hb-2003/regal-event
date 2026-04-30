"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

interface TextRevealProps {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

export default function TextReveal({
  children,
  as: Tag = "div",
  className = "",
  style = {},
  delay = 0,
}: TextRevealProps) {
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Split the text into lines and words
    const split = new SplitType(textRef.current, { types: "lines,words,chars" });

    // Animate the characters
    const ctx = gsap.context(() => {
      gsap.from(split.chars, {
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 85%", // Start animation when top of element hits 85% of viewport
        },
        y: "100%",
        opacity: 0,
        rotateZ: 5,
        duration: 0.8,
        ease: "power4.out",
        stagger: 0.02,
        delay: delay,
      });
    }, textRef);

    // Re-split on window resize
    const handleResize = () => {
      split.split();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
      split.revert();
    };
  }, [delay]);

  return (
    <Tag ref={textRef} className={className} style={{ ...style, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}>
      {children}
    </Tag>
  );
}
