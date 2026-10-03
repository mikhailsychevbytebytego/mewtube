import { asc, eq } from "drizzle-orm";
import { channels, comments, users, videos } from "@/drizzle/schema";
import { db } from "@/lib/db";

export const adminTypes = ["users", "channels", "videos", "comments"] as const;

export type AdminType = (typeof adminTypes)[number];

export function isAdminType(value: string | undefined): value is AdminType {
  return adminTypes.includes(value as AdminType);
}

export function adminError(type: string | undefined, code: string | undefined) {
  if (!isAdminType(type) || !code) return null;
  if (code === "referenced") {
    return "Delete the records that still use this one first.";
  }
  if (code === "failed") return "Could not delete that record.";
  return null;
}

export async function getAdminData() {
  const [userRows, channelRows, videoRows, commentRows] = await Promise.all([
    db.select().from(users).orderBy(asc(users.name)),
    db.select().from(channels).orderBy(asc(channels.name)),
    db.select().from(videos).orderBy(asc(videos.homeOrder), asc(videos.title)),
    db
      .select({
        id: comments.id,
        videoId: comments.videoId,
        userId: comments.userId,
        body: comments.body,
        posted: comments.posted,
        likes: comments.likes,
        sortOrder: comments.sortOrder,
        author: users.name,
        videoTitle: videos.title,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .innerJoin(videos, eq(comments.videoId, videos.id))
      .orderBy(asc(comments.sortOrder), asc(comments.posted)),
  ]);

  return { userRows, channelRows, videoRows, commentRows };
}
