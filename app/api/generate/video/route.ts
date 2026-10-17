import {
  copyGeneratedVideo,
  readCopiedVideo,
  readGeneratedVideo,
  saveGeneratedVideo,
  startGeneratedVideo,
} from "@/lib/generate-media";
import { adminSession } from "@/lib/require-admin";

export const maxDuration = 60;

function cleanTitle(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 120);
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  if (!(await adminSession())) {
    return Response.json({ error: "Sign in as admin to generate videos." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
    title?: unknown;
    thumbnailUrl?: unknown;
    statusUrl?: unknown;
    responseUrl?: unknown;
    videoUrl?: unknown;
    uid?: unknown;
  } | null;
  const title = cleanTitle(body?.title);
  const thumbnailUrl = text(body?.thumbnailUrl);

  try {
    if (body?.action === "start") {
      if (title.length < 3) {
        return Response.json({ error: "Enter a title of at least 3 characters." }, { status: 400 });
      }
      return Response.json(await startGeneratedVideo(title, thumbnailUrl));
    }

    if (body?.action === "video") {
      const status = await readGeneratedVideo(text(body.statusUrl), text(body.responseUrl));
      return Response.json(status);
    }

    if (body?.action === "copy") {
      if (title.length < 3) {
        return Response.json({ error: "Enter a title of at least 3 characters." }, { status: 400 });
      }
      const copied = await copyGeneratedVideo(title, text(body.videoUrl));
      if (!copied.playbackUrl) return Response.json({ uid: copied.uid });
      const slug = await saveGeneratedVideo(title, thumbnailUrl, copied.playbackUrl);
      return Response.json({ slug });
    }

    if (body?.action === "finish") {
      if (title.length < 3) {
        return Response.json({ error: "Enter a title of at least 3 characters." }, { status: 400 });
      }
      const status = await readCopiedVideo(text(body.uid));
      if (status.pending) return Response.json(status);
      const slug = await saveGeneratedVideo(title, thumbnailUrl, status.playbackUrl);
      return Response.json({ slug });
    }

    return Response.json({ error: "Could not create the video." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the video.";
    return Response.json({ error: message }, { status: 500 });
  }
}
