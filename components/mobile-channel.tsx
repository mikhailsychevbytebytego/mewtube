"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GuideSidebar } from "@/components/guide-sidebar";
import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  MenuIcon,
  PawIcon,
  PlayMark,
  SearchIcon,
} from "@/components/icons";
import {
  channelBio,
  channelTabs,
  featuredVideo,
  type ChannelTab,
  type ChannelVideo,
} from "@/lib/channel";

const compactOverlay: Record<string, string[]> = {
  prelude: ["PAWS AND", "PRELUDE ♫"],
  sonata: ["SLEEPY CAT", "SONATA Zzz"],
  scales: ["CURIOUS KITTEN", "PRACTICES SCALES"],
  duet: ["A MEOWSICAL", "DUET ♡"],
  composes: ["KITTEN", "COMPOSES", "A SONG?"],
  elise: ["FUR", "ELISE?"],
  hour: ["PIANO MUSIC", "FOR RELAXING", "CATS"],
  classics: ["KITTY JAMS", "TO CLASSICS ♫"],
  practice: ["TINY PAWS", "BIG PROGRESS"],
  christmas: ["MEOWY", "CHRISTMAS! ♫"],
};

const mobileTitle: Record<string, string> = {
  sonata: "Sleepy Cat Sonata — Relaxing Piano Music for Cats",
  duet: "A Meowsical Duet — Two Kittens, One Piano",
  hour: "1 Hour of Relaxing Piano Music for Cats",
  practice: "Practice Makes Purrfect — A Kitten's Piano Journey",
  christmas: "Meowy Christmas — Holiday Piano Special",
};

const mobileStats: Record<string, string> = {
  composes: "892K views · 5 days ago",
  elise: "1.2M views · 1 week ago",
  hour: "6.8M views · 2 months ago",
  classics: "2.4M views · 2 weeks ago",
  practice: "3.1M views · 3 weeks ago",
  christmas: "4.7M views · 9 months ago",
};

function cardTitle(video: ChannelVideo) {
  return mobileTitle[video.id] ?? (video.subtitle ? `${video.title} ${video.subtitle}` : video.title);
}

function cardAuthor(video: ChannelVideo) {
  return video.id === "hour" ? "Music for Cats" : "Meowestro";
}

function cardStats(video: ChannelVideo) {
  return (
    mobileStats[video.id] ??
    (video.views && video.uploaded ? `${video.views} · ${video.uploaded}` : "")
  );
}

function StatusIcon({ src, className }: { src: string; className: string }) {
  return <img src={src} alt="" className={`${className} dark:invert`} />;
}

