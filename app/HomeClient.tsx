"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import {
  motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring
} from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Link2, Lock, Clock, BarChart3, Zap, Shield, Globe,
  Copy, Check, ArrowRight, QrCode, Scissors, ChevronDown, Eye, EyeOff
} from "lucide-react";
import { Marquee } from "@/components/magicui/marquee";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BlurFade } from "@/components/magicui/blur-fade";
import { AnimatedWords } from "@/components/effects/animated-text";
import { MagneticButton } from "@/components/effects/magnetic-button";
import { Typewriter } from "@/components/effects/typewriter";
import { StyledQr, type StyledQrHandle } from "@/components/styled-qr";
import { CustomSelect } from "@/components/custom-select";
import { SiteLogo } from "@/components/site-logo";
import { AboutBlock, FaqSection, HowToBlock, KeyFactsBlock, UseCasesBlock } from "@/components/aeo/content-blocks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PublicStats } from "@/lib/getPublicStats";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────
type ExpiryOption = "never" | "1" | "7" | "30";
interface FormState {
  longUrl: string; customSlug: string; expiry: ExpiryOption;
  passwordEnabled: boolean; password: string; showPassword: boolean;
}
interface ShortenResult {
  slug: string; shortUrl: string; createdAt: string; expiresAt: string | null;
}
const INITIAL_FORM: FormState = {
  longUrl: "", customSlug: "", expiry: "never",
  passwordEnabled: false, password: "", showPassword: false,
};

