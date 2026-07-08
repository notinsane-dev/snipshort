import {
  HOW_TO_SHORTEN,
  SNIPSHORT_DEFINITION,
  SUPPORT_EMAIL,
} from "@/lib/aeo";
import { ALL_FAQ_ITEMS, KEY_FACTS, USE_CASES } from "@/lib/geo";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export function HomeJsonLd() {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const appId = `${siteUrl}/#application`;

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
    publisher: { "@id": orgId },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#about-snipshort-heading", "#key-facts-heading", "#faq-heading"],
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/snipshort.webp`,
    description: SNIPSHORT_DEFINITION,
    email: SUPPORT_EMAIL,
    knowsAbout: [
      "URL shortening",
      "Link analytics",
      "QR code generation",
      "Password-protected links",
      "Custom URL aliases",
    ],
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${SITE_NAME} URL shortening`,
    provider: { "@id": orgId },
    url: siteUrl,
    description: SNIPSHORT_DEFINITION,
    serviceType: "URL shortening and link analytics",
    areaServed: "Worldwide",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: siteUrl,
    },
  };

  const application = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": appId,
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description: SNIPSHORT_DEFINITION,
    browserRequirements: "Requires a modern web browser with JavaScript enabled.",
    featureList: [
      "URL shortening",
      "Custom aliases",
      "Link expiry",
      "Password protection",
      "QR code generation",
      "Click analytics",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: ALL_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to shorten a URL with SnipShort",
    description:
      "A step-by-step guide to creating a short link with optional customization on SnipShort.",
    totalTime: "PT1M",
    step: HOW_TO_SHORTEN.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${siteUrl}/#how-it-works`,
    })),
  };

  const useCaseList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SnipShort use cases",
    itemListElement: USE_CASES.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      description: `${item.audience}: ${item.description}`,
    })),
  };

  const factList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SnipShort key facts",
    itemListElement: KEY_FACTS.map((fact, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: fact.label,
      description: fact.statement,
    })),
  };

  const definedTerm = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: SITE_NAME,
    description: SNIPSHORT_DEFINITION,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "SnipShort product glossary",
      url: `${siteUrl}/#about-snipshort`,
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      website,
      organization,
      service,
      application,
      faqPage,
      howTo,
      useCaseList,
      factList,
      definedTerm,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const siteUrl = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${siteUrl}${path}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
    },
    inLanguage: "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
