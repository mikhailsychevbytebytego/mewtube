import { eq, sql } from "drizzle-orm";
import { videos } from "../drizzle/schema";
import { db } from "../lib/db";

const model = "minimax/h3-max-turbo/image-to-video";

type Row = {
  slug: string;
  title: string;
  thumbnail: string;
  playbackUrl: string | null;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function falVideo(title: string, imageUrl: string) {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set.");
  const headers = {
    Authorization: `Key ${key}`,
    "Content-Type": "application/json",
  };
  const queued = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: title,
      image_url: imageUrl,
      duration: 15,
      resolution: "768P",
      prompt_expansion_mode: "disabled",
    }),
  });
  const ticket = (await queued.json()) as {
    status_url?: string;
    response_url?: string;
    detail?: unknown;
    error?: string;
  };
  if (!queued.ok || !ticket.status_url || !ticket.response_url) {
    const detail = typeof ticket.detail === "string" ? ticket.detail : ticket.error;
    throw new Error(`FAL queue failed (${queued.status})${detail ? `: ${detail}` : ""}.`);
  }

  const deadline = Date.now() + 12 * 60 * 1000;
  let completed = false;
  while (Date.now() < deadline) {
    const statusResponse = await fetch(ticket.status_url, { headers });
    if (!statusResponse.ok) throw new Error(`FAL status failed (${statusResponse.status}).`);
    const status = (await statusResponse.json()) as { status?: string; error?: string };
    if (status.status === "COMPLETED") {
      completed = true;
      break;
    }
    if (status.status === "FAILED") throw new Error(status.error || "FAL video generation failed.");
    await sleep(5000);
  }
  if (!completed) throw new Error("FAL video generation timed out.");

  const resultResponse = await fetch(ticket.response_url, { headers });
  if (!resultResponse.ok) throw new Error(`FAL result failed (${resultResponse.status}).`);
  const result = (await resultResponse.json()) as { video?: { url?: string } };
  const url = result.video?.url;
  if (!url) throw new Error("FAL returned no video URL.");
  return url;
}

function iframeUrl(uid: string, hls?: string) {
  if (!hls) return `https://iframe.videodelivery.net/${uid}/iframe`;
  const host = new URL(hls).host;
  return `https://${host}/${uid}/iframe`;
}

async function uploadStream(title: string, sourceUrl: string) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!account || !token) throw new Error("Cloudflare credentials are missing.");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const copied = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/stream/copy`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url: sourceUrl, meta: { name: title } }),
  });
  const payload = (await copied.json()) as {
    success?: boolean;
    errors?: { message?: string }[];
    result?: { uid?: string; readyToStream?: boolean; playback?: { hls?: string } };
  };
  const uid = payload.result?.uid;
  if (!copied.ok || !payload.success || !uid) {
    throw new Error(payload.errors?.[0]?.message || `Cloudflare upload failed (${copied.status}).`);
  }
  if (payload.result?.readyToStream && payload.result.playback?.hls) {
    return iframeUrl(uid, payload.result.playback.hls);
  }

  const deadline = Date.now() + 8 * 60 * 1000;
  while (Date.now() < deadline) {
    await sleep(4000);
    const statusResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/stream/${uid}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const status = (await statusResponse.json()) as {
      result?: {
        readyToStream?: boolean;
        playback?: { hls?: string };
        status?: { state?: string; errorReasonText?: string };
      };
    };
    if (status.result?.status?.state === "error") {
      throw new Error(status.result.status.errorReasonText || "Cloudflare could not process the video.");
    }
    if (status.result?.readyToStream && status.result.playback?.hls) {
      return iframeUrl(uid, status.result.playback.hls);
    }
  }
  throw new Error("Cloudflare Stream processing timed out.");
}

async function makeVideo(row: Row) {
  let lastError = "unknown";
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      console.log(`start ${row.slug}`);
      const source = await falVideo(row.title, row.thumbnail);
      const playbackUrl = await uploadStream(row.title, source);
      await db
        .update(videos)
        .set({ playbackUrl, duration: "0:15" })
        .where(eq(videos.slug, row.slug));
      console.log(`ready ${row.slug}`);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "failed";
      console.error(`retry ${row.slug} (${attempt}): ${lastError}`);
    }
  }
  throw new Error(`${row.slug}: ${lastError}`);
}

async function mapPool(items: Row[], limit: number) {
  const failures: string[] = [];
  let next = 0;
  async function run() {
    while (next < items.length) {
      const row = items[next];
      next += 1;
      try {
        await makeVideo(row);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : "failed");
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return failures;
}

async function main() {
  await db.execute(sql`alter table public.videos add column if not exists playback_url text`);
  const rows = await db
    .select({
      slug: videos.slug,
      title: videos.title,
      thumbnail: videos.thumbnail,
      playbackUrl: videos.playbackUrl,
    })
    .from(videos);
  const pending = rows.filter((row) => !row.playbackUrl);
  console.log(`Generating ${pending.length} of ${rows.length} videos.`);
  if (pending.length === 0) {
    process.exit(0);
  }

  const [first, ...rest] = pending;
  await makeVideo(first);
  const failures = await mapPool(rest, 2);
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("All videos are on Cloudflare Stream.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