const FEATURES = [
  { icon: Zap, label: "Sub-10ms redirects" },
  { icon: Shield, label: "Password protection" },
  { icon: Clock, label: "Auto-expiry" },
  { icon: BarChart3, label: "Click analytics" },
  { icon: Globe, label: "Custom aliases" },
  { icon: QrCode, label: "QR generation" },
  { icon: Lock, label: "Encrypted passwords" },
  { icon: Link2, label: "Permanent links" },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function HomeClient({ stats, logoSrc }: { stats: PublicStats; logoSrc: string }) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Scroll-reveal features section
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".gsap-reveal").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        y: 30, opacity: 0, duration: 0.7, ease: "power3.out",
      });
    });
  });

  const set = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(p => ({ ...p, [k]: v })), []);

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setForm(INITIAL_FORM); setResult(null);
    setCopied(false); setShowAdvanced(false);
    setTimeout(() => inputRef.current?.focus(), 60);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const body: Record<string, unknown> = { destinationUrl: form.longUrl };
    if (form.customSlug.trim()) body.customSlug = form.customSlug.trim();
    if (form.expiry !== "never") body.expiresInDays = Number(form.expiry);
    if (form.passwordEnabled && form.password) body.password = form.password;
    try {
      const res = await fetch("/api/shorten", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.errors?.[0]?.message ?? json?.error ?? "Something went wrong.");
        return;
      }
      setResult(json as ShortenResult);
      toast.success("Link shortened!");
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  }

  const avgClicksPerLink = stats.totalLinks > 0 ? stats.totalClicks / stats.totalLinks : 0;

  const STATS = [
    { value: stats.totalLinks, suffix: "", compact: true, label: "Links shortened" },
    { value: stats.totalClicks, suffix: "", compact: true, label: "Total redirects" },
    { value: stats.activeLinks, suffix: "", compact: true, label: "Active links" },
    { value: avgClicksPerLink, suffix: "", compact: false, decimals: 1, label: "Avg clicks / link" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Persistent grid */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(46,32,21,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(46,32,21,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,black,transparent)]" />

      {/* ── NAV ── */}
      <SiteNav logoSrc={logoSrc} />

      {/* ── HERO ── */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-28"
      >
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-5xl">

          {/* Giant headline */}
          <HeroHeadline />

          {/* Typewriter subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mb-12 text-base md:text-lg text-white/35 max-w-sm leading-relaxed"
          >
            The fastest link shortener with{" "}
            <Typewriter
              words={["analytics.", "password gates.", "expiry dates.", "QR codes.", "custom aliases."]}
              className="text-white/55"
            />
          </motion.p>

          {/* ── FORM CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.75, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-2xl"
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ResultCard result={result} copied={copied} onCopy={handleCopy} onReset={handleReset} logoSrc={logoSrc} />
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <ShortenForm
                    form={form} set={set} loading={loading}
                    showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
                    inputRef={inputRef} onSubmit={handleSubmit}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>

      {/* ── MARQUEE ── */}
      <div className="relative z-10 py-8 border-y border-white/[0.05] overflow-hidden">
        <Marquee pauseOnHover className="[--duration:28s]">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="mx-10 flex items-center gap-2.5 text-white/25 hover:text-brand transition-colors cursor-default">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-sm font-medium whitespace-nowrap tracking-wide">{label}</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* ── FEATURES ── */}
      <section className="relative z-10 py-36 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="gsap-reveal text-center mb-20">
            <p className="text-xs font-medium tracking-[0.35em] text-white/25 uppercase mb-5">What you get</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.9]">
              Everything you need.<br />
              <span className="text-brand/50">Nothing you don&apos;t.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] overflow-hidden rounded-2xl border border-white/[0.06]">
            {[
              { icon: Zap, title: "Lightning fast", desc: "Sub-10ms redirects via edge caching. Users never wait." },
              { icon: Shield, title: "Password gates", desc: "Protect links with encrypted passwords — share privately." },
              { icon: Clock, title: "Auto-expiry", desc: "Set an expiry date. Links self-destruct automatically, right on schedule." },
              { icon: BarChart3, title: "Click analytics", desc: "Every redirect tracked with timestamps and click counters." },
              { icon: Globe, title: "Custom aliases", desc: "Pick a readable, brandable slug for campaigns or sharing." },
              { icon: QrCode, title: "QR codes", desc: "Every link ships with a downloadable high-res QR code." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="bg-black hover:bg-white/[0.02] transition-colors duration-300">
                <div className="gsap-reveal relative z-10 p-8 flex flex-col gap-4 group" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="h-9 w-9 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center group-hover:border-brand/40 group-hover:bg-brand/[0.08] transition-colors duration-300">
                    <Icon className="h-4 w-4 text-white/50 group-hover:text-brand transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1.5 text-sm tracking-wide">{title}</h3>
                    <p className="text-white/35 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS (live data) ── */}
      <section className="relative z-10 py-28 px-4 border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {STATS.map(({ value, suffix, label, decimals, compact }, i) => (
            <BlurFade key={label} delay={0.1 * i} inView>
              <div className="flex flex-col items-center gap-2">
                <div className="inline-flex items-baseline justify-center whitespace-nowrap text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                  <NumberTicker value={value} decimalPlaces={decimals ?? 0} compact={compact} className="text-white" />
                  {suffix && <span className="text-white/25 ml-0.5">{suffix}</span>}
                </div>
                <p className="text-[11px] sm:text-xs text-white/30 font-medium tracking-wide uppercase">{label}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 py-36 px-4 max-w-2xl mx-auto">
        <div className="gsap-reveal text-center mb-20">
          <p className="text-xs font-medium tracking-[0.35em] text-white/25 uppercase mb-5">How it works</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Three steps.</h2>
        </div>
        {[
          { n: "01", t: "Paste your URL", d: "Drop in any HTTP/HTTPS link — no matter how long." },
          { n: "02", t: "Customize (optional)", d: "Add a custom alias, set a password, or choose an expiry." },
          { n: "03", t: "Share & track", d: "Copy the short link or use the QR code. Watch clicks roll in." },
        ].map(({ n, t, d }, i) => (
          <BlurFade key={n} delay={0.15 * i} inView>
            <motion.div
              whileHover={{ x: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex gap-8 py-8 border-b border-white/[0.06] last:border-0 cursor-default"
            >
              <span className="text-5xl font-bold text-white/[0.07] tabular-nums shrink-0 mt-1 leading-none">{n}</span>
              <div>
                <h3 className="font-semibold mb-1.5">{t}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{d}</p>
              </div>
            </motion.div>
          </BlurFade>
        ))}
      </section>

      <AboutBlock />
      <UseCasesBlock />
      <KeyFactsBlock />
      <FaqSection />
      <HowToBlock />

      {/* ── CTA ── */}
      <section className="relative z-10 py-28 px-4">
        <BlurFade inView>
          <div className="relative max-w-xl mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] p-14 text-center overflow-hidden">
            <p className="relative z-10 text-xs font-medium tracking-[0.35em] text-white/25 uppercase mb-5">Get started</p>
            <h2 className="relative z-10 text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
              Your first short link<br />takes 5 seconds.
            </h2>
            <p className="relative z-10 text-white/35 text-sm mb-9 leading-relaxed">
              Paste your link, hit shorten, and share it anywhere.
            </p>
            <MagneticButton
              className="relative z-10 bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-3.5 text-sm"
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => inputRef.current?.focus(), 600); }}
            >
              Try it now <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </BlurFade>
      </section>

      <SiteFooter logoSrc={logoSrc} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
function SiteFooter({ logoSrc }: { logoSrc: string }) {
  const columns = [
    {
      heading: "Product",
      links: [
        { label: "Home", href: "/" },
        { label: "FAQ", href: "/#faq" },
        { label: "Use cases", href: "/#use-cases" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Sign in", href: "/sign-in" },
        { label: "Sign up", href: "/sign-up" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="relative z-10 border-t border-white/[0.06]">
      <div className="gsap-reveal max-w-5xl mx-auto px-6 py-16 grid grid-cols-2 sm:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-2 flex flex-col gap-3 pr-4">
          <SiteLogo
            href="/"
            src={logoSrc}
            className="text-base text-white/80 hover:text-white transition-colors w-fit"
            textClassName="text-white/80"
            size={20}
          />
          <p className="text-sm text-white/30 leading-relaxed max-w-xs">
            Shorten any link, protect it, and watch every click come in — all from one clean dashboard.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading} className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-[0.2em] text-white/25 uppercase">{col.heading}</p>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl mx-auto text-xs text-white/20">
        <span>© {new Date().getFullYear()} SnipShort. All rights reserved.</span>
        <span>Shorten smarter.</span>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero headline
// ─────────────────────────────────────────────────────────────
function HeroHeadline() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".hero-underline",
      { scaleX: 0 },
      { scaleX: 1, duration: 0.9, delay: 1.35, ease: "power3.inOut", transformOrigin: "left center" }
    );
  }, { scope: ref });

  return (
    <div ref={ref} className="relative">
      <h1 className="mb-6 font-bold tracking-tighter text-[clamp(3.75rem,12vw,8.5rem)] leading-[0.88]">
        <AnimatedWords
          text="Shorten."
          delay={0.1}
          stagger={0.05}
          duration={0.9}
          className="block"
        />
        <AnimatedWords
          text="Share."
          delay={0.3}
          stagger={0.05}
          duration={0.9}
          className="block text-brand"
        />
        <span className="relative inline-block">
          <AnimatedWords
            text="Track."
            delay={0.5}
            stagger={0.05}
            duration={0.9}
            className="block"
          />
          <span className="hero-underline absolute -bottom-1 left-0 h-[0.09em] w-full rounded-full bg-brand/70 sm:-bottom-2" />
        </span>
      </h1>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────
function SiteNav({ logoSrc }: { logoSrc: string }) {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500",
        scrolled
          ? "bg-black/75 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      )}
    >
      <SiteLogo
        href="/"
        src={logoSrc}
        className="text-base text-white/80 hover:text-white transition-colors"
        textClassName="text-white/80"
        size={20}
      />

      <nav className="flex items-center gap-1.5">
        {isSignedIn ? (
          <>
            <a href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/45 hover:text-white hover:bg-white/[0.05] transition-all">
              Dashboard
            </a>
            <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
          </>
        ) : (
          <>
            <a href="/sign-in" className="inline-flex items-center px-3 py-1.5 text-sm text-white/40 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all">
              Sign in
            </a>
            <a href="/sign-up" className="inline-flex items-center gap-1.5 rounded-lg bg-brand text-brand-foreground px-4 py-1.5 text-sm font-semibold hover:bg-brand/90 transition-all active:scale-95">
              Sign up
            </a>
          </>
        )}
      </nav>
    </motion.header>
  );
}

// ─────────────────────────────────────────────────────────────
// Shorten Form
// ─────────────────────────────────────────────────────────────
function ShortenForm({
  form, set, loading, showAdvanced, setShowAdvanced, inputRef, onSubmit
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  loading: boolean;
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {/* Main input card */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className={cn(
          "relative flex gap-2 rounded-2xl border bg-white/[0.03] p-2 backdrop-blur-sm transition-all duration-300",
          focused ? "border-brand/50 shadow-[0_0_0_1px_rgba(107,66,38,0.25),0_8px_40px_rgba(46,32,21,0.15)]" : "border-white/[0.08]"
        )}>
          <div className="relative flex-1">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="url"
              required
              autoFocus
              placeholder="Paste your long URL here…"
              value={form.longUrl}
              onChange={e => set("longUrl", e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full h-13 pl-11 pr-4 bg-transparent text-white text-base outline-none placeholder:text-white/22"
              style={{ height: "3.25rem" }}
            />
          </div>

          <MagneticButton
            as="button"
            type={"submit" as unknown as undefined}
            disabled={loading}
            className={cn(
              "shrink-0 h-[3.25rem] px-7 bg-brand text-brand-foreground text-sm font-semibold rounded-xl transition-all disabled:opacity-45",
              !loading && "hover:bg-brand/90 active:scale-95"
            )}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              >
                <Scissors className="h-4 w-4" />
              </motion.div>
            ) : (
              <>Shorten <ArrowRight className="h-4 w-4" /></>
            )}
          </MagneticButton>
        </div>
      </div>

      {/* Advanced toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors py-1 px-3"
        >
          <motion.span animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
          {showAdvanced ? "Hide options" : "Advanced options"}
        </button>
      </div>

      {/* Advanced panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="relative rounded-xl border border-white/[0.08] bg-[#f2e6cd] overflow-hidden">
              <div className="relative z-10 p-5 flex flex-col gap-4">

                {/* Slug + Expiry row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/30 font-medium">Custom alias</label>
                    <div className="flex items-center h-10 rounded-lg border border-white/[0.08] bg-white/[0.04] overflow-hidden focus-within:border-brand/50 transition-colors">
                      <span className="pl-3 text-white/20 text-xs select-none shrink-0">snipshort/</span>
                      <input
                        type="text"
                        placeholder="my-link"
                        value={form.customSlug}
                        onChange={e => set("customSlug", e.target.value)}
                        className="flex-1 min-w-0 bg-transparent pr-3 py-2 text-sm text-white placeholder:text-white/18 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="expiry-select" className="text-xs text-white/30 font-medium">
                      Expires in
                    </label>
                    <CustomSelect
                      id="expiry-select"
                      value={form.expiry}
                      onChange={(v) => set("expiry", v as ExpiryOption)}
                      options={[
                        { value: "never", label: "Never" },
                        { value: "1", label: "1 day" },
                        { value: "7", label: "7 days" },
                        { value: "30", label: "30 days" },
                      ]}
                    />
                  </div>
                </div>

                {/* Password toggle */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => set("passwordEnabled", !form.passwordEnabled)}
                    className="flex items-center gap-3 w-fit group"
                  >
                    {/* Toggle */}
                    <div className={cn(
                      "relative h-5 w-9 rounded-full border transition-all duration-200",
                      form.passwordEnabled ? "bg-brand border-brand" : "bg-transparent border-white/20 group-hover:border-white/35"
                    )}>
                      <motion.div
                        animate={{ x: form.passwordEnabled ? 17 : 2 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className={cn("absolute top-0.5 h-3.5 w-3.5 rounded-full transition-colors", form.passwordEnabled ? "bg-brand-foreground" : "bg-white/30")}
                      />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-white/35 select-none group-hover:text-white/55 transition-colors">
                      <Lock className="h-3 w-3" /> Password protect
                    </span>
                  </button>

                  <AnimatePresence>
                    {form.passwordEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative overflow-hidden"
                      >
                        <input
                          type={form.showPassword ? "text" : "password"}
                          placeholder="Min 4 characters…"
                          value={form.password}
                          onChange={e => set("password", e.target.value)}
                          required={form.passwordEnabled}
                          minLength={4}
                          className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 pr-10 text-sm text-white placeholder:text-white/18 outline-none focus:border-brand/50 transition-colors"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => set("showPassword", !form.showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                        >
                          {form.showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Result Card
// ─────────────────────────────────────────────────────────────
function ResultCard({
  result, copied, onCopy, onReset, logoSrc
}: {
  result: ShortenResult;
  copied: boolean; onCopy: () => void; onReset: () => void; logoSrc: string;
}) {
  const qrRef = useRef<StyledQrHandle>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-50, 50], [3, -3]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-50, 50], [-3, 3]), { stiffness: 200, damping: 30 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="relative rounded-2xl border border-white/[0.1] bg-[#f2e6cd] overflow-hidden p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-6 w-6 rounded-full bg-brand/15 flex items-center justify-center"
        >
          <Check className="h-3.5 w-3.5 text-brand" />
        </motion.div>
        <span className="text-sm text-white/50">Link ready</span>
        {result.expiresAt && (
          <span className="ml-auto text-xs text-white/20">
            Expires {new Date(result.expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Short URL row */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 mb-4">
        <a href={result.shortUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 min-w-0 font-mono text-sm text-white truncate hover:text-white/75 transition-colors">
          {result.shortUrl}
        </a>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onCopy}
          className={cn(
            "shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300",
            copied ? "bg-brand text-brand-foreground" : "bg-white/[0.08] text-white/50 hover:bg-white/15 hover:text-white"
          )}
        >
          <AnimatePresence mode="wait">
            {copied
              ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="h-3.5 w-3.5" /></motion.span>
              : <motion.span key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy className="h-3.5 w-3.5" /></motion.span>
            }
          </AnimatePresence>
          {copied ? "Copied!" : "Copy"}
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col items-center gap-1.5 shrink-0 mx-auto sm:mx-0">
          <StyledQr data={result.shortUrl} logoSrc={logoSrc} size={96} ref={qrRef} />
          <button
            onClick={() => qrRef.current?.download(`qr-${result.slug}`)}
            className="text-[10px] text-white/20 hover:text-white/45 transition-colors"
          >
            Download
          </button>
        </div>
        <div className="flex-1 min-w-[180px] grid grid-cols-2 gap-2 content-start">
          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            href={`/stats/${result.slug}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2 py-2.5 text-xs font-medium text-white/40 hover:text-white hover:border-white/15 transition-all"
          >
            <BarChart3 className="h-3.5 w-3.5" /> Stats
          </motion.a>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2 py-2.5 text-xs font-medium text-white/40 hover:text-white hover:border-white/15 transition-all"
          >
            <Scissors className="h-3.5 w-3.5" /> New link
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
