import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelLibrary } from "@/components/channel-library";
import { ChannelScreen } from "@/components/channel-screen";
import { OwnedChannel } from "@/components/owned-channel";
import { getChannelPage } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/require-admin";
import { isSubscribed } from "@/lib/subscriptions";

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
  const subscribed = await isSubscribed(handle);
  if (channel.kind === "owned") {
    const session = await getCurrentSession();
    const { ownerId, ...publicChannel } = channel;
    return (
      <OwnedChannel
        channel={publicChannel}
        isOwner={session?.user.id === ownerId}
        subscribed={subscribed}
      />
    );
  }
  if (channel.kind === "library") {
    return (
      <ChannelLibrary
        name={channel.name}
        handle={channel.handle}
        subscribers={channel.subscribers}
        avatar={channel.avatar}
        innerEar={channel.innerEar}
        videos={channel.videos}
        subscribed={subscribed}
      />
    );
  }
  return <ChannelScreen channel={channel} subscribed={subscribed} />;
}
