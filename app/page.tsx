import { HomeShell } from "@/components/home-shell";
import { getHomeVideos } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const videos = await getHomeVideos();
  return <HomeShell videos={videos} />;
}
