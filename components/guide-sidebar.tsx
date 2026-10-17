"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CatFace } from "@/components/cat-face";
import {
  ChevronIcon,
  ClockIcon,
  HomeIcon,
  MeowmentsIcon,
  PawIcon,
  PlaylistIcon,
  PlayMark,
  ShortsIcon,
  SubscriptionsIcon,
  ThumbIcon,
} from "@/components/icons";
import { subscriptionsChanged } from "@/components/use-subscribe";
import { listSubscriptions } from "@/lib/subscribe-actions";
import { channelHref } from "@/lib/videos";
import type { SubscribedChannel } from "@/lib/subscriptions";

function GuideButton({
  label,
  icon,
  current = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  current?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className={`flex h-10 w-full items-center gap-6 rounded-lg px-3 text-left text-sm ${
        current ? "bg-chip font-medium" : "hover:bg-chip"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

export function GuideSidebar({
  mobileOpen,
  collapsed,
  youOpen,
  onToggleYou,
  onHome,
  onCloseMobile,
  homeCurrent = true,
  premiumCurrent = false,
  embedded = false,
}: {
  mobileOpen: boolean;
  collapsed: boolean;
  youOpen: boolean;
  onToggleYou: () => void;
  onHome: () => void;
  onCloseMobile: () => void;
  homeCurrent?: boolean;
  premiumCurrent?: boolean;
  embedded?: boolean;
}) {
  const pathname = usePathname();
  const subscriptionsCurrent = pathname === "/subscriptions";
  const studioCurrent = pathname === "/studio";
  const [channels, setChannels] = useState<SubscribedChannel[]>([]);

  useEffect(() => {
    let cancelled = false;
    function load() {
      listSubscriptions()
        .then((rows) => {
          if (!cancelled) setChannels(rows);
        })
        .catch(() => {
          if (!cancelled) setChannels([]);
        });
    }
    load();
    window.addEventListener(subscriptionsChanged, load);
    return () => {
      cancelled = true;
      window.removeEventListener(subscriptionsChanged, load);
    };
  }, []);

  return (
    <aside
      aria-label="Guide"
      className={
        embedded
          ? "flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-background px-3 pb-4"
          : `fixed bottom-0 left-0 top-[104px] z-40 w-[272px] shrink-0 flex-col overflow-y-auto bg-background px-3 py-3 sm:top-[68px] ${
              mobileOpen ? "flex" : "hidden"
            } ${collapsed ? "lg:hidden" : "lg:static lg:flex lg:h-full lg:min-h-0"}`
      }
    >
      <nav className="flex flex-col gap-0.5" aria-label="Primary">
        <GuideButton
          label="Home"
          icon={<HomeIcon filled={homeCurrent} />}
          current={homeCurrent}
          onClick={() => {
            onHome();
            onCloseMobile();
          }}
        />
        <GuideButton label="Shorts" icon={<ShortsIcon />} />
        <Link
          href="/subscriptions"
          onClick={onCloseMobile}
          aria-current={subscriptionsCurrent ? "page" : undefined}
          className={`flex h-10 w-full items-center gap-6 rounded-lg px-3 text-left text-sm ${
            subscriptionsCurrent ? "bg-chip font-medium" : "hover:bg-chip"
          }`}
        >
          <SubscriptionsIcon />
          <span className="truncate">Subscriptions</span>
        </Link>
      </nav>

      <div className="mt-3 border-t border-line pt-3">
        <button
          type="button"
          onClick={onToggleYou}
          aria-expanded={youOpen}
          className="flex h-9 items-center gap-1 rounded-lg px-3 text-base font-semibold hover:bg-chip"
        >
          You
          <ChevronIcon />
        </button>
        {youOpen ? (
          <div className="mt-1 flex flex-col gap-0.5">
            <Link
              href="/studio"
              onClick={onCloseMobile}
              aria-current={studioCurrent ? "page" : undefined}
              className={`flex h-10 w-full items-center gap-6 rounded-lg px-3 text-left text-sm ${
                studioCurrent ? "bg-chip font-medium" : "hover:bg-chip"
              }`}
            >
              <PawIcon className="size-6" />
              <span className="truncate">Your channel</span>
            </Link>
            <GuideButton label="Your Meowments" icon={<MeowmentsIcon />} />
            <GuideButton label="Watch Later" icon={<ClockIcon />} />
            <GuideButton label="Liked Kitties" icon={<ThumbIcon />} />
            <GuideButton label="Catlists" icon={<PlaylistIcon />} />
          </div>
        ) : null}
      </div>

      {channels.length > 0 ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className="px-3 py-2 text-base font-semibold">Subscriptions</p>
          <nav className="flex flex-col gap-0.5" aria-label="Subscribed channels">
            {channels.map((channel) => (
              <Link
                key={channel.slug}
                href={channelHref(channel.slug)}
                onClick={onCloseMobile}
                className="flex h-10 items-center gap-6 rounded-lg px-3 text-sm hover:bg-chip"
              >
                <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
                  <CatFace color={channel.avatar} innerEar={channel.innerEar} />
                </span>
                <span className="truncate">{channel.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      ) : null}

      <div className="mt-3 border-t border-line pt-3">
        <p className="px-3 py-2 text-base font-semibold">More from CatTube</p>
        <Link
          href="/premium"
          onClick={onCloseMobile}
          aria-current={premiumCurrent ? "page" : undefined}
          className={`flex w-full items-start gap-4 rounded-lg px-3 py-2 text-left hover:bg-chip ${
            premiumCurrent ? "bg-chip" : ""
          }`}
        >
          <span className="mt-0.5">
            <PlayMark className="h-4 w-6" />
          </span>
          <span>
            <span className="block text-sm font-medium">CatTube Premium</span>
            <span className="mt-0.5 block text-xs text-muted">
              More cats. Zero ads. (Maybe.)
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