function PhoneCard({ video }: { video: ChannelVideo }) {
  const author = cardAuthor(video);
  return (
    <article className="min-w-0">
      <div className="relative h-[99px] overflow-hidden rounded-[10px] bg-[#1a120c]">
        <Image src={video.image} alt="" fill sizes="180px" className="object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.64),rgba(0,0,0,0)_72%)]" />
        <div className="absolute top-[9px] left-[9px] w-[88px] text-[12px] leading-[1.02] font-bold text-white">
          {(compactOverlay[video.id] ?? video.overlay).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <span className="absolute right-[5px] bottom-[5px] rounded-[4px] bg-black/85 px-1 py-0.5 text-[10px] font-bold text-white">
          {video.duration}
        </span>
      </div>
      <p className="mt-[7px] line-clamp-2 text-[14px] leading-[1.18] font-bold">{cardTitle(video)}</p>
      <p className="mt-[7px] flex items-center gap-1 text-[12px] text-muted">
        {author}
        {author === "Meowestro" ? <CheckIcon /> : null}
      </p>
      <p className="text-[12px] text-muted">{cardStats(video)}</p>
    </article>
  );
}

export function MobileChannel({
  query,
  onQueryChange,
  mobileOpen,
  onToggleGuide,
  onCloseGuide,
  youOpen,
  onToggleYou,
  onHome,
  tab,
  onTab,
  subscribed,
  onSubscribe,
  bioOpen,
  onToggleBio,
  onShare,
  visibleForYou,
  visibleShelf,
  featuredVisible,
  nothingMatches,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  mobileOpen: boolean;
  onToggleGuide: () => void;
  onCloseGuide: () => void;
  youOpen: boolean;
  onToggleYou: () => void;
  onHome: () => void;
  tab: ChannelTab;
  onTab: (tab: ChannelTab) => void;
  subscribed: boolean;
  onSubscribe: () => void;
  bioOpen: boolean;
  onToggleBio: () => void;
  onShare: () => void;
  visibleForYou: ChannelVideo[];
  visibleShelf: ChannelVideo[];
  featuredVisible: boolean;
  nothingMatches: boolean;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-ink">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close guide"
          className="fixed inset-0 z-30 bg-black/40"
          onClick={onCloseGuide}
        />
      ) : null}
      {mobileOpen ? (
        <GuideSidebar
          mobileOpen
          collapsed={false}
          youOpen={youOpen}
          onToggleYou={onToggleYou}
          onHome={onHome}
          onCloseMobile={onCloseGuide}
          homeCurrent={false}
          phoneDrawer
        />
      ) : null}

      <header className="shrink-0 bg-background shadow-[0_2px_4px_rgba(0,0,0,0.07)]">
        <div className="flex h-11 items-center justify-between px-[18px]">
          <p className="text-sm font-bold">9:41</p>
          <div className="flex items-center gap-[5px]">
            <StatusIcon src="/phone/signal.svg" className="size-[18px]" />
            <StatusIcon src="/phone/wifi.svg" className="size-[18px]" />
            <StatusIcon src="/phone/battery.svg" className="h-[18px] w-[25px]" />
          </div>
        </div>
        <div className="flex h-[60px] items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Guide" onClick={onToggleGuide} className="grid size-6 place-items-center">
              <MenuIcon />
            </button>
            <Link href="/" className="flex items-center gap-[7px]" onClick={onHome}>
              <PlayMark className="h-[29px] w-[39px]" />
              <span className="leading-none">
                <span className="block text-[20px] font-bold">CatTube</span>
                <span className="block text-[8px]">Good Cats. Better Days.</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="grid size-6 place-items-center"
            >
              <SearchIcon />
            </button>
            <button type="button" aria-label="Notifications" className="grid size-6 place-items-center">
              <BellIcon />
            </button>
            <button type="button" aria-label="Account" className="size-[31px] overflow-hidden rounded-full">
              <Image
                src="/channel/account.png"
                alt=""
                width={31}
                height={31}
                className="size-full object-cover"
              />
            </button>
          </div>
        </div>
        {searchOpen ? (
          <form className="px-4 pb-3" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="channel-search-phone" className="sr-only">
              Search
            </label>
            <input
              id="channel-search-phone"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search for cats, meows, and more..."
              className="h-10 w-full rounded-full border border-field-border bg-background px-4 text-base text-ink outline-none placeholder:text-muted"
            />
          </form>
        ) : null}
      </header>

      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <h1 className="sr-only">Meowestro</h1>
        <section className="relative h-[120px] overflow-hidden">
          <Image
            src="/channel/banner.png"
            alt=""
            fill
            priority
            sizes="390px"
            className="object-cover object-[center_40%]"
          />
          <div className="absolute top-3 left-[18px] -rotate-[5deg] text-[13px] leading-[1.08] font-bold text-white">
            <p>CATS</p>
            <p>MAKE</p>
            <p>MUSIC</p>
            <p>BRIGHTER</p>
            <p>♡</p>
          </div>
        </section>

        <section className="flex flex-col gap-3 px-4 pt-3.5 pb-3">
          <div className="flex items-center gap-3.5">
            <Image
              src="/channel/avatar.png"
              alt=""
              width={80}
              height={80}
              className="size-20 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[26px] leading-none font-bold">
                Meowestro
                <CheckIcon />
              </p>
              <p className="mt-1 text-[13px] text-muted">@meowestro</p>
              <p className="text-[13px] text-muted">2.1M subscribers · 312 videos</p>
            </div>
          </div>
          <p className="text-[14px] leading-[1.38] text-muted">
            {bioOpen ? (
              <>
                {channelBio[0]} {channelBio[1]}{" "}
              </>
            ) : (
              <>
                Tiny paws on big keys. Adorable cats making beautiful music! 🎹 🐱 From first notes to
                full meow-symphonies…{" "}
              </>
            )}
            <button type="button" onClick={onToggleBio} className="font-bold text-ink">
              {bioOpen ? "less" : "more"}
            </button>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={subscribed}
              onClick={onSubscribe}
              className="flex h-[42px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-bold text-background"
            >
              <PawIcon className="size-[18px]" />
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
            <button
              type="button"
              onClick={onShare}
              className="flex h-[42px] w-[102px] shrink-0 items-center justify-center gap-[7px] rounded-full bg-chip text-[14px] font-bold"
            >
              <img src="/channel/icons/share.svg" alt="" className="size-[18px] dark:invert" />
              Share
            </button>
            <button
              type="button"
              aria-label="More actions"
              className="grid size-[42px] shrink-0 place-items-center rounded-full bg-chip"
            >
              <img src="/channel/icons/ellipsis.svg" alt="" className="size-5 dark:invert" />
            </button>
          </div>
        </section>

        <div className="no-scrollbar flex h-[46px] items-end gap-3 overflow-x-auto border-b border-line px-3">
          {channelTabs.map((item) => {
            const selected = item === tab;
            return (
              <button
                key={item}
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => onTab(item)}
                className={`flex h-full shrink-0 flex-col items-center justify-between pt-3 text-[13px] ${
                  selected ? "font-bold text-ink" : "text-muted"
                }`}
              >
                {item}
                <span className={`h-[3px] w-full min-w-[38px] rounded-[2px] ${selected ? "bg-ink" : ""}`} />
              </button>
            );
          })}
        </div>

        {tab === "Home" || tab === "Videos" ? (
          nothingMatches ? (
            <div className="px-4 py-16 text-center">
              <p className="text-lg font-medium">No videos found</p>
              <p className="mt-1 text-sm text-muted">Try a different search.</p>
            </div>
          ) : (
            <>
              {tab === "Home" && featuredVisible ? (
                <section className="flex flex-col gap-3 border-b border-line px-4 pt-4 pb-5">
                  <Link href={`/watch?v=${featuredVideo.watchId}`} className="block">
                    <div className="relative h-[201px] overflow-hidden rounded-[10px] bg-[#1a120c]">
                      <Image
                        src={featuredVideo.image}
                        alt=""
                        fill
                        sizes="390px"
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-[18px] -rotate-6 text-[22px] leading-[1.04] font-bold text-white">
                        {featuredVideo.overlay.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                      <span className="absolute right-[7px] bottom-[7px] rounded-[4px] bg-black/85 px-1 py-0.5 text-[10px] font-bold text-white">
                        {featuredVideo.duration}
                      </span>
                    </div>
                    <div className="mt-3 flex items-start gap-2.5">
                      <Image
                        src="/channel/creator.png"
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] leading-[1.25] font-bold">{featuredVideo.title}</span>
                        <span className="mt-1 block text-[13px] text-muted">
                          Meowestro ✓ · {featuredVideo.views} · {featuredVideo.uploaded}
                        </span>
                        <span className="mt-1 block text-[13px] leading-[1.35] text-muted">
                          This tiny kitten is learning to play the piano, and it&apos;s the cutest thing
                          you&apos;ll see today! 🎹 🐱
                        </span>
                      </span>
                      <span className="grid h-[26px] w-5 shrink-0 place-items-center">
                        <img
                          src="/phone/ellipsis-vertical.svg"
                          alt=""
                          className="size-[18px] dark:invert"
                        />
                      </span>
                    </div>
                  </Link>
                </section>
              ) : null}

              {tab === "Home" && visibleForYou.length > 0 ? (
                <section className="flex flex-col gap-4 px-4 pt-5 pb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[20px] font-bold">For You</h2>
                    <button
                      type="button"
                      onClick={() => onTab("Videos")}
                      className="flex items-center gap-1 text-[13px] font-bold text-muted [&_svg]:size-4"
                    >
                      View all
                      <ChevronRightIcon />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-[18px]">
                    {visibleForYou.map((video) => (
                      <PhoneCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              ) : null}

              {visibleShelf.length > 0 ? (
                <section className="border-t border-line px-4 pt-5 pb-7">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[20px] font-bold">Videos</h2>
                    <Link
                      href={`/watch?v=${featuredVideo.watchId}`}
                      className="flex items-center gap-1 text-[13px] font-bold text-muted [&_svg]:size-4"
                    >
                      Play all
                      <ChevronRightIcon />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-[18px]">
                    {visibleShelf.map((video) => (
                      <PhoneCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )
        ) : (
          <div className="px-4 py-16 text-center">
            <p className="text-lg font-medium">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted">Meowestro has not posted in {tab}.</p>
          </div>
        )}

        <nav className="flex h-[72px] items-start border-t border-line px-4 pt-2 pb-2.5" aria-label="Phone">
          <Link href="/" className="flex flex-1 flex-col items-center gap-1 text-[10px] font-bold text-ink">
            <img src="/phone/home.svg" alt="" className="size-[22px] dark:invert" />
            Home
          </Link>
          <button type="button" className="flex flex-1 flex-col items-center gap-1 text-[10px] text-muted">
            <img src="/phone/shorts.svg" alt="" className="size-[22px] opacity-70 dark:invert" />
            Shorts
          </button>
          <button type="button" className="flex flex-1 flex-col items-center gap-1 text-[10px] text-muted">
            <img src="/phone/subscriptions.svg" alt="" className="size-[22px] opacity-70 dark:invert" />
            Subscriptions
          </button>
          <button type="button" className="flex flex-1 flex-col items-center gap-1 text-[10px] text-muted">
            <img src="/phone/you.svg" alt="" className="size-[22px] opacity-70 dark:invert" />
            You
          </button>
        </nav>
      </main>
    </div>
  );
}
