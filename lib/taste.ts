export type TasteGroup = "Style" | "Action" | "Sports" | "Music" | "Cats";

export type TasteDimension = {
  id: string;
  label: string;
  group: TasteGroup;
  keywords: string[];
};

export const tasteDimensions = [
  { id: "cyberpunk", label: "Cyberpunk", group: "Style", keywords: ["cyberpunk"] },
  { id: "neon-nights", label: "Neon nights", group: "Style", keywords: ["neon", "vaporwave"] },
  { id: "fantasy", label: "Fantasy", group: "Style", keywords: ["fantasy", "wizard", "storybook"] },
  { id: "wizards", label: "Wizards", group: "Style", keywords: ["wizard", "moonlight"] },
  { id: "anime", label: "Anime", group: "Style", keywords: ["anime"] },
  { id: "sakura", label: "Cherry blossoms", group: "Style", keywords: ["sakura", "cherry", "petal"] },
  { id: "magical-girl", label: "Magical heroes", group: "Style", keywords: ["magical", "wand"] },
  { id: "mecha", label: "Mecha", group: "Style", keywords: ["mecha", "robot"] },
  { id: "tournaments", label: "Tournaments", group: "Style", keywords: ["tournament", "arena"] },
  { id: "noir", label: "Noir", group: "Style", keywords: ["noir"] },
  { id: "detective", label: "Detective stories", group: "Style", keywords: ["detective", "sardine", "case of"] },
  { id: "western", label: "Westerns", group: "Style", keywords: ["western", "high noon"] },
  { id: "space-opera", label: "Space opera", group: "Style", keywords: ["space", "starship"] },
  { id: "steampunk", label: "Steampunk", group: "Style", keywords: ["steampunk", "airship"] },
  { id: "gothic", label: "Gothic", group: "Style", keywords: ["gothic", "manor"] },
  { id: "ghibli", label: "Pastoral animation", group: "Style", keywords: ["ghibli", "painted"] },
  { id: "pixel-art", label: "Pixel art", group: "Style", keywords: ["pixel"] },
  { id: "ukiyo-e", label: "Woodblock prints", group: "Style", keywords: ["ukiyo", "woodblock", "great wave"] },
  { id: "art-deco", label: "Art deco", group: "Style", keywords: ["art deco", "ballroom"] },
  { id: "vaporwave", label: "Vaporwave", group: "Style", keywords: ["vaporwave"] },
  { id: "superheroes", label: "Superheroes", group: "Style", keywords: ["superhero", "cape"] },
  { id: "comic-books", label: "Comic books", group: "Style", keywords: ["comic"] },
  { id: "underwater", label: "Underwater", group: "Style", keywords: ["reef", "diving", "underwater"] },
  { id: "wasteland", label: "Wasteland", group: "Style", keywords: ["wasteland", "highway"] },
  { id: "storybook", label: "Storybooks", group: "Style", keywords: ["storybook", "mushroom"] },
  { id: "disco", label: "Disco", group: "Style", keywords: ["disco"] },
  { id: "ink-wash", label: "Ink wash", group: "Style", keywords: ["sumi", "ink"] },
  { id: "claymation", label: "Claymation", group: "Style", keywords: ["clay"] },
  { id: "shakespeare", label: "Stage drama", group: "Style", keywords: ["shakespeare", "shakespean", "drama"] },
  { id: "action", label: "Action", group: "Action", keywords: ["action"] },
  { id: "chases", label: "Chases", group: "Action", keywords: ["chase", "sprint"] },
  { id: "spy", label: "Spy stories", group: "Action", keywords: ["spy", "laser hall"] },
  { id: "rooftops", label: "Rooftops", group: "Action", keywords: ["rooftop", "skyline"] },
  { id: "trains", label: "Trains", group: "Action", keywords: ["train"] },
  { id: "sports", label: "Sports", group: "Sports", keywords: ["sport", "soccer", "boxing", "skate"] },
  { id: "soccer", label: "Soccer", group: "Sports", keywords: ["soccer"] },
  { id: "skateboarding", label: "Skateboarding", group: "Sports", keywords: ["skate"] },
  { id: "boxing", label: "Boxing", group: "Sports", keywords: ["boxing"] },
  { id: "agility", label: "Agility", group: "Sports", keywords: ["agility"] },
  { id: "music-videos", label: "Music videos", group: "Music", keywords: ["music video"] },
  { id: "pop", label: "Pop stages", group: "Music", keywords: ["chorus", "pop"] },
  { id: "ballads", label: "Ballads", group: "Music", keywords: ["ballad"] },
  { id: "dance", label: "Dance", group: "Music", keywords: ["dance"] },
  { id: "punk", label: "Punk", group: "Music", keywords: ["punk"] },
  { id: "live-shows", label: "Live shows", group: "Music", keywords: ["concert", "basement", "front row"] },
  { id: "metal", label: "Metal", group: "Music", keywords: ["metal"] },
  { id: "guitar", label: "Guitar", group: "Music", keywords: ["guitar", "solo"] },
  { id: "drums", label: "Drums", group: "Music", keywords: ["drum"] },
  { id: "piano", label: "Piano", group: "Music", keywords: ["piano"] },
  { id: "singing", label: "Singing", group: "Music", keywords: ["singing", "audition", "meow-sical"] },
  { id: "kittens", label: "Kittens", group: "Cats", keywords: ["kitten"] },
  { id: "funny-fails", label: "Funny fails", group: "Cats", keywords: ["fail", "compilation"] },
  { id: "compilations", label: "Compilations", group: "Cats", keywords: ["compilation"] },
  { id: "asmr", label: "ASMR", group: "Cats", keywords: ["asmr", "purr"] },
  { id: "cooking", label: "Cooking", group: "Cats", keywords: ["cook", "bak", "chef", "kitchen"] },
  { id: "food", label: "Food tasting", group: "Cats", keywords: ["food", "kibble", "spaghetti", "gourmet"] },
  { id: "gaming", label: "Gaming", group: "Cats", keywords: ["gaming", "game", "ipad"] },
  { id: "sleepy", label: "Sleepy cats", group: "Cats", keywords: ["sleep", "nap", "snooze", "lazy"] },
  { id: "meditation", label: "Meditation", group: "Cats", keywords: ["meditat", "zen"] },
  { id: "smart-tricks", label: "Smart tricks", group: "Cats", keywords: ["clever", "genius", "fetch"] },
  { id: "boxes", label: "Boxes", group: "Cats", keywords: ["box"] },
  { id: "zoomies", label: "Zoomies", group: "Cats", keywords: ["zoomies", "laser pointer"] },
  { id: "reactions", label: "Reactions", group: "Cats", keywords: ["reaction", "mirror", "cucumber"] },
  { id: "snow", label: "Snow", group: "Cats", keywords: ["snow"] },
  { id: "travel", label: "Travel", group: "Cats", keywords: ["travel", "backpack", "adventure"] },
  { id: "bath-time", label: "Bath time", group: "Cats", keywords: ["bath"] },
  { id: "play", label: "Playtime", group: "Cats", keywords: ["play", "toy", "tail"] },
  { id: "rain", label: "Rain", group: "Cats", keywords: ["rain"] },
  { id: "city", label: "City life", group: "Cats", keywords: ["city", "alley"] },
  { id: "mornings", label: "Lazy mornings", group: "Cats", keywords: ["morning"] },
  { id: "gadgets", label: "Gadgets", group: "Cats", keywords: ["printer", "ipad", "door"] },
  { id: "board-games", label: "Board games", group: "Cats", keywords: ["checkers", "board game"] },
] as const satisfies readonly TasteDimension[];

