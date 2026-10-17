"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuideSidebar } from "@/components/guide-sidebar";
import { SiteHeader } from "@/components/site-header";
import { VideoCard } from "@/components/video-card";
import type { Video } from "@/lib/videos";

export function SubscriptionsShell({
  signedIn,
  videos,
}: {
  signedIn: boolean;
  videos: Video[];
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [youOpen, setYouOpen] = useState(true);

  function goHome() {
    setMobileOpen(false);
    router.push("/");
  }

  function toggleGuide() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((open) => !open);
      return;
    }
    setMobileOpen((open) => !open);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-ink">
      <SiteHeader onMenu={toggleGuide} onHome={goHome} />
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
          homeCurrent={false}
        />
        <main className="min-w-0 flex-1 overflow-y-auto" aria-label="Subscriptions">
          <h1 className="px-4 pt-4 text-lg font-medium sm:px-6">Subscriptions</h1>
          {!signedIn ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium">Sign in to see your subscriptions</p>
              <p className="mt-1 text-sm text-muted">
                Videos from channels you subscribe to will show up here.
              </p>
              <Link
                href="/login?next=/subscriptions"
                className="mt-4 inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-background"
              >
                Sign in
              </Link>
            </div>
          ) : videos.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium">No subscriptions yet</p>
              <p className="mt-1 text-sm text-muted">
                Subscribe to a channel and its videos will show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 px-4 pt-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
