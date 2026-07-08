"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * Wraps auth page content (logo + Clerk card) in a GSAP entrance timeline.
 * Uses display:contents so it doesn't interfere with the parent's flex
 * layout — children remain direct flex items of the auth page shell.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".auth-logo", { y: -16, opacity: 0, duration: 0.6 })
      .from(".auth-card", { y: 24, opacity: 0, scale: 0.98, duration: 0.7 }, "-=0.35");
  }, { scope: ref });

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
