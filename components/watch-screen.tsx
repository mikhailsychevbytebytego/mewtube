"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CatFace } from "@/components/cat-face";
import {
  CheckIcon,
  ChevronIcon,
  ThumbIcon,
} from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { postComment } from "@/lib/post-comment";
import { channelHref, watchHref, type Video } from "@/lib/videos";
import type { WatchComment } from "@/lib/watch";

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

export function WatchScreen({
  video,
  relatedVideos,
  comments: storedComments,
}: {
  video: Video;
  relatedVideos: Video[];
  comments: WatchComment[];
}) {
  const router = useRouter();
  const hasDetails = (video.paragraphs?.length ?? 0) > 0;
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("All");
  const chips = ["All", `From ${video.channel}`, "Kittens", "Funny Cats", "Related"];
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<"top" | "newest">("top");
  const [draft, setDraft] = useState("");
  const [added, setAdded] = useState<WatchComment[]>([]);

  const related = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return relatedVideos.filter((item) => {
      const matchesQuery =
        needle.length === 0 ||
        `${item.title} ${item.channel}`.toLowerCase().includes(needle);
      const matchesChip =
        chip === "All" ||
        chip === "Related" ||
        (chip === `From ${video.channel}` && item.channel === video.channel) ||
        (chip === "Kittens" && item.categories.includes("Kittens")) ||
        (chip === "Funny Cats" && item.categories.includes("Funny Cats"));
      return matchesQuery && matchesChip;
    });
  }, [chip, query, relatedVideos, video.channel]);

  const pending = added.filter(
    (comment) => !storedComments.some((stored) => stored.id === comment.id),
  );
  const comments =
    sort === "newest" ? [...pending, ...storedComments] : [...storedComments, ...pending];
  const commentCount = (video.commentCount ?? 0) + pending.length;

  function addComment(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    startTransition(async () => {
      const comment = await postComment(video.id, text);
      setAdded((current) => [comment, ...current]);
      setDraft("");
      setSort("newest");
    });
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: video.title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => undefined);
  }

  const playerSrc = useMemo(() => {
    if (!video.playbackUrl) return null;
    const url = new URL(video.playbackUrl);
    if (video.thumbnail) url.searchParams.set("poster", video.thumbnail);
    url.searchParams.set("autoplay", "true");
    url.searchParams.set("muted", "true");
    return url.toString();
  }, [video.playbackUrl, video.thumbnail]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-ink">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onMenu={() => router.push("/")}
        onHome={() => router.push("/")}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1750px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
          <div className="min-w-0 flex-1">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              {playerSrc ? (
                <iframe
                  src={playerSrc}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <Image
                  src={video.thumbnail ?? `/thumbnails/${video.slug ?? video.id}.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>

            <h1 className="mt-3 text-xl font-bold leading-7">{video.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href={channelHref(video.channelHandle)}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
                  <CatFace color={video.avatar} innerEar={video.innerEar} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <span className="truncate">{video.channel}</span>
                    <CheckIcon />
                    <span className="sr-only">Verified</span>
                  </span>
                  {video.subscribers ? (
                    <span className="block text-xs text-muted">{video.subscribers}</span>
                  ) : null}
                </span>
              </Link>
              <button
                type="button"
                aria-pressed={subscribed}
                onClick={() => setSubscribed((value) => !value)}
                className={`h-9 rounded-full px-4 text-sm font-medium ${
                  subscribed ? "bg-chip text-ink" : "bg-ink text-background"
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
                    className="flex h-9 items-center gap-2 rounded-l-full px-3 text-sm font-medium hover:bg-hover"
                  >
                    <ThumbIcon />
                    {video.likes ?? "Like"}
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
                    className="grid h-9 w-11 place-items-center rounded-r-full hover:bg-hover"
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
                  className="grid size-9 place-items-center rounded-full bg-chip hover:bg-hover"
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
                {(video.hashtags ?? []).map((tag) => (
                  <span key={tag}> &nbsp; {tag}</span>
                ))}
              </p>
              {hasDetails ? (
                <div className="mt-2 space-y-2 leading-5">
                  {(video.paragraphs ?? []).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {expanded ? <p>{video.descriptionMore}</p> : null}
                </div>
              ) : (
                <p className="mt-2 leading-5">
                  {video.title} from {video.channel}.
                </p>
              )}
              {hasDetails ? (
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
                {comments.length > 0 ? (
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
              {comments.length > 0 ? (
                <ul className="mt-6 space-y-5">
                  {comments.map((comment) => (
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

          <aside className="w-full shrink-0 lg:w-[402px]" aria-label="Related videos">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
                {chips.map((item) => {
                  const selected = item === chip;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setChip(item)}
                      className={`h-8 shrink-0 rounded-lg px-3 text-sm ${
                        selected ? "bg-ink font-medium text-background" : "bg-chip hover:bg-hover"
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
                      <div className="flex gap-2 rounded-lg hover:bg-chip">
                        <Link
                          href={watchHref(item)}
                          className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-[#e5e5e5]"
                        >
                          <Image
                            src={item.thumbnail ?? `/thumbnails/${item.slug ?? item.id}.jpg`}
                            alt=""
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                          <span className="absolute right-1 bottom-1 rounded-[3px] bg-black/80 px-1 py-px text-[11px] font-medium text-white">
                            {item.duration}
                          </span>
                        </Link>
                        <span className="min-w-0 py-0.5">
                          <Link href={watchHref(item)} className="line-clamp-2 text-sm font-medium leading-5">
                            {item.title}
                          </Link>
                          <Link
                            href={channelHref(item.channelHandle)}
                            className="mt-1 flex items-center gap-1 text-xs text-muted"
                          >
                            <span className="truncate">{item.channel}</span>
                            <CheckIcon />
                          </Link>
                          <span className="mt-0.5 block text-xs text-muted">
                            {item.views} • {item.uploaded}
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
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
      className="flex h-9 items-center gap-2 rounded-full bg-chip px-3 text-sm font-medium hover:bg-hover"
    >
      {children}
    </button>
  );
}
