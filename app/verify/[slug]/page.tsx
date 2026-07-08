"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VerifyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useGSAP(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(cardRef.current, { opacity: 0, y: 20, scale: 0.97, duration: 0.45 })
      .from(".verify-icon", { scale: 0, duration: 0.5, ease: "back.out(2.2)" }, "-=0.2")
      .from(".verify-heading > *", { opacity: 0, y: 10, duration: 0.4, stagger: 0.06 }, "-=0.25")
      .from(".verify-form > *", { opacity: 0, y: 10, duration: 0.4, stagger: 0.06 }, "-=0.2");
  }, { scope: cardRef });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/verify/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();

      if (res.ok && json.destinationUrl) {
        window.location.href = json.destinationUrl;
        return;
      }

      setError(json.error ?? "Incorrect password.");
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 500);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(46,32,21,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(46,32,21,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div ref={cardRef} className="relative z-10 w-full max-w-sm">
        {/* Icon */}
        <div className="verify-icon mb-6 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/[0.08] animate-float">
          <Lock className="h-7 w-7 text-brand" />
        </div>

        <div className="verify-heading text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Password required</h1>
          <p className="text-sm text-white/35 leading-relaxed">
            This link is protected. Enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="verify-form flex flex-col gap-3">
          <div className={cn("relative", shake && "animate-shake")}>
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-brand/50 transition pr-11"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-xs text-red-400/80 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground py-3.5 text-sm font-semibold hover:bg-brand/90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 border-2 border-brand-foreground/20 border-t-brand-foreground rounded-full"
              />
            ) : (
              <>
                Unlock link <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-white/15">
          <a href="/" className="hover:text-white/40 transition-colors">← Back to SnipShort</a>
        </p>
      </div>
    </div>
  );
}
