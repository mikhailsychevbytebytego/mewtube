import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelStudio } from "@/components/channel-studio";
import { getChannelPage } from "@/lib/catalog";
import { ensureOwnChannel } from "@/lib/own-channel";
import { requireUser } from "@/lib/require-admin";

export const metadata: Metadata = {
  title: "Your channel - CatTube",
};

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const session = await requireUser("/studio");
  const row = await ensureOwnChannel({ id: session.user.id, name: session.user.name });
  const channel = await getChannelPage(row.slug);
  if (!channel || channel.kind !== "owned") notFound();

  return (
    <ChannelStudio
      channel={{
        name: channel.name,
        handle: channel.handle,
        subscribersLabel: channel.subscribersLabel,
        bannerImage: channel.bannerImage,
        avatarColor: channel.avatarColor,
        innerEar: channel.innerEar,
        shelves: channel.shelves,
      }}
    />
  );
}