export type TasteDimensionId = (typeof tasteDimensions)[number]["id"];

export const TASTE_DECAY = 0.98;
export const TASTE_CLICK_BOOST = 1;
export const TASTE_WATCH_BOOST = 0.4;
export const TASTE_WATCH_STEP_MS = 5000;

const dimensionIds = new Set<string>(tasteDimensions.map((dimension) => dimension.id));

const tasteBySlug: Record<string, readonly TasteDimensionId[]> = {
  "cyberpunk-neon-alley": ["cyberpunk", "neon-nights", "rain", "city"],
  "cyberpunk-cat-video": ["cyberpunk", "neon-nights", "city"],
  "fantasy-castle-wizard": ["fantasy", "wizards"],
  "anime-cherry-sprint": ["anime", "sakura", "chases"],
  "noir-blind-shadows": ["noir", "detective", "city"],
  "western-dust-standoff": ["western", "action"],
  "space-opera-helm": ["space-opera"],
  "steampunk-airship-deck": ["steampunk"],
  "gothic-candle-manor": ["gothic"],
  "ghibli-hill-wind": ["ghibli", "sleepy"],
  "pixel-dungeon-pounce": ["pixel-art", "gaming", "action"],
  "ukiyoe-great-wave": ["ukiyo-e"],
  "art-deco-ballroom": ["art-deco", "dance"],
  "vaporwave-palm-grid": ["vaporwave", "neon-nights"],
  "comic-rooftop-cape": ["comic-books", "superheroes", "rooftops"],
  "reef-diving-helmet": ["underwater"],
  "wasteland-scarf-cat": ["wasteland", "action"],
  "storybook-mushroom-wood": ["storybook", "fantasy"],
  "disco-mirror-ball": ["disco", "dance"],
  "sumi-e-mountain-cat": ["ink-wash", "sleepy"],
  "clay-kitchen-baker": ["claymation", "cooking"],
  "anime-mecha-launch": ["anime", "mecha", "action"],
  "anime-magical-leap": ["anime", "magical-girl"],
  "anime-tournament-clash": ["anime", "tournaments", "action"],
  "superhero-skyline-cape": ["superheroes", "city", "rooftops"],
  "superhero-team-rooftop": ["superheroes", "comic-books", "rooftops"],
  "superhero-alley-sprint": ["superheroes", "action", "chases", "city"],
  "action-rooftop-chase": ["action", "chases", "rooftops"],
  "action-train-top": ["action", "trains", "chases"],
  "action-spy-corridor": ["spy", "action"],
  "sports-soccer-strike": ["sports", "soccer"],
  "sports-skate-bowl": ["sports", "skateboarding"],
  "sports-boxing-ring": ["sports", "boxing"],
  "music-video-neon-chorus": ["music-videos", "pop", "neon-nights"],
  "music-video-rain-ballad": ["music-videos", "ballads", "rain"],
  "music-video-dance-break": ["music-videos", "dance", "pop"],
  "punk-basement-show": ["punk", "live-shows"],
  "punk-alley-gig": ["punk", "live-shows", "city"],
  "metal-stage-solo": ["metal", "guitar", "live-shows"],
  "metal-crowd-barrier": ["metal", "live-shows"],
  "metal-drum-riser": ["metal", "drums", "live-shows"],
  "cat-learns-to-open-door": ["smart-tricks", "gadgets"],
  "epic-cat-fail-compilation-volume-1": ["funny-fails", "compilations"],
  "kitten-attack-feet": ["kittens", "play"],
  "cat-on-a-skateboard": ["skateboarding", "sports", "smart-tricks"],
  "cat-food-critic-tasting": ["food"],
  "kitten-vs-cucumber": ["kittens", "funny-fails", "reactions"],
  "sleepy-cat-snooze-compilation": ["sleepy", "compilations"],
  "cat-eats-spaghetti": ["food", "funny-fails"],
  "gaming-cat-epic-fail": ["gaming", "funny-fails"],
  "cat-hides-in-boxes": ["boxes", "funny-fails"],
  "cat-plays-piano": ["piano", "singing", "smart-tricks"],
  "cat-vs-printer": ["gadgets", "funny-fails"],
  "cat-meditates": ["meditation", "sleepy"],
  "cat-tries-new-food": ["food", "cooking"],
  "lazy-cat-morning-routine": ["mornings", "sleepy"],
  "cat-travel-bag-adventure": ["travel"],
  "cat-talent-show-singing": ["singing", "live-shows"],
  "shakespean-drama": ["shakespeare"],
  "cat-plays-board-game": ["board-games", "gaming", "smart-tricks"],
  "orange-kitten-bats-a-paper-airplane": ["kittens", "play"],
  "kitten-tries-to-catch-own-tail": ["kittens", "play", "funny-fails"],
  "cat-sees-snow": ["snow", "reactions"],
  "cat-talent-show-agility": ["agility", "sports"],
  "asmr-brushing-cat": ["asmr", "sleepy"],
  "asmr-crunchy-kibble": ["asmr", "food"],
  "laser-pointer-zoomies": ["zoomies", "play"],
  "cat-reacts-to-mirror": ["reactions"],
  "rainy-day-indoor-games": ["rain", "play"],
  "kitten-first-bath": ["kittens", "bath-time"],
  "cat-sleep-meditation": ["meditation", "sleepy", "asmr"],
  "cat-in-a-backpack": ["travel", "city"],
  "cat-plays-fetch-like-a-dog": ["play", "smart-tricks"],
  "cat-chef-bakes-cookies": ["cooking", "food"],
  "cat-plays-ipad-game": ["gaming", "gadgets"],
};

