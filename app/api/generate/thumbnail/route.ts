import { adminSession } from "@/lib/require-admin";
import { createThumbnail } from "@/lib/generate-media";

export const maxDuration = 300;

function cleanTitle(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 120);
}

export async function POST(request: Request) {
  if (!(await adminSession())) {
    return Response.json({ error: "Sign in as admin to generate videos." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { title?: unknown } | null;
  const title = cleanTitle(body?.title);
  if (title.length < 3) {
    return Response.json({ error: "Enter a title of at least 3 characters." }, { status: 400 });
  }

  try {
    const thumbnailUrl = await createThumbnail(title);
    return Response.json({ thumbnailUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a thumbnail.";
    return Response.json({ error: message }, { status: 500 });
  }
}
