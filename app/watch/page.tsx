import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchScreen } from "@/components/watch-screen";
import { getWatchVideo } from "@/lib/catalog";

type WatchPageProps = {
  searchParams: Promise<{ v?: string | string[] }>;
};

export const dynamic = "force-dynamic";

function videoId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const data = await getWatchVideo(videoId((await searchParams).v));
  if (!data) return { title: "CatTube" };
  return {
    title:
      data.video.slug === "piano"
        ? "Tiny Kitten Learns to Play Piano"
        : data.video.title,
    description: `${data.video.title} by ${data.video.channel} on CatTube.`,
  };
}

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const data = await getWatchVideo(videoId((await searchParams).v));
  if (!data) notFound();
  return (
    <WatchScreen
      key={data.video.slug ?? data.video.id}
      video={data.video}
      relatedVideos={data.related}
      comments={data.comments}
    />
  );
}
