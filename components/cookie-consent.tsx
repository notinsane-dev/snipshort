"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "snipshort-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage unavailable (e.g. privacy mode) — skip the banner.
    }
  }, []);

  function respond(choice: "accepted" | "declined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignore — still dismiss the banner for this session.
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm"
        >
          <div className="rounded-2xl border border-white/[0.1] bg-[#f2e6cd] shadow-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-7 w-7 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
                <Cookie className="h-4 w-4 text-brand" />
              </span>
              <span className="text-sm font-semibold text-white/80">We use cookies</span>
            </div>

            <p className="text-sm text-white/50 leading-relaxed mb-4">
              We use essential cookies to keep you signed in and remember your preferences.
              We don&apos;t use third-party ad trackers.{" "}
              <Link href="/privacy" className="text-brand hover:text-brand/80 transition-colors">
                Learn more
              </Link>
              .
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => respond("accepted")}
                className="flex-1 rounded-lg bg-brand text-brand-foreground text-sm font-medium py-2 hover:bg-brand/90 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => respond("declined")}
                className="flex-1 rounded-lg border border-white/[0.1] text-white/50 text-sm font-medium py-2 hover:text-white/80 hover:border-white/20 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
