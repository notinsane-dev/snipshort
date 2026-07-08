"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
}

export function AnimatedText({
  text,
  className,
  delay = 0,
  stagger = 0.025,
  duration = 0.7,
}: AnimatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const chars = ref.current?.querySelectorAll<HTMLElement>(".anim-char");
    if (!chars?.length) return;

    gsap.from(chars, {
      yPercent: 115,
      opacity: 0,
      duration,
      delay,
      stagger,
      ease: "power4.out",
    });
  }, { scope: ref });

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap", className)}>
      {text.split("").map((char, i) => (
        <span key={i} className="overflow-hidden inline-block leading-[1]">
          <span className="anim-char inline-block">
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Word-by-word variant */
export function AnimatedWords({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  duration = 0.8,
}: AnimatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const words = ref.current?.querySelectorAll<HTMLElement>(".anim-word");
    if (!words?.length) return;

    gsap.from(words, {
      yPercent: 120,
      opacity: 0,
      duration,
      delay,
      stagger,
      ease: "power4.out",
    });
  }, { scope: ref });

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap gap-x-[0.25em]", className)}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="overflow-hidden inline-block leading-[1.1]">
          <span className="anim-word inline-block">{word}</span>
        </span>
      ))}
    </span>
  );
}
