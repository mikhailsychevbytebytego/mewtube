import { eq, sql } from "drizzle-orm";
import { channels, videos } from "@/drizzle/schema";
import { db } from "@/lib/db";

const imageModel = "openai/gpt-image-2";
const videoModel = "minimax/h3-max-turbo/image-to-video";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function falHeaders() {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("Image generation is not configured.");
  return {
    Authorization: `Key ${key}`,
    "Content-Type": "application/json",
  };
}

function cloudflareAuth() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!account || !token) throw new Error("Video upload is not configured.");
  return { account, token };
}

async function falResult<T>(model: string, body: unknown, timeoutMs: number) {
  const headers = falHeaders();
  const queued = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const ticket = (await queued.json()) as {
    status_url?: string;
    response_url?: string;
    error?: string;
    detail?: unknown;
  };
  if (!queued.ok || !ticket.status_url || !ticket.response_url) {
    const detail = typeof ticket.detail === "string" ? ticket.detail : ticket.error;
    throw new Error(detail || "Could not start generation.");
  }

  const deadline = Date.now() + timeoutMs;
  let completed = false;
  while (Date.now() < deadline) {
    const statusResponse = await fetch(ticket.status_url, { headers });
    if (!statusResponse.ok) throw new Error("Generation status could not be checked.");
    const status = (await statusResponse.json()) as { status?: string; error?: string };
    if (status.status === "COMPLETED") {
      completed = true;
      break;
    }
    if (status.status === "FAILED") throw new Error(status.error || "Generation failed.");
    await sleep(3000);
  }
  if (!completed) throw new Error("Generation timed out.");

  const resultResponse = await fetch(ticket.response_url, { headers });
  if (!resultResponse.ok) throw new Error("Generation finished without a result.");
  return (await resultResponse.json()) as T;
}

export function thumbnailPrompt(title: string) {
  return [
    "Photorealistic 16:9 YouTube thumbnail of a real cat.",
    `Scene: ${title}.`,
    "One clear subject, bright natural light, no text, no letters, no logo, no watermark.",
  ].join(" ");
}

export async function createThumbnail(title: string) {
  const result = await falResult<{ images?: { url?: string }[] }>(
    imageModel,
    {
      prompt: thumbnailPrompt(title),
      image_size: { width: 1280, height: 720 },
      quality: "low",
      num_images: 1,
      output_format: "jpeg",
    },
    180_000,
  );
  const source = result.images?.[0]?.url;
  if (!source) throw new Error("No thumbnail was returned.");
  return uploadImage(source);
}

async function uploadImage(sourceUrl: string) {
  const { account, token } = cloudflareAuth();
  const id = `thumb-${crypto.randomUUID()}`;
  const form = new FormData();
  form.set("url", sourceUrl);
  form.set("id", id);
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
  );
  const payload = (await response.json()) as {
    success?: boolean;
    errors?: { message?: string }[];
    result?: { variants?: string[] };
  };
  const variant = payload.result?.variants?.find((item) => item.endsWith("/public")) ?? payload.result?.variants?.[0];
  if (!response.ok || !payload.success || !variant) {
    throw new Error(payload.errors?.[0]?.message || "Could not store the thumbnail.");
  }
  return variant;
}

function iframeUrl(uid: string, hls?: string) {
  if (!hls) return `https://iframe.videodelivery.net/${uid}/iframe`;
  return `https://${new URL(hls).host}/${uid}/iframe`;
}

function falQueueUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Unexpected generation status.");
  }
  if (url.protocol !== "https:" || url.hostname !== "queue.fal.run") {
    throw new Error("Unexpected generation status.");
  }
  return url.toString();
}

function httpsUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Unexpected video address.");
  }
  if (url.protocol !== "https:") throw new Error("Unexpected video address.");
  return url.toString();
}

async function queueFal(model: string, body: unknown) {
  const headers = falHeaders();
  const queued = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const ticket = (await queued.json()) as {
    status_url?: string;
    response_url?: string;
    error?: string;
    detail?: unknown;
  };
  if (!queued.ok || !ticket.status_url || !ticket.response_url) {
    const detail = typeof ticket.detail === "string" ? ticket.detail : ticket.error;
    throw new Error(detail || "Could not start generation.");
  }
  return {
    statusUrl: falQueueUrl(ticket.status_url),
    responseUrl: falQueueUrl(ticket.response_url),
  };
}

export async function startGeneratedVideo(title: string, thumbnail: string) {
  if (!thumbnail.startsWith("https://imagedelivery.net/")) {
    throw new Error("Confirm a generated thumbnail first.");
  }
  return queueFal(videoModel, {
    prompt: title,
    image_url: thumbnail,
    duration: 15,
    resolution: "768P",
    prompt_expansion_mode: "disabled",
  });
}

