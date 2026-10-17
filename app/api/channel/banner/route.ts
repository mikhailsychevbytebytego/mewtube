import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { channels } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { createBanner, uploadImageFile } from "@/lib/generate-media";
import { requireOwnedChannel } from "@/lib/own-channel";

export const maxDuration = 300;

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

class InputError extends Error {}

function cleanPrompt(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 300);
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
    const bannerImage = contentType.includes("multipart/form-data")
      ? await bannerFromFile(request)
      : await bannerFromPrompt(request);
    await db
      .update(channels)
      .set({ bannerImage })
      .where(eq(channels.id, channel.id));
    refresh(channel.slug);
    return Response.json({ bannerImage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the banner.";
    const status = error instanceof InputError ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}

async function bannerFromFile(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new InputError("Choose an image.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new InputError("Images need to be 8 MB or smaller.");
  }
  if (!imageTypes.has(file.type)) {
    throw new InputError("Use a JPEG, PNG, WebP, or GIF image.");
  }
  return uploadImageFile(file);
}

async function bannerFromPrompt(request: Request) {
  const body = (await request.json().catch(() => null)) as { prompt?: unknown } | null;
  const prompt = cleanPrompt(body?.prompt);
  if (prompt.length < 3) {
    throw new InputError("Describe the banner in at least 3 characters.");
  }
  return createBanner(prompt);
}
