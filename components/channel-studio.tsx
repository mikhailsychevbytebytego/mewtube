"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CatFace } from "@/components/cat-face";
import { SiteHeader } from "@/components/site-header";
import {
  addShelf,
  deleteShelf,
  deleteShelfVideo,
  renameChannel,
  renameShelf,
} from "@/lib/channel-actions";
import type { ChannelShelf, ChannelVideo, PublicOwnedChannel } from "@/lib/channel";
import { channelHref } from "@/lib/videos";

const fieldClass =
  "h-10 rounded-xl border border-field-border bg-field px-3 text-sm outline-none focus:border-[#1c62b9] disabled:opacity-60";

type VideoPayload = {
  slug?: string;
  statusUrl?: string;
  responseUrl?: string;
  videoUrl?: string;
  uid?: string;
  uploadUrl?: string;
  thumbnailUrl?: string;
  pending?: boolean;
  error?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postVideo(body: Record<string, string>) {
  const response = await fetch("/api/channel/video", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as VideoPayload | null;
  if (!response.ok || !payload) {
    throw new Error(payload?.error || "Could not add the video.");
  }
  if (payload.error) throw new Error(payload.error);
  return payload;
}

function BannerPreview({ image, name }: { image: string | null; name: string }) {
  return (
    <div className="relative h-[180px] overflow-hidden rounded-[11px] bg-[#e7b089]">
      {image ? (
        <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#e09a62] to-[#f3d2b0]" />
      )}
      <p className="absolute bottom-4 left-5 text-2xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        {name}
      </p>
    </div>
  );
}

function AddVideoDialog({
  shelf,
  onClose,
  onDone,
}: {
  shelf: ChannelShelf;
  onClose: () => void;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"upload" | "generate">("upload");
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<"edit" | "working">("edit");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = phase === "working";

  function close() {
    if (busy) return;
    onClose();
  }

  async function uploadThumbnail(file: File) {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/channel/video", { method: "POST", body: form });
    const payload = (await response.json().catch(() => null)) as VideoPayload | null;
    if (!response.ok || !payload?.thumbnailUrl) {
      throw new Error(payload?.error || "Could not upload the thumbnail.");
    }
    return payload.thumbnailUrl;
  }

  async function upload() {
    if (!videoFile) return;
    if (videoFile.size > 200 * 1024 * 1024) {
      setError("Videos need to be 200 MB or smaller.");
      return;
    }
    setError(null);
    setPhase("working");
    try {
      let uploadedThumb = "";
      if (thumbFile) {
        setStatus("Uploading the thumbnail...");
        uploadedThumb = await uploadThumbnail(thumbFile);
      }
      setStatus("Starting the upload...");
      const started = await postVideo({
        action: "upload-start",
        title,
        shelfId: shelf.id,
      });
      if (!started.uploadUrl || !started.uid) throw new Error("Could not start the upload.");
      setStatus("Uploading the video...");
      const form = new FormData();
      form.set("file", videoFile);
      const uploaded = await fetch(started.uploadUrl, { method: "POST", body: form });
      if (!uploaded.ok) throw new Error("Could not upload the video.");

      const deadline = Date.now() + 10 * 60 * 1000;
      let slug = "";
      setStatus("Processing the video...");
      while (!slug) {
        if (Date.now() > deadline) throw new Error("The video took too long to process.");
        await sleep(4000);
        const finished = await postVideo({
          action: "upload-finish",
          title,
          shelfId: shelf.id,
          uid: started.uid,
          thumbnailUrl: uploadedThumb,
        });
        if (finished.slug) slug = finished.slug;
      }
      onDone();
    } catch (caught) {
      setPhase("edit");
      setStatus(null);
      setError(caught instanceof Error ? caught.message : "Could not upload the video.");
    }
  }

  async function generateThumbnail() {
    setError(null);
    setPhase("working");
    setStatus("Making a thumbnail...");
    try {
      const payload = await postVideo({ action: "thumbnail", title });
      if (!payload.thumbnailUrl) throw new Error("Could not create a thumbnail.");
      setThumbnailUrl(payload.thumbnailUrl);
      setPhase("edit");
      setStatus(null);
    } catch (caught) {
      setPhase("edit");
      setStatus(null);
      setError(caught instanceof Error ? caught.message : "Could not create a thumbnail.");
    }
  }

  async function confirmGenerated() {
    if (!thumbnailUrl) return;
    setError(null);
    setPhase("working");
    setStatus("Creating the video. This can take a few minutes.");
    try {
      const started = await postVideo({
        action: "start",
        title,
        shelfId: shelf.id,
        thumbnailUrl,
      });
      if (!started.statusUrl || !started.responseUrl) throw new Error("Could not start the video.");
      const deadline = Date.now() + 15 * 60 * 1000;
      let videoUrl = "";
      while (!videoUrl) {
        if (Date.now() > deadline) throw new Error("The video took too long to create.");
        await sleep(3000);
        const statusPayload = await postVideo({
          action: "video",
          statusUrl: started.statusUrl,
          responseUrl: started.responseUrl,
        });
        if (statusPayload.videoUrl) videoUrl = statusPayload.videoUrl;
      }
      const copied = await postVideo({
        action: "copy",
        title,
        shelfId: shelf.id,
        thumbnailUrl,
        videoUrl,
      });
      let slug = copied.slug;
      while (!slug) {
        if (Date.now() > deadline || !copied.uid) {
          throw new Error("The video took too long to upload.");
        }
        await sleep(4000);
        const finished = await postVideo({
          action: "finish",
          title,
          shelfId: shelf.id,
          thumbnailUrl,
          uid: copied.uid,
        });
        slug = finished.slug;
      }
      onDone();
    } catch (caught) {
      setPhase("edit");
      setStatus(null);
      setError(caught instanceof Error ? caught.message : "Could not create the video.");
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-video-title"
        className="max-h-[min(720px,calc(100vh-2rem))] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-background p-5 text-ink shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-video-title" className="text-lg font-medium">
              Add a video to {shelf.title}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Upload a file, or generate a 15 second cat video from a title.
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

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            aria-pressed={mode === "upload"}
            disabled={busy}
            onClick={() => setMode("upload")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === "upload" ? "bg-ink text-background" : "bg-chip"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            aria-pressed={mode === "generate"}
            disabled={busy}
            onClick={() => setMode("generate")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === "generate" ? "bg-ink text-background" : "bg-chip"
            }`}
          >
            Generate
          </button>
        </div>

        <label className="mt-4 grid gap-1 text-sm">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={busy}
            placeholder="Kitten discovers a cardboard spaceship"
            className={fieldClass}
          />
        </label>

        {mode === "upload" ? (
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm">
              Video file
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                disabled={busy}
                onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Thumbnail image
              <span className="text-xs text-muted">
                Optional. Without one, a frame from the video is used, or a generated thumbnail.
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={busy}
                onChange={(event) => setThumbFile(event.target.files?.[0] ?? null)}
                className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
            </label>
          </div>
        ) : (
          <div className="mt-4">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Generated thumbnail"
                className="aspect-video w-full rounded-xl bg-chip object-cover"
              />
            ) : (
              <p className="text-sm text-muted">
                Generate a thumbnail, then confirm it to create the video.
              </p>
            )}
          </div>
        )}

        {error ? <p className="mt-3 text-sm text-[#c00]">{error}</p> : null}
        {status ? <p className="mt-3 text-sm text-muted">{status}</p> : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {mode === "generate" && thumbnailUrl && !busy ? (
            <button
              type="button"
              onClick={() => {
                setThumbnailUrl(null);
                setError(null);
              }}
              className="rounded-full px-4 py-2 text-sm font-medium hover:bg-chip"
            >
              Start over
            </button>
          ) : null}
          {mode === "upload" ? (
            <button
              type="button"
              onClick={() => void upload()}
              disabled={busy || title.trim().length < 3 || !videoFile}
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              Upload video
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void generateThumbnail()}
                disabled={busy || title.trim().length < 3}
                className="rounded-full border border-field-border px-4 py-2 text-sm font-medium hover:bg-chip disabled:opacity-50"
              >
                {thumbnailUrl ? "Regenerate" : "Generate thumbnail"}
              </button>
              <button
                type="button"
                onClick={() => void confirmGenerated()}
                disabled={busy || !thumbnailUrl}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
              >
                Create video
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ShelfEditor({
  shelf,
  busy,
  onBusy,
  onError,
  onChanged,
  onAddVideo,
}: {
  shelf: ChannelShelf;
  busy: boolean;
  onBusy: (value: boolean) => void;
  onError: (message: string | null) => void;
  onChanged: () => void;
  onAddVideo: () => void;
}) {
  const [title, setTitle] = useState(shelf.title);

  useEffect(() => {
    setTitle(shelf.title);
  }, [shelf.title]);

  async function saveTitle() {
    const next = title.trim();
    if (!next || next === shelf.title) {
      setTitle(shelf.title);
      return;
    }
    onBusy(true);
    onError(null);
    const result = await renameShelf(shelf.id, next);
    onBusy(false);
    if (result.error) {
      onError(result.error);
      setTitle(shelf.title);
      return;
    }
    onChanged();
  }

  async function removeShelf() {
    const detail = shelf.videos.length
      ? `Delete "${shelf.title}" and the videos on it?`
      : `Delete "${shelf.title}"?`;
    if (!window.confirm(detail)) return;
    onBusy(true);
    onError(null);
    const result = await deleteShelf(shelf.id);
    onBusy(false);
    if (result.error) {
      onError(result.error);
      return;
    }
    onChanged();
  }

  async function removeVideo(video: ChannelVideo) {
    if (!window.confirm(`Remove "${video.title}" from this shelf?`)) return;
    onBusy(true);
    onError(null);
    const result = await deleteShelfVideo(video.id);
    onBusy(false);
    if (result.error) {
      onError(result.error);
      return;
    }
    onChanged();
  }

  return (
    <section className="mt-6 border-t border-line pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid min-w-0 flex-1 gap-1 text-sm">
          Shelf title
          <input
            value={title}
            disabled={busy}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => void saveTitle()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void saveTitle();
              }
            }}
            className={fieldClass}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddVideo}
            disabled={busy}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            Add video
          </button>
          <button
            type="button"
            onClick={() => void removeShelf()}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#c00] hover:bg-chip disabled:opacity-50"
          >
            Delete shelf
          </button>
        </div>
      </div>
      {shelf.videos.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No videos in this shelf yet.</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shelf.videos.map((video) => (
            <article key={video.id}>
              <Link
                href={`/watch?v=${video.watchId ?? video.id}`}
                className="outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <div className="relative aspect-video overflow-hidden rounded-xl bg-[#e5e5e5]">
                  <Image
                    src={video.image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 25vw, 50vw"
                    className="object-cover"
                  />
                  <span className="absolute right-1.5 bottom-1.5 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
                    {video.duration}
                  </span>
                </div>
                <span className="mt-2 line-clamp-2 block text-sm font-medium">{video.title}</span>
              </Link>
              <button
                type="button"
                onClick={() => void removeVideo(video)}
                disabled={busy}
                className="mt-1 text-sm text-[#c00] hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function ChannelStudio({ channel }: { channel: PublicOwnedChannel }) {
  const router = useRouter();
  const [name, setName] = useState(channel.name);
  const [banner, setBanner] = useState(channel.bannerImage);
  const [prompt, setPrompt] = useState("");
  const [shelfTitle, setShelfTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [videoShelfId, setVideoShelfId] = useState<string | null>(null);

  useEffect(() => {
    setName(channel.name);
  }, [channel.name]);

  useEffect(() => {
    setBanner(channel.bannerImage);
  }, [channel.bannerImage]);

  const videoShelf = channel.shelves.find((shelf) => shelf.id === videoShelfId) ?? null;

  function changed() {
    router.refresh();
  }

  async function saveName() {
    const next = name.trim();
    if (!next || next === channel.name) {
      setName(channel.name);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await renameChannel(next);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      setName(channel.name);
      return;
    }
    changed();
  }

  async function createShelf() {
    setBusy(true);
    setError(null);
    const result = await addShelf(shelfTitle);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShelfTitle("");
    changed();
  }

  async function uploadBanner(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      setError("Images need to be 8 MB or smaller.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Uploading the banner...");
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/channel/banner", { method: "POST", body: form });
    const payload = (await response.json().catch(() => null)) as {
      bannerImage?: string;
      error?: string;
    } | null;
    setBusy(false);
    setStatus(null);
    if (!response.ok || !payload?.bannerImage) {
      setError(payload?.error || "Could not upload the banner.");
      return;
    }
    setBanner(payload.bannerImage);
    changed();
  }

  async function generateBanner() {
    setBusy(true);
    setError(null);
    setStatus("Generating the banner...");
    const response = await fetch("/api/channel/banner", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const payload = (await response.json().catch(() => null)) as {
      bannerImage?: string;
      error?: string;
    } | null;
    setBusy(false);
    setStatus(null);
    if (!response.ok || !payload?.bannerImage) {
      setError(payload?.error || "Could not generate the banner.");
      return;
    }
    setBanner(payload.bannerImage);
    setPrompt("");
    changed();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-ink">
      <SiteHeader onMenu={() => router.push("/")} onHome={() => router.push("/")} />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold">Your channel</h1>
            <Link
              href={channelHref(channel.handle)}
              className="rounded-full border border-field-border px-4 py-2 text-sm font-medium hover:bg-chip"
            >
              View channel
            </Link>
          </div>

          <BannerPreview image={banner} name={name.trim() || channel.name} />

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex flex-wrap items-center gap-2">
              <label className="rounded-full border border-field-border px-4 py-2 text-sm font-medium hover:bg-chip">
                Upload banner
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={busy}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadBanner(file);
                  }}
                />
              </label>
              <p className="text-sm text-muted">Or describe one and generate it.</p>
            </div>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void generateBanner();
              }}
            >
              <label className="sr-only" htmlFor="banner-prompt">
                Banner description
              </label>
              <input
                id="banner-prompt"
                value={prompt}
                disabled={busy}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Orange cats in a sunny garden"
                className={`${fieldClass} min-w-0 flex-1`}
              />
              <button
                type="submit"
                disabled={busy || prompt.trim().length < 3}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
              >
                Generate banner
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
              <CatFace color={channel.avatarColor} innerEar={channel.innerEar} />
            </span>
            <label className="grid min-w-0 flex-1 gap-1 text-sm">
              Channel name
              <input
                value={name}
                disabled={busy}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => void saveName()}
                className={fieldClass}
              />
            </label>
            <p className="pb-2 text-sm text-muted">{channel.subscribersLabel}</p>
          </div>

          <form
            className="mt-8 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void createShelf();
            }}
          >
            <label className="grid min-w-0 flex-1 gap-1 text-sm">
              New shelf
              <input
                value={shelfTitle}
                disabled={busy}
                onChange={(event) => setShelfTitle(event.target.value)}
                placeholder="Piano practice"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              disabled={busy || shelfTitle.trim().length === 0}
              className="h-10 self-end rounded-full bg-ink px-4 text-sm font-medium text-background disabled:opacity-50"
            >
              Add shelf
            </button>
          </form>

          {error ? <p className="mt-4 text-sm text-[#c00]">{error}</p> : null}
          {status ? <p className="mt-4 text-sm text-muted">{status}</p> : null}

          {channel.shelves.length === 0 ? (
            <p className="mt-8 text-sm text-muted">Add a shelf, then put videos inside it.</p>
          ) : (
            channel.shelves.map((shelf) => (
              <ShelfEditor
                key={shelf.id}
                shelf={shelf}
                busy={busy}
                onBusy={setBusy}
                onError={setError}
                onChanged={changed}
                onAddVideo={() => setVideoShelfId(shelf.id)}
              />
            ))
          )}
        </div>
      </main>
      {videoShelf ? (
        <AddVideoDialog
          shelf={videoShelf}
          onClose={() => setVideoShelfId(null)}
          onDone={() => {
            setVideoShelfId(null);
            changed();
          }}
        />
      ) : null}
    </div>
  );
}
