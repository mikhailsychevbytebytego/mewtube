"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { GuideSidebar } from "@/components/guide-sidebar";
import { SiteHeader } from "@/components/site-header";
import { VideoCard } from "@/components/video-card";
import { categories, videos, type CategoryFilter } from "@/lib/videos";

export function HomeShell() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [youOpen, setYouOpen] = useState(true);
  const [canScrollChips, setCanScrollChips] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

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
    setQuery("");
    setCategory("All");
    setMobileOpen(false);
  }

  function toggleGuide() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((open) => !open);
      return;
    }
    setMobileOpen((open) => !open);
  }

  const normalizedQuery = query.trim().toLowerCase();
  const visibleVideos = videos.filter((video) => {
    const matchesCategory =
      category === "All" || video.categories.includes(category);
    const matchesQuery =
      normalizedQuery.length === 0 ||
      `${video.title} ${video.channel}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white text-ink">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
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
          <h1 className="sr-only">Home</h1>
          <div className="sticky top-0 z-20 bg-white">
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
                          ? "bg-ink font-medium text-white"
                          : "bg-chip hover:bg-[#e5e5e5]"
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
                  className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                >
                  <ChevronRightIcon />
                </button>
              ) : null}
            </div>
          </div>

          {visibleVideos.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium">No videos found</p>
              <p className="mt-1 text-sm text-muted">
                Try a different search or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
              {visibleVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
