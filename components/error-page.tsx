"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeft, Link2Off, Clock } from "lucide-react";
import Link from "next/link";

const ICONS = { "link-off": Link2Off, clock: Clock };

export function ErrorPage({
  type,
  code,
  title,
  description,
}: {
  type: keyof typeof ICONS;
  code: string;
  title: string;
  description: string;
}) {
  const Icon = ICONS[type];
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".error-icon", { scale: 0, opacity: 0, duration: 0.55, ease: "back.out(2)" })
      .from(".error-code", { opacity: 0, y: 8, duration: 0.4 }, "-=0.2")
      .from(".error-title", { opacity: 0, y: 12, duration: 0.45 }, "-=0.25")
      .from(".error-desc", { opacity: 0, y: 12, duration: 0.45 }, "-=0.3")
      .from(".error-cta", { opacity: 0, y: 12, duration: 0.45 }, "-=0.3");
  }, { scope: ref });

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(46,32,21,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(46,32,21,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div ref={ref} className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="error-icon mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/20 bg-brand/[0.08] animate-float">
          <Icon className="h-8 w-8 text-brand" />
        </div>

        <p className="error-code mb-2 text-xs font-medium tracking-[0.3em] text-white/20 uppercase">
          Error {code}
        </p>

        <h1 className="error-title mb-3 text-2xl sm:text-3xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="error-desc mb-8 text-white/40 text-sm leading-relaxed">
          {description}
        </p>

        <div className="error-cta">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand text-brand-foreground px-6 py-2.5 text-sm font-semibold hover:bg-brand/90 transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
