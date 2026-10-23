"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}

export function Typewriter({
  words,
  className,
  typingSpeed = 60,
  deletingSpeed = 35,
  pauseMs = 1800,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    const word = words[wordIndex % words.length];

    if (phase === "typing") {
      if (displayed.length < word.length) {
        const t = setTimeout(
          () => setDisplayed(word.slice(0, displayed.length + 1)),
          typingSpeed
        );
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("deleting"), pauseMs);
        return () => clearTimeout(t);
      }
    }

    if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          deletingSpeed
        );
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setWordIndex((i) => i + 1);
          setPhase("typing");
        }, typingSpeed);
        return () => clearTimeout(t);
      }
    }
  }, [displayed, phase, wordIndex, words, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className={cn("inline-flex items-center gap-[2px]", className)}>
      {displayed}
      <span className="inline-block h-[1em] w-[2px] bg-current animate-cursor-blink ml-0.5" />
    </span>
  );
}