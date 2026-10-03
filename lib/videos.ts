export const categories = [
  "All",
  "Kittens",
  "Funny Cats",
  "Cat Compilations",
  "Cat ASMR",
  "Cats Cooking",
  "Gaming Cats",
  "Dramatic Cats",
  "Sleepy Cats",
  "Smart Cats",
] as const;

export type CategoryFilter = (typeof categories)[number];

export type VideoCategory = Exclude<CategoryFilter, "All">;

export function watchHref(video: { slug?: string; id: string }) {
  return `/watch?v=${video.slug ?? video.id}`;
}

export function channelHref(handle: string | undefined) {
  return handle ? `/@${handle}` : "/";
}

export type Video = {
  id: string;
  slug?: string;
  title: string;
  channel: string;
  channelHandle?: string;
  hasChannelPage?: boolean;
  views: string;
  uploaded: string;
  duration: string;
  categories: VideoCategory[];
  avatar: string;
  innerEar: string;
  thumbnail?: string;
  playbackUrl?: string | null;
  poster?: string | null;
  likes?: string | null;
  hashtags?: string[];
  paragraphs?: string[];
  descriptionMore?: string | null;
  commentCount?: number;
  subscribers?: string | null;
};

export const videos: Video[] = [
  {
    id: "piano",
    title: "Tiny Kitten Learns to Play Piano (And It's Adorable!)",
    channel: "Meowestro",
    views: "2.1M views",
    uploaded: "2 weeks ago",
    duration: "3:24",
    categories: ["Kittens", "Smart Cats"],
    avatar: "#c4b8ae",
    innerEar: "#e7b7c2",
  },
  {
    id: "summer",
    title: "Cool Cats, Warm Vibes 😎 A Summer Compilation",
    channel: "Solar Meows",
    views: "1.3M views",
    uploaded: "10 days ago",
    duration: "4:12",
    categories: ["Cat Compilations", "Funny Cats"],
    avatar: "#ef8b3a",
    innerEar: "#f3c1b0",
  },
  {
    id: "gravity",
    title: "Cats Knocking Things Over (Again)",
    channel: "Chaos Whiskers",
    views: "4.8M views",
    uploaded: "3 weeks ago",
    duration: "2:56",
    categories: ["Funny Cats"],
    avatar: "#8e8e8e",
    innerEar: "#f0b7c4",
  },
  {
    id: "jump",
    title: "Epic Cat Jumps in Slow Motion (Absolute Cinema)",
    channel: "The Feline Edit",
    views: "1.9M views",
    uploaded: "12 days ago",
    duration: "5:17",
    categories: ["Funny Cats"],
    avatar: "#d9d0c6",
    innerEar: "#efc0cb",
  },
  {
    id: "sleepy",
    title: "Sleepy Cats Compilation 😴 Soft Paws, Sweet Dreams",
    channel: "Nap Kingdom",
    views: "3.5M views",
    uploaded: "1 month ago",
    duration: "8:03",
    categories: ["Sleepy Cats", "Cat ASMR"],
    avatar: "#f0d2a8",
    innerEar: "#f4c3c0",
  },
  {
    id: "chef",
    title: "Chef Cat Cooks Gourmet Treats (For Discerning Felines)",
    channel: "Whisker Kitchen",
    views: "1.1M views",
    uploaded: "2 weeks ago",
    duration: "6:21",
    categories: ["Cats Cooking"],
    avatar: "#f4a25a",
    innerEar: "#f6c8b4",
  },
  {
    id: "gamer",
    title: "Gamer Cat Tries Final Boss (Hilarious Reactions)",
    channel: "Pixel Paws",
    views: "2.9M views",
    uploaded: "3 weeks ago",
    duration: "7:48",
    categories: ["Gaming Cats"],
    avatar: "#6d6784",
    innerEar: "#e7b4c4",
  },
  {
    id: "reaction",
    title: "Cats React to Literally Everything (Funny Compilation)",
    channel: "Drama Whiskers",
    views: "4.2M views",
    uploaded: "1 month ago",
    duration: "5:36",
    categories: ["Dramatic Cats", "Funny Cats"],
    avatar: "#c98448",
    innerEar: "#f0b8b0",
  },
  {
    id: "box",
    title: "Cat Reviews Cardboard Box (10/10 Would Live Here)",
    channel: "Box Inspector",
    views: "1.7M views",
    uploaded: "2 weeks ago",
    duration: "4:03",
    categories: ["Funny Cats"],
    avatar: "#b19780",
    innerEar: "#efc0c4",
  },
  {
    id: "play",
    title: "Kittens at Play! 🐾 Tiny Paws, Massive Energy",
    channel: "Kitten Central",
    views: "2.6M views",
    uploaded: "3 weeks ago",
    duration: "6:18",
    categories: ["Kittens"],
    avatar: "#f2b27a",
    innerEar: "#f6c8bc",
  },
  {
    id: "happier",
    title: "Ultimate Cat Compilation (Because Cats Make Life Better)",
    channel: "Purrfect Moments",
    views: "5.4M views",
    uploaded: "1 month ago",
    duration: "3:11",
    categories: ["Cat Compilations"],
    avatar: "#ead4b4",
    innerEar: "#f0c2b8",
  },
  {
    id: "morning",
    title: "Peaceful Cats, Beautiful Mornings (A Cozy Vlog)",
    channel: "The Calm Cat",
    views: "1.2M views",
    uploaded: "2 weeks ago",
    duration: "4:27",
    categories: ["Sleepy Cats"],
    avatar: "#efe4d4",
    innerEar: "#f3c6c0",
  },
];
