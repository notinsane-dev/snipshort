"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface GsapStaggerProps {
  children: React.ReactNode;
  /** CSS selector (scoped to this wrapper) for the items to stagger in. */
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
}

/**
 * Wraps a list/grid of items and reveals them with a GSAP stagger animation
 * on mount. Uses display:contents so it never affects the parent's layout
 * (grid/flex) — children remain direct layout children of their real parent.
 */
export function GsapStagger({
  children,
  selector = ".stagger-item",
  y = 18,
  duration = 0.6,
  stagger = 0.07,
  delay = 0,
}: GsapStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const items = ref.current?.querySelectorAll(selector);
    if (!items?.length) return;
    gsap.from(items, {
      y,
      opacity: 0,
      duration,
      stagger,
      delay,
      ease: "power3.out",
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
