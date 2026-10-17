import {
  TASTE_CLICK_BOOST,
  TASTE_WATCH_BOOST,
  TASTE_WATCH_STEP_MS,
  applyTasteScores,
  dimensionsForVideo,
} from "@/lib/taste";

const STORAGE_KEY = "cattube-taste-v1";

export type TasteSignalKind = "click" | "watch";

export type TasteLastSignal = {
  kind: TasteSignalKind;
  title: string;
  slug: string;
  boosted: string[];
  watchSeconds: number;
  at: number;
};

export type TasteProfile = {
  scores: Record<string, number>;
  signals: number;
  last: TasteLastSignal | null;
};

const emptyProfile: TasteProfile = { scores: {}, signals: 0, last: null };

let profile: TasteProfile = emptyProfile;
let hydrated = false;
const listeners = new Set<() => void>();
const recentClicks = new Map<string, number>();

function readStored(): TasteProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile;
    const parsed = JSON.parse(raw) as Partial<TasteProfile>;
    const scores: Record<string, number> = {};
    for (const [id, value] of Object.entries(parsed.scores ?? {})) {
      if (typeof value === "number" && value >= 0.01) scores[id] = value;
    }
    const last = parsed.last;
    return {
      scores,
      signals: typeof parsed.signals === "number" ? parsed.signals : 0,
      last:
        last && typeof last.title === "string" && typeof last.slug === "string"
          ? {
              kind: last.kind === "watch" ? "watch" : "click",
              title: last.title,
              slug: last.slug,
              boosted: Array.isArray(last.boosted) ? last.boosted.filter((id) => typeof id === "string") : [],
              watchSeconds: typeof last.watchSeconds === "number" ? last.watchSeconds : 0,
              at: typeof last.at === "number" ? last.at : Date.now(),
            }
          : null,
    };
  } catch {
    return emptyProfile;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  profile = readStored();
}

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  for (const listener of listeners) listener();
}

export function subscribeTaste(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTasteProfile() {
  hydrate();
  return profile;
}

export function getServerTasteProfile() {
  return emptyProfile;
}

export function resetTasteProfile() {
  profile = emptyProfile;
  recentClicks.clear();
  emit();
}

export function recordTasteSignal(
  video: {
    slug?: string;
    title: string;
    hashtags?: string[];
    categories?: string[];
  },
  kind: TasteSignalKind,
) {
  hydrate();
  const slug = video.slug ?? video.title;
  if (kind === "click") {
    const now = Date.now();
    const previous = recentClicks.get(slug) ?? 0;
    if (now - previous < 1500) return;
    recentClicks.set(slug, now);
  }

  const boosted = dimensionsForVideo(video).map((dimension) => dimension.id);
  if (boosted.length === 0) return;

  const stepSeconds = TASTE_WATCH_STEP_MS / 1000;
  const watchSeconds =
    kind === "watch"
      ? (profile.last?.slug === slug ? profile.last.watchSeconds : 0) + stepSeconds
      : 0;

  profile = {
    scores: applyTasteScores(
      profile.scores,
      boosted,
      kind === "click" ? TASTE_CLICK_BOOST : TASTE_WATCH_BOOST,
    ),
    signals: profile.signals + 1,
    last: {
      kind,
      title: video.title,
      slug,
      boosted,
      watchSeconds,
      at: Date.now(),
    },
  };
  emit();
}
