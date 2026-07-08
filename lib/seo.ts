import type { Metadata } from "next";

export const SITE_NAME = "SnipShort";
export const SITE_TAGLINE = "Short links, real analytics";
export const SITE_DESCRIPTION =
  "Shorten any URL in seconds. Add custom aliases, expiry dates, password protection, QR codes, and real-time click analytics — all from one clean dashboard.";

const DEFAULT_KEYWORDS = [
  "url shortener",
  "link shortener",
  "short links",
  "link analytics",
  "qr code generator",
  "password protected links",
  "custom short url",
  "link tracking",
  "SnipShort",
];

/** Resolve the public site origin (no trailing slash). */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

interface CreateMetadataOptions {
  /** Page title without the site name suffix (layout template adds it). */
  title?: string;
  description?: string;
  /** Canonical path, e.g. `/privacy`. */
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  noIndex = false,
  keywords,
}: CreateMetadataOptions = {}): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = path !== undefined ? `${siteUrl}${path}` : undefined;
  const resolvedTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;

  return {
    ...(title ? { title } : {}),
    description,
    keywords: keywords ?? (path === "/" ? DEFAULT_KEYWORDS : undefined),
    ...(canonical && { alternates: { canonical } }),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical ?? siteUrl,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
      images: [
        {
          url: "/snipshort.webp",
          width: 512,
          height: 512,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: resolvedTitle,
      description,
      images: ["/snipshort.webp"],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
    }),
  };
}

/** Public marketing/legal routes included in the sitemap. */
export const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/sign-in", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/sign-up", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];
