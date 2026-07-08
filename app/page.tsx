import { getPublicStats } from "@/lib/getPublicStats";
import { getLogoSrc } from "@/lib/logo.server";
import { createMetadata } from "@/lib/seo";
import { HomeJsonLd } from "@/components/seo/json-ld";
import HomeClient from "./HomeClient";

export const metadata = createMetadata({ path: "/" });

// Server Component: fetches real, live stats from Supabase before render.
// Revalidate periodically so the homepage numbers stay fresh without
// hitting the database on every single request.
export const revalidate = 60;

export default async function Page() {
  const stats = await getPublicStats();
  const logoSrc = getLogoSrc();
  return (
    <>
      <HomeJsonLd />
      <HomeClient stats={stats} logoSrc={logoSrc} />
    </>
  );
}
