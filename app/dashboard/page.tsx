import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus, BarChart3 } from "lucide-react";
import { createUserClient } from "@/lib/supabase/server";
import type { Link as LinkRow } from "@/types";
import { DashboardLinkCard } from "./DashboardLinkCard";
import { GsapStagger } from "@/components/effects/gsap-stagger";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { SiteLogo } from "@/components/site-logo";
import { getLogoSrc } from "@/lib/logo.server";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Dashboard",
  description: "Manage your short links, view click counts, download QR codes, and track performance.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createUserClient();
  if (!supabase) redirect("/sign-in");

  const { data: links, error } = await supabase
    .from("links")
    .select("id, slug, destination_url, title, clicks, created_at, expires_at, is_password_protected")
    .order("created_at", { ascending: false });

  if (error) console.error("[dashboard] fetch error:", error.message);

  const rows = (links ?? []) as LinkRow[];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const logoSrc = getLogoSrc();
  const totalClicks = rows.reduce((sum, l) => sum + l.clicks, 0);
  const activeLinks = rows.filter(l => !l.expires_at || new Date(l.expires_at) > new Date()).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Noise */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      {/* Nav */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between gap-3 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <SiteLogo href="/" src={logoSrc} className="text-base sm:text-lg shrink-0" size={24} />
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-1.5 rounded-lg border border-white/8 px-2.5 sm:px-3 py-1.5 text-xs text-white/40 hover:text-brand hover:border-brand/40 transition-all whitespace-nowrap">
            <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New link</span>
          </Link>
          <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Stats row */}
        <GsapStagger stagger={0.08} y={14}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total links", value: rows.length, suffix: "" },
              { label: "Active links", value: activeLinks, suffix: "" },
              { label: "Total clicks", value: totalClicks, suffix: "" },
            ].map(({ label, value }) => (
              <div key={label} className="stagger-item rounded-xl border border-white/8 bg-white/[0.02] p-5">
                <p className="text-xs text-white/30 mb-1">{label}</p>
                <p className="text-2xl font-bold tracking-tight">
                  <NumberTicker value={value} className="text-white" />
                </p>
              </div>
            ))}
          </div>
        </GsapStagger>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold">My links</h1>
          <span className="text-xs text-white/25">{rows.length} total</span>
        </div>

        {/* Empty state */}
        {rows.length === 0 && (
          <GsapStagger>
            <div className="stagger-item flex flex-col items-center justify-center py-24 sm:py-32 px-4 text-center border border-white/5 rounded-2xl bg-white/[0.01]">
              <SiteLogo showText={false} src={logoSrc} size={44} className="mb-5 opacity-30" />
              <h2 className="text-base font-semibold text-white/60 mb-2">No links yet</h2>
              <p className="text-sm text-white/25 mb-6 max-w-xs leading-relaxed">
                Create your first short link and it will appear here with click analytics.
              </p>
              <Link href="/" className="rounded-xl bg-brand text-brand-foreground px-5 py-2.5 text-sm font-semibold hover:bg-brand/90 transition-colors">
                Create your first link
              </Link>
            </div>
          </GsapStagger>
        )}

        {/* Links */}
        {rows.length > 0 && (
          <GsapStagger stagger={0.05} y={14}>
            <div className="flex flex-col gap-2">
              {rows.map((link) => (
                <div key={link.id} className="stagger-item">
                  <DashboardLinkCard link={link} baseUrl={baseUrl} logoSrc={logoSrc} />
                </div>
              ))}
            </div>
          </GsapStagger>
        )}
      </main>
    </div>
  );
}