export async function readGeneratedVideo(statusUrl: string, responseUrl: string) {
  const headers = falHeaders();
  const statusResponse = await fetch(falQueueUrl(statusUrl), { headers });
  if (!statusResponse.ok) throw new Error("Generation status could not be checked.");
  const status = (await statusResponse.json()) as { status?: string; error?: string };
  if (status.status === "FAILED") throw new Error(status.error || "Generation failed.");
  if (status.status !== "COMPLETED") return { pending: true as const };

  const resultResponse = await fetch(falQueueUrl(responseUrl), { headers });
  if (!resultResponse.ok) throw new Error("Generation finished without a result.");
  const result = (await resultResponse.json()) as { video?: { url?: string } };
  const videoUrl = result.video?.url;
  if (!videoUrl) throw new Error("No video was returned.");
  return { pending: false as const, videoUrl: httpsUrl(videoUrl) };
}

type StreamStatus = {
  result?: {
    uid?: string;
    readyToStream?: boolean;
    playback?: { hls?: string };
    status?: { state?: string; errorReasonText?: string };
  };
};

function playbackFrom(status: StreamStatus) {
  const uid = status.result?.uid;
  if (status.result?.status?.state === "error") {
    throw new Error(status.result.status.errorReasonText || "The video could not be processed.");
  }
  if (uid && status.result?.readyToStream && status.result.playback?.hls) {
    return iframeUrl(uid, status.result.playback.hls);
  }
  return null;
}

export async function copyGeneratedVideo(title: string, sourceUrl: string) {
  const { account, token } = cloudflareAuth();
  const copied = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/stream/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: httpsUrl(sourceUrl), meta: { name: title } }),
    },
  );
  const payload = (await copied.json()) as StreamStatus & {
    success?: boolean;
    errors?: { message?: string }[];
  };
  const uid = payload.result?.uid;
  if (!copied.ok || !payload.success || !uid) {
    throw new Error(payload.errors?.[0]?.message || "Could not upload the video.");
  }
  const playbackUrl = playbackFrom(payload);
  return playbackUrl ? { uid, playbackUrl } : { uid };
}

export async function readCopiedVideo(uid: string) {
  if (!/^[A-Za-z0-9]{16,64}$/.test(uid)) throw new Error("Unexpected video id.");
  const { account, token } = cloudflareAuth();
  const statusResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/stream/${uid}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const status = (await statusResponse.json()) as StreamStatus;
  if (!statusResponse.ok) throw new Error("The video status could not be checked.");
  const playbackUrl = playbackFrom({ ...status, result: { ...status.result, uid } });
  return playbackUrl ? { pending: false as const, playbackUrl } : { pending: true as const };
}

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base || "cat-video";
}

async function uniqueSlug(title: string) {
  const base = slugify(title);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const [existing] = await db
      .select({ id: videos.id })
      .from(videos)
      .where(eq(videos.slug, slug))
      .limit(1);
    if (!existing) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function uploadsChannel() {
  const [existing] = await db
    .select({ id: channels.id })
    .from(channels)
    .where(eq(channels.slug, "uploads"))
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(channels)
    .values({
      slug: "uploads",
      name: "CatTube Uploads",
      subscribers: "1",
      videoCount: 0,
      avatarColor: "#e09a62",
      innerEar: "#f3c2c8",
      bio: ["Freshly generated cat videos."],
      hasPage: false,
    })
    .returning({ id: channels.id });
  if (!created) throw new Error("Could not create the uploads channel.");
  return created.id;
}

export async function saveGeneratedVideo(title: string, thumbnail: string, playbackUrl: string) {
  if (!thumbnail.startsWith("https://imagedelivery.net/")) {
    throw new Error("Confirm a generated thumbnail first.");
  }
  if (!playbackUrl.startsWith("https://")) throw new Error("Unexpected video address.");

  const [existing] = await db
    .select({ slug: videos.slug })
    .from(videos)
    .where(eq(videos.playbackUrl, playbackUrl))
    .limit(1);
  if (existing) return existing.slug;

  const slug = await uniqueSlug(title);
  const channelId = await uploadsChannel();

  await db.insert(videos).values({
    slug,
    channelId,
    title,
    description: title,
    paragraphs: [title],
    views: "0 views",
    uploaded: "Just now",
    duration: "0:15",
    thumbnail,
    playbackUrl,
    overlay: [],
    categories: ["Funny Cats"],
    likes: "0",
    hashtags: ["cats"],
    commentCount: 0,
    showOnHome: true,
    featured: false,
    homeOrder: 0,
    relatedOrder: 0,
    sectionOrder: 0,
  });
  await db
    .update(channels)
    .set({ videoCount: sql`coalesce(${channels.videoCount}, 0) + 1` })
    .where(eq(channels.id, channelId));

  return slug;
}
