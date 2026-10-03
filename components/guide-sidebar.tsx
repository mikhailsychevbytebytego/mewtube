import type { ReactNode } from "react";
import {
  BulbIcon,
  ChevronIcon,
  ClockIcon,
  FlameIcon,
  GamepadIcon,
  HomeIcon,
  LiveIcon,
  MeowmentsIcon,
  MusicIcon,
  NewsIcon,
  PlaylistIcon,
  PlayMark,
  ShirtIcon,
  ShortsIcon,
  SubscriptionsIcon,
  ThumbIcon,
  TrophyIcon,
  VrIcon,
} from "@/components/icons";

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
  embedded = false,
}: {
  mobileOpen: boolean;
  collapsed: boolean;
  youOpen: boolean;
  onToggleYou: () => void;
  onHome: () => void;
  onCloseMobile: () => void;
  homeCurrent?: boolean;
  embedded?: boolean;
}) {
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
        <GuideButton label="Subscriptions" icon={<SubscriptionsIcon />} />
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
            <GuideButton label="Your Meowments" icon={<MeowmentsIcon />} />
            <GuideButton label="Watch Later" icon={<ClockIcon />} />
            <GuideButton label="Liked Kitties" icon={<ThumbIcon />} />
            <GuideButton label="Catlists" icon={<PlaylistIcon />} />
          </div>
        ) : null}
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <p className="px-3 py-2 text-base font-semibold">Explore</p>
        <div className="flex flex-col gap-0.5">
          <GuideButton label="Trending Meows" icon={<FlameIcon />} />
          <GuideButton label="Music for Cats" icon={<MusicIcon />} />
          <GuideButton label="Live Meows" icon={<LiveIcon />} />
          <GuideButton label="Gaming Cats" icon={<GamepadIcon />} />
          <GuideButton label="News from the Litter Box" icon={<NewsIcon />} />
          <GuideButton label="Sports Cats" icon={<TrophyIcon />} />
          <GuideButton label="Learning with Cats" icon={<BulbIcon />} />
          <GuideButton label="Fashionable Felines" icon={<ShirtIcon />} />
          <GuideButton label="360° Cat Videos" icon={<VrIcon />} />
        </div>
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <p className="px-3 py-2 text-base font-semibold">More from CatTube</p>
        <button
          type="button"
          className="flex w-full items-start gap-4 rounded-lg px-3 py-2 text-left hover:bg-chip"
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
        </button>
      </div>
    </aside>
  );
}
