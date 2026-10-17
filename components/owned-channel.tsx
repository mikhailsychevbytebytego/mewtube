"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatConfetti } from "@/components/cat-confetti";
import { CatFace } from "@/components/cat-face";
import { CheckIcon, PawIcon } from "@/components/icons";
import { LoginDialog } from "@/components/login-dialog";
import { SiteHeader } from "@/components/site-header";
import { useSubscribe } from "@/components/use-subscribe";
import type { ChannelVideo, PublicOwnedChannel } from "@/lib/channel";

function Banner({ image, name }: { image: string | null; name: string }) {
  return (
    <section className="relative h-[180px] overflow-hidden rounded-[11px] bg-[#e7b089]">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#e09a62] to-[#f3d2b0]" />
      )}
      <p className="absolute bottom-4 left-5 text-2xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        {name}
      </p>
    </section>
  );
}

function ShelfVideo({ video }: { video: ChannelVideo }) {
  const href = video.watchId ? `/watch?v=${video.watchId}` : null;
  const media = (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-[#e5e5e5]">
      <Image
        src={video.image}
        alt=""
        fill
        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
        className="object-cover"
      />
      <span className="absolute right-1.5 bottom-1.5 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
        {video.duration}
      </span>
    </div>
  );
  const title = <span className="mt-2 line-clamp-2 block text-sm font-medium">{video.title}</span>;
  return (
    <article>
      {href ? (
        <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-ink">
          {media}
          {title}
        </Link>
      ) : (
        <>
          {media}
          {title}
        </>
      )}
      {video.views ? (
        <p className="mt-1 text-xs text-muted">
          {video.views}
          {video.uploaded ? ` · ${video.uploaded}` : ""}
        </p>
      ) : null}
    </article>
  );
}

export function OwnedChannel({
  channel,
  isOwner,
  subscribed: initiallySubscribed = false,
}: {
  channel: PublicOwnedChannel;
  isOwner: boolean;
  subscribed?: boolean;
}) {
  const router = useRouter();
  const { subscribed, confetti, loginOpen, setLoginOpen, subscribe, finishLogin } = useSubscribe(
    channel.handle,
    initiallySubscribed,
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-ink">
      <CatConfetti burst={confetti} />
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={finishLogin}
      />
      <SiteHeader onMenu={() => router.push("/")} onHome={() => router.push("/")} />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-10">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="sr-only">{channel.name}</h1>
          <Banner image={channel.bannerImage} name={channel.name} />
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
              <CatFace color={channel.avatarColor} innerEar={channel.innerEar} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[32px] leading-none font-bold">
                {channel.name}
                <CheckIcon />
                <span className="sr-only">Verified</span>
              </p>
              <p className="mt-2 text-sm text-muted">{channel.subscribersLabel}</p>
              <p className="mt-1 text-sm text-muted">@{channel.handle}</p>
            </div>
            {isOwner ? (
              <Link
                href="/studio"
                className="flex h-[43px] items-center rounded-full bg-ink px-5 text-base font-bold text-background"
              >
                Edit channel
              </Link>
            ) : (
              <button
                type="button"
                aria-pressed={subscribed}
                onClick={subscribe}
                className={`flex h-[43px] items-center gap-2.5 rounded-full px-5 text-base font-bold ${
                  subscribed ? "bg-chip text-ink" : "bg-ink text-background"
                }`}
              >
                <PawIcon className="size-[22px]" />
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>

          {channel.shelves.length === 0 ? (
            <p className="mt-10 text-sm text-muted">This channel has not added any shelves yet.</p>
          ) : (
            channel.shelves.map((shelf) => (
              <section key={shelf.id} className="mt-8 border-t border-line pt-4">
                <h2 className="text-xl font-bold">{shelf.title}</h2>
                {shelf.videos.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">No videos in this shelf yet.</p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {shelf.videos.map((video) => (
                      <ShelfVideo key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
