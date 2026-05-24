"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
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
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!textRef.current) return;
    const triggerEl = textRef.current.parentElement ?? textRef.current;

    const split = new SplitType(textRef.current, { types: "lines,words,chars" });
    let currentChars = split.chars;

    if (!currentChars || currentChars.length === 0) {
      return () => split.revert();
    }

    // Set initial hidden state
    gsap.set(currentChars, { y: "100%", opacity: 0, rotateZ: 5 });

    const playAnimation = () => {
      if (hasPlayed.current) return;
      hasPlayed.current = true;
      gsap.to(currentChars!, {
        y: 0,
        opacity: 1,
        rotateZ: 0,
        duration: 0.8,
        ease: "power4.out",
        stagger: 0.02,
        delay,
        overwrite: true,
      });
    };

    // Use IntersectionObserver — reliable regardless of Lenis/preloader state
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          playAnimation();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(triggerEl);

    const handleResize = () => {
      gsap.killTweensOf(currentChars!);
      split.split({ types: "lines,words,chars" });
      currentChars = split.chars;
      if (!hasPlayed.current && currentChars) {
        gsap.set(currentChars, { y: "100%", opacity: 0, rotateZ: 5 });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      gsap.killTweensOf(currentChars!);
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
    style: { ...style, overflow: "hidden" as const },
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