function assertTasteCatalog() {
  if (tasteDimensions.length < 64) {
    throw new Error(`Expected at least 64 taste dimensions, got ${tasteDimensions.length}.`);
  }
  if (dimensionIds.size !== tasteDimensions.length) {
    throw new Error("Taste dimension ids must be unique.");
  }
  for (const [slug, ids] of Object.entries(tasteBySlug)) {
    for (const id of ids) {
      if (!dimensionIds.has(id)) throw new Error(`${slug} uses unknown taste ${id}.`);
    }
  }
}

assertTasteCatalog();

const byId = new Map(tasteDimensions.map((dimension) => [dimension.id, dimension]));

export function tasteDimension(id: string) {
  return byId.get(id);
}

export function isTasteMapped(slug: string) {
  return Object.prototype.hasOwnProperty.call(tasteBySlug, slug);
}

export function dimensionsForVideo(video: {
  slug?: string;
  title: string;
  hashtags?: string[];
  categories?: string[];
}) {
  const mapped = video.slug ? tasteBySlug[video.slug] : undefined;
  if (mapped) {
    return mapped.map((id) => byId.get(id)).filter((dimension) => dimension !== undefined);
  }

  const haystack = [video.title, ...(video.hashtags ?? []), ...(video.categories ?? [])]
    .join(" ")
    .toLowerCase();
  return tasteDimensions.filter((dimension) =>
    dimension.keywords.some((keyword) => haystack.includes(keyword)),
  );
}

