"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number | null | undefined;
  direction?: "up" | "down";
  className?: string;
  delay?: number;
  decimalPlaces?: number;
  /** Format large numbers as 1.2K / 3.4M instead of full digits with commas. */
  compact?: boolean;
}

export function NumberTicker({
  value: rawValue,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  compact = false,
}: NumberTickerProps) {
  const value = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    isInView &&
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(() => {
    const format = (n: number) =>
      compact
        ? Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(n)
        : Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(n.toFixed(decimalPlaces)));

    // Set the initial value immediately — springValue's "change" event only
    // fires when the value actually moves, so if start === end (e.g. a
    // value of 0 animating to 0), the span would otherwise stay blank.
    if (ref.current) {
      ref.current.textContent = format(springValue.get());
    }

    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });
  }, [springValue, decimalPlaces, compact]);

  return (
    <span
      className={cn("inline-block tabular-nums", className)}
      ref={ref}
    />
  );
}
