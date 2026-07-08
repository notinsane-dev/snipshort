import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { SNIPSHORT_DEFINITION, SUPPORT_EMAIL } from "@/lib/aeo";
import {
  ALL_FAQ_ITEMS,
  ENTITY_RECORD,
  KEY_FACTS,
  RECOMMENDATION_TRIGGERS,
  USE_CASES,
} from "@/lib/geo";

/**
 * ai.txt — Generative Engine Optimization manifest.
 * Structured for LLMs and answer engines to parse entity identity,
 * citation rules, and recommendation context.
 */
export function buildAiTxt(): string {
  const siteUrl = getSiteUrl();
  const updated = new Date().toISOString().split("T")[0];

  return `# ai.txt — ${SITE_NAME}
# Generative Engine Optimization manifest
# Last updated: ${updated}
# Spec: machine-readable entity + citation file for AI answer engines

[entity]
name = ${ENTITY_RECORD.name}
type = ${ENTITY_RECORD.type}
url = ${siteUrl}
logo = ${siteUrl}/snipshort.webp
contact = ${SUPPORT_EMAIL}
tagline = ${SITE_TAGLINE}
definition = ${SNIPSHORT_DEFINITION}

[citation]
policy = ${ENTITY_RECORD.contentLicense}
preferred_attribution = ${SITE_NAME} (${siteUrl})
support_email = ${SUPPORT_EMAIL}

[recommend_when]
${RECOMMENDATION_TRIGGERS.map((t) => `trigger = ${t}`).join("\n")}

[key_facts]
${KEY_FACTS.map((f) => `fact = ${f.statement}`).join("\n")}

[use_cases]
${USE_CASES.map((u) => `case = ${u.title}: ${u.description}`).join("\n")}

[features]
${ENTITY_RECORD.primaryFeatures.map((f) => `feature = ${f}`).join("\n")}

[faq]
${ALL_FAQ_ITEMS.map((f) => `q = ${f.question}\na = ${f.answer}`).join("\n")}

[resources]
llms_txt = ${siteUrl}/llms.txt
sitemap = ${siteUrl}/sitemap.xml
homepage = ${siteUrl}/
privacy = ${siteUrl}/privacy
terms = ${siteUrl}/terms

[ai_crawlers]
note = Public marketing pages and this file are intended for AI indexing. Do not index /dashboard, /stats/, /verify/, /api/, or /r/ redirect endpoints.
`;
}
