import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { WebPageJsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "Read the SnipShort terms of service covering acceptable use, link ownership, availability, and liability.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <WebPageJsonLd
        title="Terms of Service — SnipShort"
        description="SnipShort terms of service for using our link shortening and analytics platform."
        path="/terms"
      />
      <LegalLayout
      title="Terms of Service"
      updated="July 8, 2026"
      intro="These terms govern your access to and use of SnipShort. By creating a short link or an account, you agree to the terms below."
      sections={[
        {
          heading: "Acceptance of terms",
          paragraphs: [
            "By accessing or using SnipShort, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.",
          ],
        },
        {
          heading: "Description of service",
          paragraphs: [
            "SnipShort lets you shorten long URLs into compact links, optionally protect them with a password or expiry date, and track click analytics through a dashboard.",
          ],
        },
        {
          heading: "Accounts",
          paragraphs: [
            "Some features, such as the dashboard and saved link history, require an account. You're responsible for keeping your account credentials secure and for all activity under your account.",
          ],
        },
        {
          heading: "Acceptable use",
          paragraphs: [
            "You agree not to use SnipShort to create or share links that:",
          ],
          list: [
            "Point to malware, phishing pages, or other malicious content",
            "Facilitate spam, fraud, or deceptive practices",
            "Infringe on intellectual property or violate any applicable law",
            "Contain or link to illegal, abusive, or harmful content",
          ],
        },
        {
          heading: "Link ownership and responsibility",
          paragraphs: [
            "You are solely responsible for the destination content of any link you shorten. SnipShort does not review link destinations in advance and may disable any link found to violate these terms without prior notice.",
          ],
        },
        {
          heading: "Service availability",
          paragraphs: [
            "We work to keep SnipShort fast and reliable, but we do not guarantee uninterrupted availability. Features, limits, or the service itself may change or be discontinued at any time.",
          ],
        },
        {
          heading: "Termination",
          paragraphs: [
            "We may suspend or terminate access to the service, and remove links, for accounts that violate these terms or that we reasonably believe pose a risk to other users.",
          ],
        },
        {
          heading: "Disclaimer of warranties",
          paragraphs: [
            "SnipShort is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including fitness for a particular purpose or non-infringement.",
          ],
        },
        {
          heading: "Limitation of liability",
          paragraphs: [
            "To the fullest extent permitted by law, SnipShort and its operators are not liable for any indirect, incidental, or consequential damages arising from your use of the service, including damages caused by third-party link destinations.",
          ],
        },
        {
          heading: "Changes to these terms",
          paragraphs: [
            "We may revise these terms from time to time. Continued use of SnipShort after changes take effect constitutes acceptance of the updated terms.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "If you have questions about these terms, reach out using the contact details below.",
          ],
        },
      ]}
    />
    </>
  );
}
