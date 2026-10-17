import { Suspense } from "react";
import { HomeShell } from "@/components/home-shell";
import { getHomeVideos, searchVideos } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type HomeProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function queryValue(value: string | string[] | undefined) {
  const query = Array.isArray(value) ? value[0] : value;
  return query?.trim() ?? "";
}

export default async function Home({ searchParams }: HomeProps) {
  const query = queryValue((await searchParams).q);
  if (!query) {
    return <HomeShell videos={await getHomeVideos()} />;
  }
  return (
    <Suspense fallback={<HomeShell videos={[]} query={query} pending />}>
      <HomeSearch query={query} />
    </Suspense>
  );
}

async function HomeSearch({ query }: { query: string }) {
  try {
    return <HomeShell videos={await searchVideos(query)} query={query} />;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return <HomeShell videos={[]} query={query} error="Search is unavailable right now." />;
  }
}