export function topTastes(scores: Record<string, number>, limit = 3) {
  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id, score]) => ({
      id,
      label: byId.get(id)?.label ?? id,
      score,
    }));
}

export function recommendByTaste<
  T extends {
    slug?: string;
    title: string;
    hashtags?: string[];
    categories?: string[];
  },
>(videos: readonly T[], scores: Record<string, number>, limit = 8) {
  const tastes = topTastes(scores, 3);
  if (tastes.length === 0) return { tastes, videos: [] as T[] };
  const weights = new Map(tastes.map((taste) => [taste.id, taste.score]));
  const ranked = videos
    .map((video) => ({
      video,
      overlap: dimensionsForVideo(video).reduce(
        (sum, dimension) => sum + (weights.get(dimension.id) ?? 0),
        0,
      ),
    }))
    .filter((item) => item.overlap > 0)
    .sort(
      (a, b) => b.overlap - a.overlap || a.video.title.localeCompare(b.video.title),
    );
  return { tastes, videos: ranked.slice(0, limit).map((item) => item.video) };
}

export function applyTasteScores(
  scores: Record<string, number>,
  activeIds: readonly string[],
  boost: number,
) {
  const active = new Set(activeIds);
  const next: Record<string, number> = {};
  for (const dimension of tasteDimensions) {
    const current = scores[dimension.id] ?? 0;
    if (active.has(dimension.id)) {
      next[dimension.id] = current + boost;
      continue;
    }
    if (current <= 0) continue;
    const faded = current * TASTE_DECAY;
    if (faded >= 0.01) next[dimension.id] = faded;
  }
  return next;
}
