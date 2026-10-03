"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { channels, comments, users, videos } from "@/drizzle/schema";
import type { AdminType } from "@/lib/admin";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

type FormState = { error: string };

class FormError extends Error {}

function required(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new FormError(`${label} is required.`);
  return value;
}

function optional(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function lines(formData: FormData, key: string) {
  return String(formData.get(key) ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function commaList(formData: FormData, key: string) {
  return String(formData.get(key) ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function wholeNumber(
  formData: FormData,
  key: string,
  label: string,
  fallback: number | null,
) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new FormError(`${label} must be a whole number.`);
  }
  return value;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function slugValue(formData: FormData, fallbackName: string) {
  const typed = String(formData.get("slug") ?? "").trim();
  const slug =
    typed ||
    fallbackName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  if (!slug) throw new FormError("Slug is required.");
  if (!/^[a-z0-9_-]+$/.test(slug)) {
    throw new FormError("Slug can use letters, numbers, hyphens, and underscores.");
  }
  return slug;
}

function existingId(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new FormError("That record is missing its id.");
  return id;
}

function readCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  if ("cause" in error) return readCode(error.cause);
  return undefined;
}

function failure(error: unknown): FormState {
  if (error instanceof FormError) return { error: error.message };
  const code = readCode(error);
  if (code === "23505") return { error: "A record with that id already exists." };
  if (code === "23503") {
    return {
      error: "That choice does not exist, or other records still use this one.",
    };
  }
  if (code === "22P02") return { error: "A number field is not a whole number." };
  return { error: "Could not save that change." };
}

function refresh(type: AdminType): never {
  revalidatePath("/", "layout");
  redirect(`/admin?type=${type}`);
}

async function adjustCommentCount(
  videoId: string,
  delta: number,
  tx: Pick<typeof db, "update"> = db,
) {
  await tx
    .update(videos)
    .set({
      commentCount: sql`greatest(${videos.commentCount} + ${delta}, 0)`,
    })
    .where(eq(videos.id, videoId));
}

export async function saveUser(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    const mode = String(formData.get("mode") ?? "create");
    const name = required(formData, "name", "Name");
    const row = {
      slug: slugValue(formData, name),
      name,
      avatar: required(formData, "avatar", "Avatar color"),
      innerEar: optional(formData, "innerEar"),
    };
    if (mode === "create") await db.insert(users).values(row);
    else await db.update(users).set(row).where(eq(users.id, existingId(formData)));
  } catch (error) {
    return failure(error);
  }
  refresh("users");
}

export async function deleteUser(id: string, _formData: FormData) {
  await requireAdmin();
  try {
    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    if (readCode(error) === "23503") {
      redirect("/admin?type=users&error=referenced");
    }
    redirect("/admin?type=users&error=failed");
  }
  refresh("users");
}

export async function saveChannel(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  try {
    const mode = String(formData.get("mode") ?? "create");
    const name = required(formData, "name", "Name");
    const row = {
      slug: slugValue(formData, name),
      name,
      subscribers: optional(formData, "subscribers"),
      videoCount: wholeNumber(formData, "videoCount", "Video count", null),
      avatarColor: required(formData, "avatarColor", "Avatar color"),
      innerEar: optional(formData, "innerEar"),
      avatarImage: optional(formData, "avatarImage"),
      bannerImage: optional(formData, "bannerImage"),
      creatorImage: optional(formData, "creatorImage"),
      bio: lines(formData, "bio"),
      bioMore: optional(formData, "bioMore"),
      hasPage: checked(formData, "hasPage"),
    };
    if (mode === "create") await db.insert(channels).values(row);
    else await db.update(channels).set(row).where(eq(channels.id, existingId(formData)));
  } catch (error) {
    return failure(error);
  }
  refresh("channels");
}

export async function deleteChannel(id: string, _formData: FormData) {
  await requireAdmin();
  try {
    await db.delete(channels).where(eq(channels.id, id));
  } catch (error) {
    if (readCode(error) === "23503") {
      redirect("/admin?type=channels&error=referenced");
    }
    redirect("/admin?type=channels&error=failed");
  }
  refresh("channels");
}

export async function saveVideo(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    const mode = String(formData.get("mode") ?? "create");
    const section = optional(formData, "channelSection");
    if (section && section !== "for-you" && section !== "shelf") {
      throw new FormError("Channel section must be For you, Shelf, or empty.");
    }
    const title = required(formData, "title", "Title");
    const row = {
      slug: slugValue(formData, title),
      channelId: required(formData, "channelId", "Channel"),
      title,
      subtitle: optional(formData, "subtitle"),
      description: optional(formData, "description"),
      paragraphs: lines(formData, "paragraphs"),
      descriptionMore: optional(formData, "descriptionMore"),
      views: optional(formData, "views"),
      uploaded: optional(formData, "uploaded"),
      duration: required(formData, "duration", "Duration"),
      thumbnail: required(formData, "thumbnail", "Thumbnail"),
      poster: optional(formData, "poster"),
      featuredImage: optional(formData, "featuredImage"),
      overlay: lines(formData, "overlay"),
      categories: commaList(formData, "categories"),
      likes: optional(formData, "likes"),
      hashtags: commaList(formData, "hashtags"),
      commentCount: wholeNumber(formData, "commentCount", "Comment count", 0) ?? 0,
      showOnHome: checked(formData, "showOnHome"),
      featured: checked(formData, "featured"),
      channelSection: section,
      homeOrder: wholeNumber(formData, "homeOrder", "Home order", 0) ?? 0,
      relatedOrder: wholeNumber(formData, "relatedOrder", "Related order", 0) ?? 0,
      sectionOrder: wholeNumber(formData, "sectionOrder", "Section order", 0) ?? 0,
    };
    if (mode === "create") await db.insert(videos).values(row);
    else await db.update(videos).set(row).where(eq(videos.id, existingId(formData)));
  } catch (error) {
    return failure(error);
  }
  refresh("videos");
}

export async function deleteVideo(id: string, _formData: FormData) {
  await requireAdmin();
  try {
    await db.delete(videos).where(eq(videos.id, id));
  } catch (error) {
    if (readCode(error) === "23503") {
      redirect("/admin?type=videos&error=referenced");
    }
    redirect("/admin?type=videos&error=failed");
  }
  refresh("videos");
}

export async function saveComment(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  try {
    const mode = String(formData.get("mode") ?? "create");
    const id = mode === "create" ? crypto.randomUUID() : existingId(formData);
    const row = {
      id,
      videoId: required(formData, "videoId", "Video"),
      userId: required(formData, "userId", "User"),
      body: required(formData, "body", "Comment"),
      posted: required(formData, "posted", "Posted"),
      likes: required(formData, "likes", "Likes"),
      sortOrder: wholeNumber(formData, "sortOrder", "Sort order", 0) ?? 0,
    };

    await db.transaction(async (tx) => {
      if (mode === "create") {
        await tx.insert(comments).values(row);
        await adjustCommentCount(row.videoId, 1, tx);
        return;
      }
      const [existing] = await tx
        .select({ videoId: comments.videoId })
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1);
      if (!existing) throw new FormError("That comment no longer exists.");
      await tx.update(comments).set(row).where(eq(comments.id, id));
      if (existing.videoId !== row.videoId) {
        await adjustCommentCount(existing.videoId, -1, tx);
        await adjustCommentCount(row.videoId, 1, tx);
      }
    });
  } catch (error) {
    return failure(error);
  }
  refresh("comments");
}

export async function deleteComment(id: string, _formData: FormData) {
  await requireAdmin();
  try {
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ videoId: comments.videoId })
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1);
      if (!existing) return;
      await tx.delete(comments).where(eq(comments.id, id));
      await adjustCommentCount(existing.videoId, -1, tx);
    });
  } catch {
    redirect("/admin?type=comments&error=failed");
  }
  refresh("comments");
}

