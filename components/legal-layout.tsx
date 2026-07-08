import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export function LegalLayout({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(46,32,21,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(46,32,21,0.045)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <header className="relative z-10 border-b border-white/5 px-4 sm:px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to SnipShort
        </Link>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-xs font-medium tracking-[0.3em] text-white/25 uppercase mb-4">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{title}</h1>
        <p className="text-xs text-white/25 mb-12">Last updated {updated}</p>

        {intro && <p className="text-sm text-white/45 leading-relaxed mb-12">{intro}</p>}

        <div className="flex flex-col gap-10">
          {sections.map((s, si) => (
            <section key={s.heading}>
              <h2 className="text-base font-semibold text-white mb-3">
                <span className="text-brand/70 font-mono text-sm mr-2">{String(si + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              <div className="flex flex-col gap-3 pl-[1.85rem]">
                {s.paragraphs?.map((p, i) => (
                  <p key={i} className="text-sm text-white/45 leading-relaxed">{p}</p>
                ))}
                {s.list && (
                  <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-white/15">
                    {s.list.map((item, i) => (
                      <li key={i} className="text-sm text-white/45 leading-relaxed">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-xs text-white/25 leading-relaxed">
          Questions about this policy? Reach out at{" "}
          <a href="mailto:support@snipshort.app" className="text-brand hover:text-brand/80 transition-colors">
            support@snipshort.app
          </a>.
        </div>
      </main>
    </div>
  );
}
