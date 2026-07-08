import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthShell } from "@/components/effects/auth-shell";
import { SiteLogo } from "@/components/site-logo";
import { getLogoSrc } from "@/lib/logo.server";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to your SnipShort account to manage links and view analytics.",
  path: "/sign-in",
});

export default function SignInPage() {
  const logoSrc = getLogoSrc();
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(46,32,21,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(46,32,21,0.045)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <AuthShell>
        <SiteLogo
          href="/"
          src={logoSrc}
          className="auth-logo relative z-10 mb-10 text-lg text-white/40 hover:text-white transition-colors"
          textClassName="text-white/40"
          size={26}
        />

        <div className="auth-card relative z-10 w-full flex justify-center">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#6b4226",
                colorBackground: "#f2e6cd",
                colorInput: "#2e2015",
                colorNeutral: "#8a7358",
                borderRadius: "0.75rem",
              },
              elements: {
                card: "shadow-2xl shadow-[#2e2015]/10 border border-white/8 bg-[#f2e6cd]",
                headerTitle: "text-white font-bold",
                headerSubtitle: "text-white/40",
                formButtonPrimary: "bg-brand text-brand-foreground font-semibold hover:bg-brand/90",
                footerActionLink: "text-brand hover:text-brand/80",
                formFieldLabel: "text-white/40 text-xs",
                formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                dividerLine: "bg-white/8",
                dividerText: "text-white/20",
                socialButtonsIconButton: "border-white/8 hover:border-white/20 bg-white/[0.03]",
                identityPreviewText: "text-white/60",
                identityPreviewEditButton: "text-white/40",
              },
            }}
          />
        </div>
      </AuthShell>
    </div>
  );
}
