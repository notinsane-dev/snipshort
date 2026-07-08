import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Verify link",
  description: "Enter the password to access this protected short link.",
  noIndex: true,
});

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
