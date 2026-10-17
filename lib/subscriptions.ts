import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { channels, subscriptions } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { getVideosForChannels } from "@/lib/catalog";
import { db } from "@/lib/db";
import type { Video } from "@/lib/videos";

export type SubscribedChannel = {
  slug: string;
  name: string;
  avatar: string;
  innerEar: string;
};

async function currentUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user.id ?? null;
}

async function subscribedChannels(userId: string) {
  const rows = await db
    .select({
      id: channels.id,
      slug: channels.slug,
      name: channels.name,
      avatar: channels.avatarColor,
      innerEar: channels.innerEar,
    })
    .from(subscriptions)
    .innerJoin(channels, eq(subscriptions.channelId, channels.id))
    .where(eq(subscriptions.userId, userId))
    .orderBy(asc(channels.name));

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    avatar: row.avatar,
    innerEar: row.innerEar ?? "#f3c2c8",
  }));
}

export async function listSubscriptionChannels(): Promise<SubscribedChannel[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await subscribedChannels(userId);
  return rows.map(({ slug, name, avatar, innerEar }) => ({
    slug,
    name,
    avatar,
    innerEar,
  }));
}

export async function subscriptionFeed(): Promise<{
  signedIn: boolean;
  channels: SubscribedChannel[];
  videos: Video[];
}> {
  const userId = await currentUserId();
  if (!userId) return { signedIn: false, channels: [], videos: [] };
  const rows = await subscribedChannels(userId);
  const videos = await getVideosForChannels(rows.map((row) => row.id));
  return {
    signedIn: true,
    channels: rows.map(({ slug, name, avatar, innerEar }) => ({
      slug,
      name,
      avatar,
      innerEar,
    })),
    videos,
  };
}

export async function isSubscribed(channelSlug: string) {
  const userId = await currentUserId();
  if (!userId) return false;
  const [row] = await db
    .select({ channelId: subscriptions.channelId })
    .from(subscriptions)
    .innerJoin(channels, eq(subscriptions.channelId, channels.id))
    .where(and(eq(subscriptions.userId, userId), eq(channels.slug, channelSlug)))
    .limit(1);
  return Boolean(row);
}

export async function setSubscriptionRecord(channelSlug: string, subscribe: boolean) {
  const userId = await currentUserId();
  if (!userId) return false;
  const [channel] = await db
    .select({ id: channels.id })
    .from(channels)
    .where(eq(channels.slug, channelSlug))
    .limit(1);
  if (!channel) return false;

  if (subscribe) {
    await db
      .insert(subscriptions)
      .values({ userId, channelId: channel.id })
      .onConflictDoNothing();
  } else {
    await db
      .delete(subscriptions)
      .where(
        and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, channel.id)),
      );
  }

  revalidatePath("/subscriptions");
  revalidatePath("/channel/[handle]", "page");
  revalidatePath("/watch");
  return subscribe;
}
