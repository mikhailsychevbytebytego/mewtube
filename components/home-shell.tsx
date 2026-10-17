"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@/components/icons";
import { GuideSidebar } from "@/components/guide-sidebar";
import { SiteHeader } from "@/components/site-header";
import { VideoCard } from "@/components/video-card";
import { recommendByTaste } from "@/lib/taste";
import {
  getServerTasteProfile,
  getTasteProfile,
  subscribeTaste,
} from "@/lib/taste-profile";
import { categories, type CategoryFilter, type Video } from "@/lib/videos";

function formatTasteList(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

export function HomeShell({
  videos,
  query = "",
  pending = false,
  error,
}: {
  videos: Video[];
  query?: string;
  pending?: boolean;
  error?: string;
}) {
  const router = useRouter();
  const profile = useSyncExternalStore(subscribeTaste, getTasteProfile, getServerTasteProfile);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [youOpen, setYouOpen] = useState(true);
  const [canScrollChips, setCanScrollChips] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategory("All");
  }, [query]);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    const update = () => {
      setCanScrollChips(
        element.scrollWidth - element.clientWidth - element.scrollLeft > 8,
      );
    };

    update();
    element.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      element.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function goHome() {
    setCategory("All");
    setMobileOpen(false);
    if (query) router.push("/");
  }

  function toggleGuide() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((open) => !open);
      return;
    }
    setMobileOpen((open) => !open);
  }

  const recommendation = useMemo(
    () => recommendByTaste(videos, profile.scores),
    [profile.scores, videos],
  );
  const tasteLabels = recommendation.tastes.map((taste) => taste.label);
  const recommended =
    query || pending || error
      ? []
      : recommendation.videos.filter(
          (video) => category === "All" || video.categories.includes(category),
        );
  const recommendedIds = new Set(recommended.map((video) => video.id));
  const visibleVideos = videos.filter(
    (video) =>
      (category === "All" || video.categories.includes(category)) &&
      !recommendedIds.has(video.id),
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-ink">
      <SiteHeader
        query={query}
        onMenu={toggleGuide}
        onHome={goHome}
      />
      <div className="flex min-h-0 flex-1">
        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close guide"
            className="fixed inset-x-0 bottom-0 top-[104px] z-30 bg-black/40 sm:top-[68px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        <GuideSidebar
          mobileOpen={mobileOpen}
          collapsed={collapsed}
          youOpen={youOpen}
          onToggleYou={() => setYouOpen((open) => !open)}
          onHome={goHome}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto" aria-label="Home">
          {query && !pending ? (
            <h1 className="px-4 pt-4 text-lg font-medium sm:px-6">Results for “{query}”</h1>
          ) : (
            <h1 className="sr-only">Home</h1>
          )}
          <div className="sticky top-0 z-20 bg-background">
            <div className="relative">
              <div
                ref={scrollerRef}
                className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-3 sm:px-6"
              >
                {categories.map((item) => {
                  const selected = item === category;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCategory(item)}
                      className={`h-8 shrink-0 rounded-lg px-3 text-sm ${
                        selected
                          ? "bg-ink font-medium text-background"
                          : "bg-chip hover:bg-hover"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              {canScrollChips ? (
                <button
                  type="button"
                  aria-label="More categories"
                  onClick={() =>
                    scrollerRef.current?.scrollBy({ left: 280, behavior: "smooth" })
                  }
                  className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                >
                  <ChevronRightIcon />
                </button>
              ) : null}
            </div>
          </div>

          {pending ? (
            <p className="px-6 py-16 text-center text-sm text-muted">Searching thumbnails...</p>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium">{error}</p>
            </div>
          ) : recommended.length === 0 && visibleVideos.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium">No videos found</p>
              <p className="mt-1 text-sm text-muted">
                {query ? "Try a different search or category." : "Try another category."}
              </p>
            </div>
          ) : (
            <>
              {recommended.length > 0 ? (
                <section aria-label="Recommended" className="px-4 pt-2 sm:px-6">
                  <h2 className="text-lg font-medium">Recommended</h2>
                  <p className="mt-1 text-sm text-muted">
                    Based on {formatTasteList(tasteLabels)}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {recommended.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              ) : null}
              {visibleVideos.length > 0 ? (
                <section
                  aria-label="More videos"
                  className={recommended.length > 0 ? "mt-10" : undefined}
                >
                  {recommended.length > 0 ? (
                    <h2 className="px-4 text-lg font-medium sm:px-6">More videos</h2>
                  ) : null}
                  <div
                    className={`grid grid-cols-1 gap-x-4 gap-y-8 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4 ${
                      recommended.length > 0 ? "mt-4" : ""
                    }`}
                  >
                    {visibleVideos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
