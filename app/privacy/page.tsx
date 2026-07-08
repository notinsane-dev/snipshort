import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { WebPageJsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Learn how SnipShort collects, uses, and protects your data when you shorten links and use our analytics dashboard.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <WebPageJsonLd
        title="Privacy Policy — SnipShort"
        description="SnipShort privacy policy covering data collection, usage, cookies, and your rights."
        path="/privacy"
      />
      <LegalLayout
      title="Privacy Policy"
      updated="July 8, 2026"
      intro="This policy explains what information SnipShort collects, why we collect it, and how it's handled when you use our link shortening service."
      sections={[
        {
          heading: "Information we collect",
          paragraphs: [
            "When you create an account, we collect basic profile information such as your email address through our authentication provider.",
            "When you shorten a link, we store the destination URL, the generated or custom short code, an optional title, expiry date, and — if you enable password protection — a securely hashed version of your password. We never store passwords in plain text.",
            "We also record usage data for each short link, including the number of clicks, timestamps of redirects, and the last time a link was accessed, so we can power your analytics dashboard.",
          ],
        },
        {
          heading: "How we use your information",
          list: [
            "To create and operate your account and short links",
            "To redirect visitors from short links to their destinations",
            "To generate click analytics and usage statistics for your dashboard",
            "To detect, prevent, and investigate abuse, spam, or malicious links",
            "To maintain, secure, and improve the reliability of the service",
          ],
        },
        {
          heading: "Cookies and sessions",
          paragraphs: [
            "We use essential cookies and local storage to keep you signed in and to remember your preferences. We do not use third-party advertising trackers.",
          ],
        },
        {
          heading: "Third-party services",
          paragraphs: [
            "We rely on trusted infrastructure providers to authenticate users, store data, and cache redirects for speed. These providers process data on our behalf under their own security and privacy commitments, and only to the extent necessary to operate SnipShort.",
          ],
        },
        {
          heading: "Data retention",
          paragraphs: [
            "Link data is retained until you delete it, its expiry date passes, or your account is closed. Account information is retained for as long as your account remains active.",
          ],
        },
        {
          heading: "Your rights and choices",
          list: [
            "View, edit, or delete any link from your dashboard at any time",
            "Request a copy of the personal data associated with your account",
            "Request deletion of your account and associated data",
          ],
        },
        {
          heading: "Security",
          paragraphs: [
            "We apply industry-standard safeguards, including hashed passwords and encrypted connections, to protect your data. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
          ],
        },
        {
          heading: "Children's privacy",
          paragraphs: [
            "SnipShort is not directed at children under 13, and we do not knowingly collect personal information from children.",
          ],
        },
        {
          heading: "Changes to this policy",
          paragraphs: [
            "We may update this policy from time to time. Material changes will be reflected by an updated \"last updated\" date at the top of this page.",
          ],
        },
      ]}
    />
    </>
  );
}
