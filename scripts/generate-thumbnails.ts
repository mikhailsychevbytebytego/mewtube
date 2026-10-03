import { eq } from "drizzle-orm";
import { videos } from "../drizzle/schema";
import { db } from "../lib/db";

const model = "openai/gpt-image-2";

type VideoRow = {
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string;
};

type FalImage = { url?: string };

async function falImage(prompt: string) {
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
      prompt,
      image_size: { width: 1280, height: 720 },
      quality: "low",
      num_images: 1,
      output_format: "jpeg",
    }),
  });
  if (!queued.ok) throw new Error(`FAL queue failed (${queued.status}).`);
  const ticket = (await queued.json()) as { status_url?: string; response_url?: string };
  if (!ticket.status_url || !ticket.response_url) throw new Error("FAL queue did not return status URLs.");

  const deadline = Date.now() + 180_000;
  let completed = false;
  while (Date.now() < deadline) {
    const statusResponse = await fetch(ticket.status_url, { headers });
    if (!statusResponse.ok) throw new Error(`FAL status failed (${statusResponse.status}).`);
    const status = (await statusResponse.json()) as { status?: string; error?: string };
    if (status.status === "COMPLETED") {
      completed = true;
      break;
    }
    if (status.status === "FAILED") throw new Error(status.error || "FAL image generation failed.");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  if (!completed) throw new Error("FAL image generation timed out.");

  const resultResponse = await fetch(ticket.response_url, { headers });
  if (!resultResponse.ok) throw new Error(`FAL result failed (${resultResponse.status}).`);
  const result = (await resultResponse.json()) as { images?: FalImage[] };
  const url = result.images?.[0]?.url;
  if (!url) throw new Error("FAL returned no image URL.");
  return url;
}

async function uploadImage(slug: string, sourceUrl: string) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!account || !token) throw new Error("Cloudflare credentials are missing.");
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`;
  const form = new FormData();
  form.set("url", sourceUrl);
  form.set("id", slug);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const payload = (await response.json()) as {
    success?: boolean;
    errors?: { message?: string }[];
    result?: { variants?: string[] };
  };
  if (!payload.success) {
    const existing = await fetch(`${endpoint}/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stored = (await existing.json()) as { success?: boolean; result?: { variants?: string[] } };
    const variant = stored.result?.variants?.[0];
    if (existing.ok && stored.success && variant) return variant;
    throw new Error(payload.errors?.[0]?.message || `Cloudflare upload failed (${response.status}).`);
  }
  const variant = payload.result?.variants?.[0];
  if (!variant) throw new Error("Cloudflare did not return an image URL.");
  return variant;
}

async function mapPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let next = 0;
  async function run() {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await worker(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
}

async function main() {
  const rows = await db
    .select({
      slug: videos.slug,
      title: videos.title,
      description: videos.description,
      thumbnail: videos.thumbnail,
    })
    .from(videos);
  const pending = rows.filter((row) => !row.thumbnail.startsWith("https://imagedelivery.net/"));
  console.log(`Generating ${pending.length} of ${rows.length} thumbnails.`);
  const failures: string[] = [];

  await mapPool(pending, 4, async (row: VideoRow) => {
    const scene = row.description?.replace(/\s+/g, " ").trim();
    const prompt = [
      "Photorealistic 16:9 YouTube thumbnail of a real cat.",
      `Scene: ${row.title}.`,
      scene ? `Details: ${scene}` : "",
      "One clear subject, bright natural light, no text, no letters, no logo, no watermark.",
    ]
      .filter(Boolean)
      .join(" ");
    try {
      let lastError = "unknown";
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const source = await falImage(prompt);
          const url = await uploadImage(row.slug, source);
          await db.update(videos).set({ thumbnail: url }).where(eq(videos.slug, row.slug));
          console.log(`ready ${row.slug}`);
          return;
        } catch (error) {
          lastError = error instanceof Error ? error.message : "failed";
          console.error(`retry ${row.slug} (${attempt}): ${lastError}`);
        }
      }
      failures.push(`${row.slug}: ${lastError}`);
    } catch (error) {
      failures.push(`${row.slug}: ${error instanceof Error ? error.message : "failed"}`);
    }
  });

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("All thumbnails are on Cloudflare.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
