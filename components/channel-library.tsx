"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CatFace } from "@/components/cat-face";
import { CheckIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { VideoCard } from "@/components/video-card";
import type { Video } from "@/lib/videos";

export function ChannelLibrary({
  name,
  subscribers,
  avatar,
  innerEar,
  videos,
}: {
  name: string;
  subscribers: string | null;
  avatar: string;
  innerEar: string;
  videos: Video[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = videos.filter((video) =>
    needle.length === 0 || `${video.title} ${video.channel}`.toLowerCase().includes(needle),
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-ink">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onMenu={() => router.push("/")}
        onHome={() => router.push("/")}
      />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-[1750px] items-center gap-4">
          <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
            <CatFace color={avatar} innerEar={innerEar} />
          </span>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              {name}
              <CheckIcon />
              <span className="sr-only">Verified</span>
            </h1>
            {subscribers ? <p className="mt-1 text-sm text-muted">{subscribers}</p> : null}
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="mx-auto mt-10 max-w-[1750px] text-sm text-muted">No videos found.</p>
        ) : (
          <div className="mx-auto mt-6 grid max-w-[1750px] grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
