import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/** Paths that should not be crawled by any bot (including AI crawlers). */
const DISALLOWED = [
  "/api/",
  "/dashboard",
  "/stats/",
  "/verify/",
  "/r/",
  "/link-not-found",
  "/expired",
];

/** AI answer-engine and LLM crawlers — allow public marketing content for AEO. */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Bytespider",
  "cohere-ai",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: ["/", "/llms.txt", "/ai.txt", "/privacy", "/terms", "/sign-in", "/sign-up"],
        disallow: DISALLOWED,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
