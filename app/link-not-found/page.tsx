import { ErrorPage } from "@/components/error-page";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Link not found",
  description: "This short link does not exist or has been removed.",
  path: "/link-not-found",
  noIndex: true,
});

export default function LinkNotFoundPage() {
  return (
    <ErrorPage
      type="link-off"
      code="404"
      title="Link not found"
      description="This short link doesn't exist or has been removed. Double-check the URL."
    />
  );
}
