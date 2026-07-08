/**
 * Answer Engine Optimization (AEO) content — single source of truth for
 * FAQ sections, JSON-LD, and llms.txt. Written in clear, citable prose
 * so AI answer engines can accurately summarize SnipShort.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

/** One-paragraph entity definition — optimized for direct AI citation. */
export const SNIPSHORT_DEFINITION =
  "SnipShort is a web-based URL shortener that turns long links into short, shareable URLs. Users can add custom aliases, password protection, automatic expiry dates, branded QR codes, and track clicks through a personal dashboard. SnipShort works in the browser with no software to install.";

export const SNIPSHORT_CAPABILITIES = [
  "Shorten any HTTP or HTTPS URL into a compact link",
  "Choose a custom alias (e.g. snipshort.com/r/my-campaign)",
  "Set links to expire after 1, 7, or 30 days, or never",
  "Password-protect links so visitors must enter a passphrase",
  "Generate a branded QR code for every shortened link",
  "Track total clicks and view per-link analytics",
  "Manage all links from a personal dashboard after sign-up",
  "Redirects are cached at the edge for sub-10ms response times",
] as const;

export const HOW_TO_SHORTEN: HowToStep[] = [
  {
    name: "Paste your long URL",
    text: "Open SnipShort and paste any valid HTTP or HTTPS URL into the shortening field on the homepage.",
  },
  {
    name: "Customize your link (optional)",
    text: "Expand Advanced options to set a custom alias, choose an expiry (1, 7, or 30 days), or enable password protection.",
  },
  {
    name: "Click Shorten",
    text: "Press the Shorten button. SnipShort instantly creates a short link and a downloadable QR code.",
  },
  {
    name: "Share and track",
    text: "Copy the short URL or QR code and share it anywhere. View click counts on the stats page or in your dashboard.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is SnipShort?",
    answer:
      "SnipShort is a URL shortening service that converts long web addresses into short, easy-to-share links. It also provides QR code generation, password protection, link expiry, custom aliases, and click analytics.",
  },
  {
    question: "How do I shorten a URL with SnipShort?",
    answer:
      "Paste your URL into the field on the SnipShort homepage, optionally customize the alias or expiry in Advanced options, then click Shorten. Your short link and QR code appear instantly.",
  },
  {
    question: "Can I create a custom short link?",
    answer:
      "Yes. In Advanced options, enter a custom alias after 'snipshort/'. Your link becomes snipshort.com/r/your-alias instead of a random code, as long as the alias is not already taken.",
  },
  {
    question: "Can I password-protect a short link?",
    answer:
      "Yes. Enable Password protect in Advanced options and set a passphrase of at least 4 characters. Visitors are prompted to enter the password before being redirected to the destination URL.",
  },
  {
    question: "Do SnipShort links expire?",
    answer:
      "Links can be set to expire after 1 day, 7 days, or 30 days. You can also choose 'Never' to keep a link active indefinitely. Expired links show an expiry page instead of redirecting.",
  },
  {
    question: "Does SnipShort track link clicks?",
    answer:
      "Yes. Every redirect increments a click counter. You can view total clicks on the public stats page for any link, or see all your links and analytics in the dashboard after creating an account.",
  },
  {
    question: "Does SnipShort generate QR codes?",
    answer:
      "Yes. Every shortened link automatically gets a branded QR code. You can view it on the result card after shortening and download it as a PNG, or access it later from your dashboard.",
  },
  {
    question: "Do I need an account to shorten links?",
    answer:
      "No. You can shorten links without signing up. Creating an account lets you save links to a dashboard, manage them, and delete or track them over time.",
  },
  {
    question: "How fast are SnipShort redirects?",
    answer:
      "SnipShort caches redirect destinations at the edge, so most clicks resolve in under 10 milliseconds after the first visit to a link.",
  },
  {
    question: "Is SnipShort secure?",
    answer:
      "SnipShort uses HTTPS for all connections. Password-protected links store only bcrypt-hashed passwords, never plain text. User accounts are managed through Clerk authentication with industry-standard security practices.",
  },
];

/** Contact email surfaced consistently for AI entity graphs. */
export const SUPPORT_EMAIL = "support@snipshort.app";
