"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Phase = "edit" | "thumbnail" | "video";

export function UploadDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("edit");
  const [error, setError] = useState<string | null>(null);

  const busy = phase === "thumbnail" || phase === "video";

  function close() {
    if (busy) return;
    setOpen(false);
    setError(null);
  }

  function resetPreview() {
    setThumbnailUrl(null);
    setError(null);
    setPhase("edit");
  }

  async function generateThumbnail() {
    setError(null);
    setPhase("thumbnail");
    const response = await fetch("/api/generate/thumbnail", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const payload = (await response.json().catch(() => null)) as {
      thumbnailUrl?: string;
      error?: string;
    } | null;
    if (!response.ok || !payload?.thumbnailUrl) {
      setPhase("edit");
      setError(payload?.error || "Could not create a thumbnail.");
      return;
    }
    setThumbnailUrl(payload.thumbnailUrl);
    setPhase("edit");
  }

  async function confirmVideo() {
    if (!thumbnailUrl) return;
    setError(null);
    setPhase("video");
    const response = await fetch("/api/generate/video", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, thumbnailUrl }),
    });
    const payload = (await response.json().catch(() => null)) as {
      slug?: string;
      error?: string;
    } | null;
    if (!response.ok || !payload?.slug) {
      setPhase("edit");
      setError(payload?.error || "Could not create the video.");
      return;
    }
    setOpen(false);
    setTitle("");
    setThumbnailUrl(null);
    setPhase("edit");
    router.push(`/watch?v=${payload.slug}`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-3 py-2 text-sm font-medium text-background hover:opacity-90"
      >
        Upload
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-title"
            className="w-full max-w-[560px] rounded-2xl bg-background p-5 text-ink shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="upload-title" className="text-lg font-medium">
                  Generate a cat video
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Write a title, make a thumbnail, then confirm it to create a 15 second video.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={busy}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full text-xl leading-none hover:bg-chip disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <label className="mt-4 grid gap-1 text-sm">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={busy}
                placeholder="Kitten discovers a cardboard spaceship"
                className="h-10 rounded-xl border border-field-border bg-field px-3 outline-none focus:border-[#1c62b9] disabled:opacity-60"
              />
            </label>

            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Generated thumbnail"
                className="mt-4 aspect-video w-full rounded-xl bg-chip object-cover"
              />
            ) : null}

            {error ? <p className="mt-3 text-sm text-[#c00]">{error}</p> : null}
            {phase === "thumbnail" ? (
              <p className="mt-3 text-sm text-muted">Making a thumbnail...</p>
            ) : null}
            {phase === "video" ? (
              <p className="mt-3 text-sm text-muted">
                Creating the video and uploading it. This can take a few minutes.
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {thumbnailUrl && !busy ? (
                <button
                  type="button"
                  onClick={resetPreview}
                  className="rounded-full px-4 py-2 text-sm font-medium hover:bg-chip"
                >
                  Start over
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void generateThumbnail()}
                disabled={busy || title.trim().length < 3}
                className="rounded-full border border-field-border px-4 py-2 text-sm font-medium hover:bg-chip disabled:opacity-50"
              >
                {thumbnailUrl ? "Regenerate" : "Generate"}
              </button>
              <button
                type="button"
                onClick={() => void confirmVideo()}
                disabled={busy || !thumbnailUrl}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
