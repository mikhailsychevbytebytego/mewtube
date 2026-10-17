import { revalidatePath } from "next/cache";
import {
  copyGeneratedVideo,
  createDirectUpload,
  createThumbnail,
  formatStreamDuration,
  readCopiedVideo,
  readGeneratedVideo,
  saveShelfVideo,
  startGeneratedVideo,
  thumbnailForUpload,
  uploadImageFile,
} from "@/lib/generate-media";
import { assertOwnShelf, requireOwnedChannel } from "@/lib/own-channel";

export const maxDuration = 300;

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function cleanTitle(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 120);
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function refresh(handle: string) {
  revalidatePath("/studio");
  revalidatePath(`/channel/${handle}`);
}

export async function POST(request: Request) {
  const channel = await requireOwnedChannel();
  if (!channel) {
    return Response.json({ error: "Sign in to edit your channel." }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      return Response.json({ thumbnailUrl: await thumbnailFromFile(request) });
    }

    const body = (await request.json().catch(() => null)) as {
      action?: unknown;
      title?: unknown;
      shelfId?: unknown;
      thumbnailUrl?: unknown;
      statusUrl?: unknown;
      responseUrl?: unknown;
      videoUrl?: unknown;
      uid?: unknown;
    } | null;
    const title = cleanTitle(body?.title);
    const shelfId = text(body?.shelfId);
    const thumbnailUrl = text(body?.thumbnailUrl);

    if (body?.action === "thumbnail") {
      if (title.length < 3) {
        return Response.json({ error: "Enter a title of at least 3 characters." }, { status: 400 });
      }
      return Response.json({ thumbnailUrl: await createThumbnail(title) });
    }

    if (body?.action === "start") {
      const invalid = await rejectShelf(channel.id, shelfId, title);
      if (invalid) return invalid;
      return Response.json(await startGeneratedVideo(title, thumbnailUrl));
    }

    if (body?.action === "video") {
      return Response.json(await readGeneratedVideo(text(body.statusUrl), text(body.responseUrl)));
    }

    if (body?.action === "copy") {
      const invalid = await rejectShelf(channel.id, shelfId, title);
      if (invalid) return invalid;
      if (!thumbnailUrl.startsWith("https://imagedelivery.net/")) {
        return Response.json({ error: "Confirm a generated thumbnail first." }, { status: 400 });
      }
      const copied = await copyGeneratedVideo(title, text(body.videoUrl));
      if (!copied.playbackUrl) return Response.json({ uid: copied.uid });
      const slug = await saveShelfVideo({
        channelId: channel.id,
        shelfId,
        title,
        thumbnail: thumbnailUrl,
        playbackUrl: copied.playbackUrl,
        duration: "0:15",
      });
      refresh(channel.slug);
      return Response.json({ slug });
    }

    if (body?.action === "finish") {
      const invalid = await rejectShelf(channel.id, shelfId, title);
      if (invalid) return invalid;
      if (!thumbnailUrl.startsWith("https://imagedelivery.net/")) {
        return Response.json({ error: "Confirm a generated thumbnail first." }, { status: 400 });
      }
      const status = await readCopiedVideo(text(body.uid));
      if (status.pending) return Response.json(status);
      const slug = await saveShelfVideo({
        channelId: channel.id,
        shelfId,
        title,
        thumbnail: thumbnailUrl,
        playbackUrl: status.playbackUrl,
        duration: "0:15",
      });
      refresh(channel.slug);
      return Response.json({ slug });
    }

    if (body?.action === "upload-start") {
      const invalid = await rejectShelf(channel.id, shelfId, title);
      if (invalid) return invalid;
      return Response.json(await createDirectUpload(title));
    }

    if (body?.action === "upload-finish") {
      const invalid = await rejectShelf(channel.id, shelfId, title);
      if (invalid) return invalid;
      const status = await readCopiedVideo(text(body.uid));
      if (status.pending) return Response.json({ pending: true });
      const thumbnail = await thumbnailForUpload(title, thumbnailUrl, status.thumbnail);
      const slug = await saveShelfVideo({
        channelId: channel.id,
        shelfId,
        title,
        thumbnail,
        playbackUrl: status.playbackUrl,
        duration: formatStreamDuration(status.duration),
      });
      refresh(channel.slug);
      return Response.json({ slug });
    }

    return Response.json({ error: "Could not add the video." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add the video.";
    return Response.json({ error: message }, { status: 500 });
  }
}

async function rejectShelf(channelId: string, shelfId: string, title: string) {
  if (title.length < 3) {
    return Response.json({ error: "Enter a title of at least 3 characters." }, { status: 400 });
  }
  if (!(await assertOwnShelf(channelId, shelfId))) {
    return Response.json({ error: "Choose a shelf on your channel." }, { status: 400 });
  }
  return null;
}

async function thumbnailFromFile(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Images need to be 8 MB or smaller.");
  if (!imageTypes.has(file.type)) throw new Error("Use a JPEG, PNG, WebP, or GIF image.");
  return uploadImageFile(file);
}
