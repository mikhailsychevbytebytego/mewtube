import { publishVideo } from "@/lib/generate-media";
import { adminSession } from "@/lib/require-admin";

export const maxDuration = 800;

function cleanTitle(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 120);
}

export async function POST(request: Request) {
  if (!(await adminSession())) {
    return Response.json({ error: "Sign in as admin to generate videos." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    title?: unknown;
    thumbnailUrl?: unknown;
  } | null;
  const title = cleanTitle(body?.title);
  const thumbnailUrl = typeof body?.thumbnailUrl === "string" ? body.thumbnailUrl : "";
  if (title.length < 3) {
    return Response.json({ error: "Enter a title of at least 3 characters." }, { status: 400 });
  }

  try {
    const slug = await publishVideo(title, thumbnailUrl);
    return Response.json({ slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the video.";
    return Response.json({ error: message }, { status: 500 });
  }
}
