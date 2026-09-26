"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CatFace } from "@/components/cat-face";
import {
  CheckIcon,
  ChevronIcon,
  ThumbIcon,
} from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { videos, type Video } from "@/lib/videos";
import {
  pianoComments,
  pianoDetails,
  relatedChips,
  relatedOrder,
  type RelatedChip,
  type WatchComment,
} from "@/lib/watch";

function IconButton({
  label,
  children,
  onClick,
  pressed,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full text-white hover:bg-white/15"
    >
      {children}
    </button>
  );
}

function PlayerIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function WatchScreen({ videoId }: { videoId: string }) {
  const router = useRouter();
  const playerRef = useRef<HTMLDivElement>(null);
  const video = videos.find((item) => item.id === videoId) ?? videos[0];
  const isPiano = video.id === "piano";
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<RelatedChip>("All");
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [theater, setTheater] = useState(false);
  const [sort, setSort] = useState<"top" | "newest">("top");
  const [draft, setDraft] = useState("");
  const [added, setAdded] = useState<WatchComment[]>([]);

  const related = useMemo(() => {
    const ordered = relatedOrder
      .map((id) => videos.find((item) => item.id === id))
      .filter((item): item is Video => item !== undefined && item.id !== video.id);
    const needle = query.trim().toLowerCase();
    return ordered.filter((item) => {
      const matchesQuery =
        needle.length === 0 ||
        `${item.title} ${item.channel}`.toLowerCase().includes(needle);
      const matchesChip =
        chip === "All" ||
        chip === "Related" ||
        (chip === "From Meowestro" && item.channel === "Meowestro") ||
        (chip === "Kittens" && item.categories.includes("Kittens")) ||
        (chip === "Piano Cats" && item.id === "piano");
      return matchesQuery && matchesChip;
    });
  }, [chip, query, video.id]);

  const comments = sort === "newest" ? [...added, ...pianoComments] : [...pianoComments, ...added];
  const commentCount = isPiano ? pianoDetails.commentCount + added.length : added.length;

  function addComment(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setAdded((current) => [
      {
        id: `you-${current.length}`,
        author: "You",
        avatar: "#e09a62",
        innerEar: "#f3c2c8",
        posted: "Just now",
        text,
        likes: "0",
      },
      ...current,
    ]);
    setDraft("");
    setSort("newest");
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: video.title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => undefined);
  }

  function toggleFullscreen() {
    const node = playerRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void node.requestFullscreen();
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white text-ink">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onMenu={() => router.push("/")}
        onHome={() => router.push("/")}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1750px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
          <div className="min-w-0 flex-1">
            <div
              ref={playerRef}
              className={`relative overflow-hidden rounded-xl bg-black ${
                isPiano ? "aspect-[630/286]" : "aspect-video"
              }`}
            >
              <Image
                src={isPiano ? "/thumbnails/piano-player.jpg" : `/thumbnails/${video.id}.jpg`}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 70vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-2 pt-10 pb-1.5 text-white">
                <div className="mx-1 mb-1 h-[3px] overflow-hidden rounded-full bg-white/35">
                  <div className="h-full w-3 bg-[#ff0000]" />
                </div>
                <div className="flex items-center">
                  <IconButton
                    label={playing ? "Pause" : "Play"}
                    pressed={playing}
                    onClick={() => setPlaying((value) => !value)}
                  >
                    {playing ? (
                      <PlayerIcon>
                        <path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z" fill="currentColor" stroke="none" />
                      </PlayerIcon>
                    ) : (
                      <PlayerIcon>
                        <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" stroke="none" />
                      </PlayerIcon>
                    )}
                  </IconButton>
                  <IconButton label="Mute">
                    <PlayerIcon>
                      <path d="M4 10h3.2L12 6.5v11L7.2 14H4v-4z" />
                      <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
                    </PlayerIcon>
                  </IconButton>
                  <p className="ml-1 text-xs font-medium tabular-nums">
                    0:00 / {video.duration}
                  </p>
                  <div className="ml-auto flex items-center">
                    <IconButton label="Subtitles">
                      <PlayerIcon>
                        <rect x="3" y="6" width="18" height="12" rx="2" />
                        <path d="M7 12h3M7 15h6M12 12h5" />
                      </PlayerIcon>
                    </IconButton>
                    <IconButton label="Settings">
                      <PlayerIcon>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4" />
                      </PlayerIcon>
                    </IconButton>
                    <IconButton
                      label="Theater mode"
                      pressed={theater}
                      onClick={() => setTheater((value) => !value)}
                    >
                      <PlayerIcon>
                        <rect x="3" y="6" width="18" height="12" rx="2" />
                        <path d="M14 9h4v6h-4z" />
                      </PlayerIcon>
                    </IconButton>
                    <IconButton label="Full screen" onClick={toggleFullscreen}>
                      <PlayerIcon>
                        <path d="M9 5H5v4M15 5h4v4M9 19H5v-4M15 19h4v-4" />
                      </PlayerIcon>
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="mt-3 text-xl font-bold leading-7">{video.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
                  <CatFace color={video.avatar} innerEar={video.innerEar} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <span className="truncate">{video.channel}</span>
                    <CheckIcon />
                    <span className="sr-only">Verified</span>
                  </span>
                  {isPiano ? (
                    <span className="block text-xs text-muted">{pianoDetails.subscribers}</span>
                  ) : null}
                </span>
              </Link>
              <button
                type="button"
                aria-pressed={subscribed}
                onClick={() => setSubscribed((value) => !value)}
                className={`h-9 rounded-full px-4 text-sm font-medium ${
                  subscribed ? "bg-chip text-ink" : "bg-ink text-white"
                }`}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
              <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                <div className="flex h-9 items-center rounded-full bg-chip">
                  <button
                    type="button"
                    aria-pressed={liked}
                    onClick={() => {
                      setLiked((value) => !value);
                      setDisliked(false);
                    }}
                    className="flex h-9 items-center gap-2 rounded-l-full px-3 text-sm font-medium hover:bg-[#e5e5e5]"
                  >
                    <ThumbIcon />
                    {isPiano ? pianoDetails.likes : "Like"}
                  </button>
                  <span className="h-5 w-px bg-[#ccc]" />
                  <button
                    type="button"
                    aria-label="Dislike"
                    aria-pressed={disliked}
                    onClick={() => {
                      setDisliked((value) => !value);
                      setLiked(false);
                    }}
                    className="grid h-9 w-11 place-items-center rounded-r-full hover:bg-[#e5e5e5]"
                  >
                    <span className="rotate-180">
                      <ThumbIcon />
                    </span>
                  </button>
                </div>
                <ActionButton onClick={() => void share()}>
                  <PlayerIcon>
                    <path d="M12 16V5M8 8l4-4 4 4" />
                    <path d="M6 12v6h12v-6" />
                  </PlayerIcon>
                  Share
                </ActionButton>
                <ActionButton>
                  <PlayerIcon>
                    <circle cx="6" cy="7" r="2.2" />
                    <circle cx="6" cy="17" r="2.2" />
                    <path d="M8 8.2 18 16M18 8 8 15.8" />
                  </PlayerIcon>
                  Clip
                </ActionButton>
                <ActionButton pressed={saved} onClick={() => setSaved((value) => !value)}>
                  <PlayerIcon>
                    <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.2L6 20V5a1 1 0 0 1 1-1z" />
                  </PlayerIcon>
                  {saved ? "Saved" : "Save"}
                </ActionButton>
                <button
                  type="button"
                  aria-label="More actions"
                  className="grid size-9 place-items-center rounded-full bg-chip hover:bg-[#e5e5e5]"
                >
                  <PlayerIcon>
                    <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none" />
                  </PlayerIcon>
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-chip px-3 py-3 text-sm">
              <p className="font-semibold">
                {video.views} &nbsp; {video.uploaded}
                {isPiano
                  ? pianoDetails.hashtags.map((tag) => (
                      <span key={tag}> &nbsp; {tag}</span>
                    ))
                  : null}
              </p>
              {isPiano ? (
                <div className="mt-2 space-y-2 leading-5">
                  {pianoDetails.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {expanded ? <p>{pianoDetails.more}</p> : null}
                </div>
              ) : (
                <p className="mt-2 leading-5">
                  {video.title} from {video.channel}.
                </p>
              )}
              {isPiano ? (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-2 flex items-center gap-1 font-semibold"
                >
                  {expanded ? "Show less" : "Show more"}
                  <span className={expanded ? "-rotate-90" : "rotate-90"}>
                    <ChevronIcon />
                  </span>
                </button>
              ) : null}
            </div>

            <section className="mt-6" aria-label="Comments">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-lg font-bold">
                  {commentCount.toLocaleString("en-US")} Comments
                </h2>
                {isPiano ? (
                  <button
                    type="button"
                    onClick={() => setSort((value) => (value === "top" ? "newest" : "top"))}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Sort by: {sort === "top" ? "Top comments" : "Newest"}
                    <span className="rotate-90">
                      <ChevronIcon />
                    </span>
                  </button>
                ) : null}
              </div>
              <form onSubmit={addComment} className="mt-4 flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3d2b0]">
                  <CatFace color="#e09a62" />
                </span>
                <label className="sr-only" htmlFor="comment">
                  Add a comment
                </label>
                <input
                  id="comment"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Add a meow..."
                  className="min-w-0 flex-1 border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
                />
              </form>
              {isPiano || added.length > 0 ? (
                <ul className="mt-6 space-y-5">
                  {(isPiano ? comments : added).map((comment) => (
                    <li key={comment.id} className="flex gap-3">
                      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
                        <CatFace color={comment.avatar} innerEar={comment.innerEar} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{comment.author}</span>
                          <span className="ml-2 text-xs text-muted">{comment.posted}</span>
                        </p>
                        <p className="mt-1 text-sm leading-5">{comment.text}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                          <span className="inline-flex items-center gap-1">
                            <span className="scale-75">
                              <ThumbIcon />
                            </span>
                            {comment.likes}
                          </span>
                          <button type="button" className="font-medium text-ink">
                            Reply
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm text-muted">Be the first to leave a meow.</p>
              )}
            </section>
          </div>

          {theater ? null : (
            <aside className="w-full shrink-0 lg:w-[402px]" aria-label="Related videos">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
                {relatedChips.map((item) => {
                  const selected = item === chip;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setChip(item)}
                      className={`h-8 shrink-0 rounded-lg px-3 text-sm ${
                        selected ? "bg-ink font-medium text-white" : "bg-chip hover:bg-[#e5e5e5]"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              {related.length === 0 ? (
                <p className="py-6 text-sm text-muted">No videos in this category.</p>
              ) : (
                <ul className="space-y-2">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link href={`/watch?v=${item.id}`} className="flex gap-2 rounded-lg hover:bg-chip">
                        <span className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-[#e5e5e5]">
                          <Image
                            src={`/thumbnails/${item.id}.jpg`}
                            alt=""
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 py-0.5">
                          <span className="line-clamp-2 text-sm font-medium leading-5">
                            {item.title}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-muted">
                            <span className="truncate">{item.channel}</span>
                            <CheckIcon />
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {item.views} • {item.uploaded}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  pressed,
}: {
  children: ReactNode;
  onClick?: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="flex h-9 items-center gap-2 rounded-full bg-chip px-3 text-sm font-medium hover:bg-[#e5e5e5]"
    >
      {children}
    </button>
  );
}
