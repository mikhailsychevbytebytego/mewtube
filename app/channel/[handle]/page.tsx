import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelLibrary } from "@/components/channel-library";
import { ChannelScreen } from "@/components/channel-screen";
import { getChannelPage } from "@/lib/catalog";

type ChannelPageProps = {
  params: Promise<{ handle: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ChannelPageProps): Promise<Metadata> {
  const { handle } = await params;
  const channel = await getChannelPage(handle);
  if (!channel) return { title: "Channel" };
  return {
    title: `${channel.name} - CatTube`,
    description: channel.kind === "designed" ? channel.bio.join(" ") : `${channel.name} on CatTube.`,
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { handle } = await params;
  const channel = await getChannelPage(handle);
  if (!channel) notFound();
  if (channel.kind === "library") {
    return (
      <ChannelLibrary
        name={channel.name}
        subscribers={channel.subscribers}
        avatar={channel.avatar}
        innerEar={channel.innerEar}
        videos={channel.videos}
      />
    );
  }
  return <ChannelScreen channel={channel} />;
}
