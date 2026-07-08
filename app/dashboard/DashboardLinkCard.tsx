"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, BarChart3, Trash2, Link2, Lock, Clock, QrCode } from "lucide-react";
import { StyledQr, type StyledQrHandle } from "@/components/styled-qr";
import type { Link as LinkRow } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  link: LinkRow;
  baseUrl: string;
  logoSrc: string;
}

export function DashboardLinkCard({ link, baseUrl, logoSrc }: Props) {
  const router = useRouter();
  const shortUrl = `${baseUrl}/r/${link.slug}`;
  const qrRef = useRef<StyledQrHandle>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const isExpired = link.expires_at
    ? new Date(link.expires_at) < new Date()
    : false;

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Link deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group relative rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.035] p-4 flex flex-col transition-colors"
    >
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Icon */}
      <div className="shrink-0 h-9 w-9 rounded-lg border border-white/8 bg-brand/[0.08] flex items-center justify-center">
        <Link2 className="h-4 w-4 text-brand" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono font-medium text-white hover:text-white/70 transition-colors"
          >
            /{link.slug}
          </a>
          {link.title && (
            <span className="text-xs text-white/30 truncate max-w-[180px]">{link.title}</span>
          )}
          {link.is_password_protected && (
            <span className="inline-flex items-center gap-1 text-xs rounded-md border border-white/8 px-1.5 py-0.5 text-white/30">
              <Lock className="h-2.5 w-2.5" /> Protected
            </span>
          )}
          {isExpired && (
            <span className="inline-flex items-center gap-1 text-xs rounded-md border border-red-500/20 bg-red-500/5 px-1.5 py-0.5 text-red-400/70">
              <Clock className="h-2.5 w-2.5" /> Expired
            </span>
          )}
        </div>
        <p className="text-xs text-white/25 truncate max-w-sm">{link.destination_url}</p>
        <div className="flex items-center gap-3 text-xs text-white/20 mt-0.5">
          <span className="font-medium text-white/40">
            {link.clicks.toLocaleString()} {link.clicks === 1 ? "click" : "clicks"}
          </span>
          <span>·</span>
          <span>{new Date(link.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          {link.expires_at && (
            <>
              <span>·</span>
              <span className={isExpired ? "text-red-400/50" : ""}>
                {isExpired ? "Expired " : "Expires "}
                {new Date(link.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            copied
              ? "bg-brand text-brand-foreground"
              : "border border-white/8 text-white/30 hover:text-white hover:border-white/15"
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>

        <button
          onClick={() => setQrOpen((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            qrOpen
              ? "bg-brand text-brand-foreground"
              : "border border-white/8 text-white/30 hover:text-white hover:border-white/15"
          )}
        >
          <QrCode className="h-3 w-3" /> QR
        </button>

        <a
          href={`/stats/${link.slug}`}
          className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-xs font-medium text-white/30 hover:text-white hover:border-white/15 transition-all"
        >
          <BarChart3 className="h-3 w-3" /> Stats
        </a>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-40",
            confirmDelete
              ? "bg-red-500/20 border border-red-500/30 text-red-400"
              : "border border-white/8 text-white/20 hover:text-red-400 hover:border-red-500/20"
          )}
        >
          <Trash2 className="h-3 w-3" />
          {deleting ? "…" : confirmDelete ? "Confirm?" : ""}
        </button>
      </div>
    </div>

    <AnimatePresence>
      {qrOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-4 pt-4 mt-4 border-t border-white/[0.06]">
            <StyledQr data={shortUrl} logoSrc={logoSrc} size={96} ref={qrRef} className="shrink-0" />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white/40">Scan to open this link on any device.</span>
              <button
                onClick={() => qrRef.current?.download(`qr-${link.slug}`)}
                className="text-xs text-brand hover:text-brand/80 transition-colors w-fit"
              >
                Download PNG
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </motion.div>
  );
}
