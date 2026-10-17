"use server";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { channels, comments, shelves, videos } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { isUuid, requireOwnedChannel } from "@/lib/own-channel";

function cleanLabel(value: string, limit: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, limit);
}

function refresh(handle: string) {
  revalidatePath("/studio");
  revalidatePath(`/channel/${handle}`);
}

export async function renameChannel(name: string) {
  const channel = await requireOwnedChannel();
  if (!channel) return { error: "Sign in to edit your channel." };
  const next = cleanLabel(name, 80);
  if (!next) return { error: "Enter a channel name." };
  await db.update(channels).set({ name: next }).where(eq(channels.id, channel.id));
  refresh(channel.slug);
  return {};
}

export async function addShelf(title: string) {
  const channel = await requireOwnedChannel();
  if (!channel) return { error: "Sign in to edit your channel." };
  const next = cleanLabel(title, 80);
  if (!next) return { error: "Enter a shelf title." };
  const [last] = await db
    .select({ sortOrder: shelves.sortOrder })
    .from(shelves)
    .where(eq(shelves.channelId, channel.id))
    .orderBy(desc(shelves.sortOrder))
    .limit(1);
  await db.insert(shelves).values({
    channelId: channel.id,
    title: next,
    sortOrder: (last?.sortOrder ?? -1) + 1,
  });
  refresh(channel.slug);
  return {};
}

export async function renameShelf(shelfId: string, title: string) {
  const channel = await requireOwnedChannel();
  if (!channel) return { error: "Sign in to edit your channel." };
  if (!isUuid(shelfId)) return { error: "That shelf is not on your channel." };
  const next = cleanLabel(title, 80);
  if (!next) return { error: "Enter a shelf title." };
  const updated = await db
    .update(shelves)
    .set({ title: next })
    .where(and(eq(shelves.id, shelfId), eq(shelves.channelId, channel.id)))
    .returning({ id: shelves.id });
  if (updated.length === 0) return { error: "That shelf is not on your channel." };
  refresh(channel.slug);
  return {};
}

export async function deleteShelf(shelfId: string) {
  const channel = await requireOwnedChannel();
  if (!channel) return { error: "Sign in to edit your channel." };
  if (!isUuid(shelfId)) return { error: "That shelf is not on your channel." };
  const [shelf] = await db
    .select({ id: shelves.id })
    .from(shelves)
    .where(and(eq(shelves.id, shelfId), eq(shelves.channelId, channel.id)))
    .limit(1);
  if (!shelf) return { error: "That shelf is not on your channel." };

  const rows = await db
    .select({ id: videos.id })
    .from(videos)
    .where(and(eq(videos.shelfId, shelfId), eq(videos.channelId, channel.id)));
  const ids = rows.map((row) => row.id);

  await db.transaction(async (tx) => {
    if (ids.length > 0) {
      await tx.delete(comments).where(inArray(comments.videoId, ids));
      await tx.delete(videos).where(inArray(videos.id, ids));
      await tx
        .update(channels)
        .set({
          videoCount: sql`greatest(coalesce(${channels.videoCount}, 0) - ${ids.length}, 0)`,
        })
        .where(eq(channels.id, channel.id));
    }
    await tx.delete(shelves).where(eq(shelves.id, shelfId));
  });
  refresh(channel.slug);
  return {};
}

export async function deleteShelfVideo(videoId: string) {
  const channel = await requireOwnedChannel();
  if (!channel) return { error: "Sign in to edit your channel." };
  if (!isUuid(videoId)) return { error: "That video is not on your channel." };
  const [video] = await db
    .select({ id: videos.id })
    .from(videos)
    .where(and(eq(videos.id, videoId), eq(videos.channelId, channel.id)))
    .limit(1);
  if (!video) return { error: "That video is not on your channel." };

  await db.transaction(async (tx) => {
    await tx.delete(comments).where(eq(comments.videoId, video.id));
    await tx.delete(videos).where(eq(videos.id, video.id));
    await tx
      .update(channels)
      .set({
        videoCount: sql`greatest(coalesce(${channels.videoCount}, 0) - 1, 0)`,
      })
      .where(eq(channels.id, channel.id));
  });
  refresh(channel.slug);
  return {};
}
