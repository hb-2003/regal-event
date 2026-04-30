"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

interface TextRevealProps {
  children: React.ReactNode;
  as?: "div" | "p" | "h1" | "h2" | "h3" | "span";
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
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const triggerEl = textRef.current.parentElement ?? textRef.current;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Split the text into lines and words
    const split = new SplitType(textRef.current, { types: "lines,words,chars" });

    // Animate the characters
    const ctx = gsap.context(() => {
      gsap.from(split.chars, {
        scrollTrigger: {
          trigger: triggerEl,
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
      split.split({ types: "lines,words,chars" });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
      split.revert();
    };
  }, [delay]);

  const content = (
    <span ref={textRef} style={{ display: "inline-block" }}>
      {children}
    </span>
  );
  const sharedProps = {
    className,
    style: { ...style, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" },
  };

  switch (Tag) {
    case "h1":
      return <h1 {...sharedProps}>{content}</h1>;
    case "h2":
      return <h2 {...sharedProps}>{content}</h2>;
    case "h3":
      return <h3 {...sharedProps}>{content}</h3>;
    case "p":
      return <p {...sharedProps}>{content}</p>;
    case "span":
      return <span {...sharedProps}>{content}</span>;
    case "div":
    default:
      return <div {...sharedProps}>{content}</div>;
  }
}
