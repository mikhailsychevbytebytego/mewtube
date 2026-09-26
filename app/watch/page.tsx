import type { Metadata } from "next";
import { WatchScreen } from "@/components/watch-screen";
import { videos } from "@/lib/videos";

type WatchPageProps = {
  searchParams: Promise<{ v?: string | string[] }>;
};

function videoFromParam(value: string | string[] | undefined) {
  const id = Array.isArray(value) ? value[0] : value;
  return videos.find((video) => video.id === id) ?? videos[0];
}

export async function generateMetadata({
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const video = videoFromParam((await searchParams).v);
  return {
    title:
      video.id === "piano" ? "Tiny Kitten Learns to Play Piano" : video.title,
    description: `${video.title} by ${video.channel} on CatTube.`,
  };
}

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const video = videoFromParam((await searchParams).v);
  return <WatchScreen key={video.id} videoId={video.id} />;
}
