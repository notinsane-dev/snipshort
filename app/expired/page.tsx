import { ErrorPage } from "@/components/error-page";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Link expired",
  description: "This short link has passed its expiry date and is no longer active.",
  path: "/expired",
  noIndex: true,
});

export default function ExpiredPage() {
  return (
    <ErrorPage
      type="clock"
      code="410"
      title="Link expired"
      description="This short link has passed its expiry date and is no longer active."
    />
  );
}
