"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GuideSidebar } from "@/components/guide-sidebar";
import {
  BellIcon,
  CheckIcon,
  MenuIcon,
  MicIcon,
  PawIcon,
  PlayMark,
  SearchIcon,
  ThumbIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { channelTabs, type ChannelPage, type ChannelTab, type ChannelVideo } from "@/lib/channel";
import { channelHref } from "@/lib/videos";

function AssetIcon({
  src,
  className = "size-[22px]",
}: {
  src: string;
  className?: string;
}) {
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden ${className}`}>
      <img src={src} alt="" className="size-full dark:invert" />
    </span>
  );
}

function Thumbnail({
  video,
  className,
  overlayClassName,
}: {
  video: Pick<ChannelVideo, "image" | "overlay" | "duration" | "title">;
  className: string;
  overlayClassName: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-[#1a120c] ${className}`}>
      <Image
        src={video.image}
        alt=""
        fill
        sizes="(min-width: 1280px) 280px, 50vw"
        className="object-cover"
      />
      <div
        className={`absolute font-bold leading-[1.05] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] ${overlayClassName}`}
      >
        {video.overlay.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <span className="absolute right-1 bottom-1 rounded-[3px] bg-black/85 px-1 py-0.5 text-xs font-bold text-white">
        {video.duration}
      </span>
      <span className="sr-only">{video.duration}</span>
    </div>
  );
}

function ShelfCard({
  video,
  channelName,
  channelUrl,
  thumbClassName,
  overlayClassName,
}: {
  video: ChannelVideo;
  channelName: string;
  channelUrl: string;
  thumbClassName: string;
  overlayClassName: string;
}) {
  const media = (
    <>
      <Thumbnail
        video={video}
        className={thumbClassName}
        overlayClassName={overlayClassName}
      />
      <span className="mt-1.5 block text-[13px] leading-[1.18] font-bold text-ink">
        {video.title}
      </span>
      {video.subtitle ? (
        <span className="mt-0.5 block text-[13px] leading-normal text-ink">
          {video.subtitle}
        </span>
      ) : null}
    </>
  );

  return (
    <article className="group block min-w-0 text-left">
      {video.watchId ? (
        <Link
          href={`/watch?v=${video.watchId}`}
          className="outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          {media}
        </Link>
      ) : (
        media
      )}
      <Link href={channelUrl} className="mt-0.5 flex items-center gap-1 text-xs text-muted">
        {channelName}
        <CheckIcon />
        <span className="sr-only">Verified</span>
      </Link>
      {video.views ? (
        <span className="mt-0.5 block text-xs text-muted">
          {video.views} · {video.uploaded}
        </span>
      ) : null}
    </article>
  );
}

function matchesQuery(text: string, query: string) {
  return query.length === 0 || text.toLowerCase().includes(query);
}

