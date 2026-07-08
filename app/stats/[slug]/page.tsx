import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, BarChart3, Clock, Link2, MousePointerClick, Shield } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { GsapStagger } from "@/components/effects/gsap-stagger";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params;
  return createMetadata({
    title: "Link analytics",
    description: "Private click analytics and performance data for your short link.",
    noIndex: true,
  });
}

export default async function StatsPage({ params }: Props) {
  const { slug } = await params;
  const { userId } = await auth();

  const supabase = await createServiceClient();
  const { data: link, error } = await supabase
    .from("links")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[stats] fetch error:", error.message);
    notFound();
  }
  if (!link) notFound();

  if (link.user_id) {
    if (!userId) redirect(`/sign-in?redirect_url=/stats/${slug}`);
    if (userId !== link.user_id) notFound();
  }

  const isExpired = link.expires_at ? new Date(link.expires_at) < new Date() : false;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const shortUrl = `${baseUrl}/r/${slug}`;

  const stats = [
    { icon: MousePointerClick, label: "Total clicks", value: link.clicks, suffix: "" },
    { icon: Clock, label: "Created", value: null, display: new Date(link.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
    { icon: Clock, label: "Expires", value: null, display: link.expires_at ? new Date(link.expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Never" },
    { icon: Clock, label: "Last click", value: null, display: link.last_clicked_at ? new Date(link.last_clicked_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "No clicks yet" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Noise */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      {/* Grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(46,32,21,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(46,32,21,0.045)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <header className="relative z-10 border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 min-w-0">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors shrink-0">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <span className="text-white/10 shrink-0">/</span>
        <span className="text-xs text-white/40 font-mono truncate">/{slug}</span>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <GsapStagger stagger={0.12} y={16}>
          {/* Hero section */}
          <div className="stagger-item mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-white/30" />
              <span className="text-xs font-medium tracking-[0.3em] text-white/30 uppercase">Link Analytics</span>
              {isExpired && (
                <span className="rounded-md border border-red-500/20 bg-red-500/5 px-2 py-0.5 text-xs text-red-400/70">Expired</span>
              )}
              {link.is_password_protected && (
                <span className="flex items-center gap-1 rounded-md border border-white/8 px-2 py-0.5 text-xs text-white/30">
                  <Shield className="h-3 w-3" /> Protected
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 break-all">/{slug}</h1>
            <a
              href={link.destination_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors break-all"
            >
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              {link.destination_url}
            </a>
          </div>

          {/* Click count hero */}
          <div className="stagger-item rounded-2xl border border-brand/20 bg-brand/[0.04] p-6 sm:p-8 mb-6 flex flex-col items-center text-center">
            <p className="text-xs text-white/30 mb-3 uppercase tracking-widest">Total clicks</p>
            <div className="text-5xl sm:text-7xl font-bold tracking-tighter mb-2 text-brand">
              <NumberTicker value={link.clicks} className="text-brand" />
            </div>
            <p className="text-xs text-white/20 break-all px-2">
              via <span className="font-mono">{shortUrl}</span>
            </p>
          </div>

          {/* Stats grid */}
          <div className="stagger-item grid grid-cols-2 gap-3 mb-10">
            {stats.map(({ icon: Icon, label, value, display, suffix }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-3.5 w-3.5 text-brand/60 shrink-0" />
                  <span className="text-xs text-white/30">{label}</span>
                </div>
                {value !== null ? (
                  <p className="text-xl sm:text-2xl font-bold tracking-tight">
                    <NumberTicker value={value} className="text-white" />
                    {suffix && <span className="text-white/40 text-lg ml-1">{suffix}</span>}
                  </p>
                ) : (
                  <p className="text-sm sm:text-base font-semibold break-words">{display}</p>
                )}
              </div>
            ))}
          </div>

          {/* Back */}
          {userId && (
            <Link href="/dashboard" className="stagger-item inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to all links
            </Link>
          )}
        </GsapStagger>
      </main>
    </div>
  );
}
