"use client";

import { useRouter } from "next/navigation";
import { CatConfetti } from "@/components/cat-confetti";
import { CatFace } from "@/components/cat-face";
import { CheckIcon } from "@/components/icons";
import { LoginDialog } from "@/components/login-dialog";
import { SiteHeader } from "@/components/site-header";
import { useSubscribe } from "@/components/use-subscribe";
import { VideoCard } from "@/components/video-card";
import type { Video } from "@/lib/videos";

export function ChannelLibrary({
  name,
  handle,
  subscribers,
  avatar,
  innerEar,
  videos,
  subscribed: initiallySubscribed = false,
}: {
  name: string;
  handle: string;
  subscribers: string | null;
  avatar: string;
  innerEar: string;
  videos: Video[];
  subscribed?: boolean;
}) {
  const router = useRouter();
  const { subscribed, confetti, loginOpen, setLoginOpen, subscribe, finishLogin } =
    useSubscribe(handle, initiallySubscribed);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-ink">
      <CatConfetti burst={confetti} />
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={finishLogin}
      />
      <SiteHeader
        onMenu={() => router.push("/")}
        onHome={() => router.push("/")}
      />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-[1750px] items-center gap-4">
          <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
            <CatFace color={avatar} innerEar={innerEar} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              {name}
              <CheckIcon />
              <span className="sr-only">Verified</span>
            </h1>
            {subscribers ? <p className="mt-1 text-sm text-muted">{subscribers}</p> : null}
          </div>
          <button
            type="button"
            aria-pressed={subscribed}
            onClick={subscribe}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium ${
              subscribed ? "bg-chip text-ink" : "bg-ink text-background"
            }`}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
        {videos.length === 0 ? (
          <p className="mx-auto mt-10 max-w-[1750px] text-sm text-muted">No videos found.</p>
        ) : (
          <div className="mx-auto mt-6 grid max-w-[1750px] grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
