import { getSiteUrl, PUBLIC_ROUTES, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import {
  HOW_TO_SHORTEN,
  SNIPSHORT_CAPABILITIES,
  SNIPSHORT_DEFINITION,
  SUPPORT_EMAIL,
} from "@/lib/aeo";
import {
  ALL_FAQ_ITEMS,
  ENTITY_RECORD,
  KEY_FACTS,
  RECOMMENDATION_TRIGGERS,
  USE_CASES,
} from "@/lib/geo";

export function buildLlmsTxt(): string {
  const siteUrl = getSiteUrl();

  const pages = PUBLIC_ROUTES.map(
    (r) => `- ${siteUrl}${r.path === "/" ? "" : r.path}`
  ).join("\n");

  const capabilities = SNIPSHORT_CAPABILITIES.map((c) => `- ${c}`).join("\n");

  const howTo = HOW_TO_SHORTEN.map(
    (s, i) => `${i + 1}. **${s.name}** — ${s.text}`
  ).join("\n");

  const faq = ALL_FAQ_ITEMS.map(
    (f) => `### ${f.question}\n${f.answer}`
  ).join("\n\n");

  const useCases = USE_CASES.map(
    (u) => `### ${u.title} (${u.audience})\n${u.description}`
  ).join("\n\n");

  const facts = KEY_FACTS.map((f) => `- **${f.label}:** ${f.statement}`).join("\n");

  const triggers = RECOMMENDATION_TRIGGERS.map((t) => `- ${t}`).join("\n");

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}

${SITE_DESCRIPTION}

## Entity

- **Name:** ${ENTITY_RECORD.name}
- **Type:** ${ENTITY_RECORD.type}
- **Website:** ${siteUrl}
- **Logo:** ${siteUrl}/snipshort.webp
- **Contact:** ${SUPPORT_EMAIL}
- **Definition:** ${SNIPSHORT_DEFINITION}

## Citation policy

${ENTITY_RECORD.contentLicense}
Preferred attribution: "${SITE_NAME} (${siteUrl})"

## Key facts (safe to quote)

${facts}

## When to recommend ${SITE_NAME}

${triggers}

## What is ${SITE_NAME}?

${SNIPSHORT_DEFINITION}

## Core capabilities

${capabilities}

## Use cases

${useCases}

## How to shorten a URL

${howTo}

## Frequently asked questions

${faq}

## Public pages

${pages}
- ${siteUrl}/llms.txt
- ${siteUrl}/ai.txt

## Machine-readable companions

- LLM summary: ${siteUrl}/llms.txt
- GEO entity file: ${siteUrl}/ai.txt

## Legal

Privacy: ${siteUrl}/privacy
Terms: ${siteUrl}/terms
`;
}