export function ChannelScreen({ channel }: { channel: ChannelPage }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [youOpen, setYouOpen] = useState(true);
  const [tab, setTab] = useState<ChannelTab>("Home");
  const [subscribed, setSubscribed] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);

  const needle = query.trim().toLowerCase();
  const visibleForYou = useMemo(
    () =>
      channel.forYou.filter((video) =>
        matchesQuery(`${video.title} ${video.subtitle ?? ""}`, needle),
      ),
    [channel.forYou, needle],
  );
  const visibleShelf = useMemo(
    () =>
      channel.shelf.filter((video) =>
        matchesQuery(`${video.title} ${video.subtitle ?? ""}`, needle),
      ),
    [channel.shelf, needle],
  );
  const featuredVisible = matchesQuery(
    `${channel.featured.title} ${channel.featured.description}`,
    needle,
  );
  const nothingMatches =
    needle.length > 0 &&
    !featuredVisible &&
    visibleForYou.length === 0 &&
    visibleShelf.length === 0;

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

  async function shareChannel() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: channel.name, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => undefined);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-ink">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close guide"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-background lg:static lg:z-auto ${
          mobileOpen ? "flex" : "hidden"
        } ${collapsed ? "lg:hidden" : "lg:flex"}`}
      >
        <div className="flex h-[67px] shrink-0 items-center gap-6 px-4">
          <button
            type="button"
            onClick={toggleGuide}
            aria-label="Guide"
            className="grid size-10 place-items-center rounded-full hover:bg-chip"
          >
            <MenuIcon />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <PlayMark className="h-[35px] w-[47px]" />
            <span className="leading-none">
              <span className="flex items-center gap-1 text-[22px] font-bold text-ink">
                CatTube
                <PawIcon className="size-[19px]" />
              </span>
              <span className="mt-0.5 block text-[10px]">Good Cats. Better Days.</span>
            </span>
          </Link>
        </div>
        <GuideSidebar
          embedded
          homeCurrent={false}
          mobileOpen={mobileOpen}
          collapsed={collapsed}
          youOpen={youOpen}
          onToggleYou={() => setYouOpen((open) => !open)}
          onHome={goHome}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[67px] shrink-0 items-center gap-3 px-3 shadow-[0_2px_4px_rgba(0,0,0,0.07)] sm:gap-[18px] sm:pr-5 sm:pl-6 lg:pl-16">
          <button
            type="button"
            onClick={toggleGuide}
            aria-label="Guide"
            className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-chip lg:hidden"
          >
            <MenuIcon />
          </button>
          <form
            role="search"
            className="flex h-[41px] min-w-0 flex-1"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="channel-search" className="sr-only">
              Search
            </label>
            <input
              id="channel-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for cats, meows, and more..."
              className="min-w-0 flex-1 rounded-l-[22px] border border-field-border bg-background px-4 text-base text-ink outline-none placeholder:text-muted focus:border-[#1c62b9]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="grid h-full w-12 shrink-0 place-items-center rounded-r-[22px] border border-l-0 border-field-border bg-field hover:bg-hover sm:w-[74px]"
            >
              <SearchIcon />
            </button>
          </form>
          <button
            type="button"
            aria-label="Voice search"
            className="hidden size-[46px] shrink-0 place-items-center rounded-full bg-chip hover:bg-hover sm:grid"
          >
            <MicIcon />
          </button>
          <div className="flex shrink-0 items-center gap-3 sm:gap-[18px]">
            <p className="hidden w-[104px] -rotate-6 text-center font-script text-lg leading-[1.05] text-ink xl:block">
              Life is
              <br />
              Better with Cats
            </p>
            <ThemeToggle />
            <button
              type="button"
              aria-label="Notifications"
              className="grid size-10 place-items-center rounded-full hover:bg-chip"
            >
              <BellIcon />
            </button>
            <button
              type="button"
              aria-label="Account"
              className="size-[39px] overflow-hidden rounded-full"
            >
              <Image
                src="/channel/account.png"
                alt=""
                width={39}
                height={39}
                className="size-full object-cover"
              />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-10 sm:pr-5 sm:pl-4">
          <h1 className="sr-only">{channel.name}</h1>
          <section className="relative h-[180px] overflow-hidden rounded-[11px]">
            <Image
              src={channel.bannerImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_45%]"
            />
            <div className="absolute top-6 left-5 -rotate-[5deg] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:left-8">
              <p className="text-base leading-[1.15] font-bold sm:text-xl">
                CATS
                <br />
                MAKE
                <br />
                MUSIC
                <br />
                BRIGHTER
              </p>
              <p className="text-center text-2xl leading-none">♡</p>
            </div>
            <div className="absolute top-2 right-4 hidden w-[min(480px,46%)] -rotate-2 flex-col items-center text-[#fff0d6] md:flex lg:right-8">
              <div className="flex items-center gap-2 lg:gap-3">
                <p className="text-2xl leading-none lg:text-[31px]">♫</p>
                <p className="text-[clamp(28px,3vw,50px)] leading-none">{channel.name}</p>
                <p className="text-2xl leading-none lg:text-[31px]">♫</p>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <PawIcon className="size-10" />
                <p className="text-lg leading-[1.05] font-bold lg:text-[21px]">
                  Tiny Paws.
                  <br />
                  Big Melodies.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 pt-4 lg:flex-row lg:items-start lg:gap-5">
            <Image
              src={channel.avatarImage}
              alt=""
              width={128}
              height={128}
              className="size-24 shrink-0 rounded-full object-cover sm:size-[128px]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[32px] leading-none font-bold">{channel.name}</p>
                <CheckIcon />
                <span className="sr-only">Verified</span>
              </div>
              <p className="mt-2 text-base text-muted">{channel.subscribersLabel}</p>
              <p className="mt-1 max-w-[620px] text-sm leading-[1.4] text-muted">
                {channel.bio.join(" ")}{" "}
                <button
                  type="button"
                  onClick={() => setBioOpen((open) => !open)}
                  className="font-bold text-ink"
                >
                  {bioOpen ? "Show less" : "...more"}
                </button>
              </p>
              {bioOpen ? (
                <p className="mt-1 max-w-[620px] text-sm leading-[1.4] text-muted">
                  {channel.bioMore}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 lg:pt-10">
              <button
                type="button"
                aria-pressed={subscribed}
                onClick={() => setSubscribed((value) => !value)}
                className={`flex h-[43px] items-center gap-2.5 rounded-full px-5 text-base font-bold ${
                  subscribed ? "bg-chip text-ink" : "bg-ink text-background"
                }`}
              >
                <PawIcon className="size-[22px]" />
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
              <button
                type="button"
                aria-label="Like"
                className="grid size-[46px] place-items-center rounded-full bg-chip hover:bg-hover"
              >
                <ThumbIcon />
              </button>
              <button
                type="button"
                onClick={shareChannel}
                className="flex h-[43px] items-center gap-2.5 rounded-full bg-chip px-[18px] text-[15px] font-bold hover:bg-hover"
              >
                <AssetIcon src="/channel/icons/share.svg" />
                Share
              </button>
              <button
                type="button"
                aria-label="More actions"
                className="grid size-[46px] place-items-center rounded-full bg-chip hover:bg-hover"
              >
                <AssetIcon src="/channel/icons/ellipsis.svg" />
              </button>
            </div>
          </section>

          <div className="mt-4 flex h-[42px] items-end gap-6 overflow-x-auto border-b border-line pl-2 sm:gap-8">
            {channelTabs.map((item) => {
              const selected = item === tab;
              return (
                <button
                  key={item}
                  type="button"
                  aria-current={selected ? "page" : undefined}
                  onClick={() => setTab(item)}
                  className={`h-full shrink-0 border-b-[3px] px-0.5 text-[15px] ${
                    selected
                      ? "border-ink font-bold text-ink"
                      : "border-transparent text-muted"
                  }`}
                >
                  {item}
                </button>
              );
            })}
            <button
              type="button"
              aria-label="Search channel"
              onClick={() => document.getElementById("channel-search")?.focus()}
              className="mb-2 grid size-[21px] shrink-0 place-items-center"
            >
              <SearchIcon />
            </button>
          </div>

          {tab === "Home" || tab === "Videos" ? (
            <div className="pt-2">
              {nothingMatches ? (
                <div className="px-2 py-16 text-center">
                  <p className="text-lg font-medium">No videos found</p>
                  <p className="mt-1 text-sm text-muted">Try a different search.</p>
                </div>
              ) : (
                <>
                  {tab === "Home" && featuredVisible ? (
                    <div className="flex flex-col gap-4 py-2.5 sm:flex-row">
                      <Link
                        href={`/watch?v=${channel.featured.watchId}`}
                        className="outline-none focus-visible:ring-2 focus-visible:ring-ink"
                      >
                        <Thumbnail
                          video={channel.featured}
                          className="h-[180px] w-full shrink-0 sm:h-[140px] sm:w-[338px]"
                          overlayClassName="top-2 left-4 -rotate-6 text-[19px]"
                        />
                      </Link>
                      <span className="min-w-0 pt-0.5">
                        <Link
                          href={`/watch?v=${channel.featured.watchId}`}
                          className="block text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ink"
                        >
                          {channel.featured.title}
                        </Link>
                        <span className="mt-1 block text-[13px] text-muted">
                          {channel.featured.views} · {channel.featured.uploaded}
                        </span>
                        <Link
                          href={channelHref(channel.handle)}
                          className="mt-2 flex items-center gap-2 text-[13px] text-muted"
                        >
                          <Image
                            src={channel.creatorImage ?? channel.avatarImage}
                            alt=""
                            width={27}
                            height={27}
                            className="size-[27px] rounded-full object-cover"
                          />
                          {channel.name}
                          <CheckIcon />
                          <span className="sr-only">Verified</span>
                        </Link>
                        <span className="mt-2 block max-w-[620px] text-[13px] leading-[1.35] text-muted">
                          {channel.featured.description}
                        </span>
                      </span>
                    </div>
                  ) : null}

                  {visibleForYou.length > 0 ? (
                    <section className="pt-2">
                      <h2 className="py-1 text-xl font-bold">For You</h2>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                        {visibleForYou.map((video) => (
                          <ShelfCard
                            key={video.id}
                            video={video}
                            channelName={channel.name}
                            channelUrl={channelHref(channel.handle)}
                            thumbClassName="aspect-video w-full"
                            overlayClassName="top-1 left-3.5 -rotate-[4deg] text-[17px]"
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {visibleShelf.length > 0 ? (
                    <section className="mt-3 border-t border-line pt-2">
                      <div className="flex h-[34px] items-center gap-3">
                        <h2 className="text-xl font-bold">Videos</h2>
                        <Link
                          href={`/watch?v=${channel.featured.watchId}`}
                          className="flex items-center gap-1.5 text-[13px] font-bold"
                        >
                          <AssetIcon
                            src="/channel/icons/play-circle.svg"
                            className="size-3.5"
                          />
                          Play all
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                        {visibleShelf.map((video) => (
                          <ShelfCard
                            key={video.id}
                            video={video}
                            channelName={channel.name}
                            channelUrl={channelHref(channel.handle)}
                            thumbClassName="aspect-video w-full"
                            overlayClassName="top-1 left-3 -rotate-[4deg] text-sm"
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <div className="px-2 py-16 text-center">
              <p className="text-lg font-medium">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted">
                {channel.name} has not posted in {tab}.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
