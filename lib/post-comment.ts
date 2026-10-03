"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { comments, users, videos } from "@/drizzle/schema";
import { db } from "@/lib/db";
import type { WatchComment } from "@/lib/watch";

export async function postComment(videoId: string, body: string): Promise<WatchComment> {
  const text = body.trim();
  if (!text) {
    throw new Error("Comment is empty");
  }

  const id = crypto.randomUUID();
  const [viewer] = await db.select().from(users).where(eq(users.slug, "you")).limit(1);
  if (!viewer) {
    throw new Error("Account user is missing");
  }

  const [next] = await db.execute<{ next: number }>(
    sql`select coalesce(max(sort_order), -1) + 1 as next from comments where video_id = ${videoId}`,
  );

  await db.insert(comments).values({
    id,
    videoId,
    userId: viewer.id,
    body: text,
    posted: "Just now",
    likes: "0",
    sortOrder: Number(next?.next ?? 0),
  });
  await db
    .update(videos)
    .set({ commentCount: sql`${videos.commentCount} + 1` })
    .where(eq(videos.id, videoId));

  revalidatePath("/watch");

  return {
    id,
    author: viewer.name,
    avatar: viewer.avatar,
    innerEar: viewer.innerEar ?? "#f3c2c8",
    posted: "Just now",
    text,
    likes: "0",
  };
}
