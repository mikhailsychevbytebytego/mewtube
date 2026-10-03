export type ChannelPage = {
  kind: "designed";
  name: string;
  handle: string;
  subscribersLabel: string;
  bio: string[];
  bioMore: string | null;
  bannerImage: string;
  avatarImage: string;
  creatorImage: string | null;
  featured: ChannelVideo & { description: string };
  forYou: ChannelVideo[];
  shelf: ChannelVideo[];
};

export type ChannelVideo = {
  id: string;
  title: string;
  subtitle?: string;
  views?: string;
  uploaded?: string;
  duration: string;
  image: string;
  overlay: string[];
  watchId?: string;
};

export const channelBio = [
  "Tiny paws on big keys. Adorable cats making beautiful music! 🎹 🐱",
  "From first notes to full meow-symphonies, Meowestro brings you cute, funny, and heartwarming musical moments.",
];

export const featuredVideo = {
  id: "featured-piano",
  title: "Tiny Kitten Learns to Play Piano (And It's Adorable!)",
  views: "2.1M views",
  uploaded: "2 weeks ago",
  duration: "3:24",
  image: "/channel/featured.png",
  overlay: ["Tiny", "Paws", "Big", "Dreams", "♫"],
  description:
    "This tiny kitten is learning to play the piano, and it's the cutest thing you'll see today! 🎹 🐱 From curious paws to real little melodies, watch this fluffy musician discover the magic of music.",
  watchId: "piano",
};

export const forYouVideos: ChannelVideo[] = [
  {
    id: "prelude",
    title: "Paws and Prelude",
    subtitle: "(A Kitten's First Concert)",
    views: "1.8M views",
    uploaded: "3 weeks ago",
    duration: "4:56",
    image: "/channel/for-you-1.png",
    overlay: ["PAWS", "AND", "PRELUDE", "♫"],
  },
  {
    id: "sonata",
    title: "Sleepy Cat Sonata",
    subtitle: "Relaxing Piano Music for Cats",
    views: "2.9M views",
    uploaded: "1 month ago",
    duration: "8:12",
    image: "/channel/for-you-2.png",
    overlay: ["SLEEPY", "CAT", "SONATA", "Zzz"],
  },
  {
    id: "scales",
    title: "Curious Kitten Practices Scales",
    subtitle: "(Tiny Paws, Big Progress)",
    views: "1.4M views",
    uploaded: "3 weeks ago",
    duration: "5:37",
    image: "/channel/for-you-3.png",
    overlay: ["CURIOUS", "KITTEN", "PRACTICES", "SCALES"],
  },
  {
    id: "duet",
    title: "A Meowsical Duet",
    subtitle: "Two Kittens, One Piano",
    views: "3.6M views",
    uploaded: "1 month ago",
    duration: "6:29",
    image: "/channel/for-you-4.png",
    overlay: ["A", "MEOWSICAL", "DUET", "♡"],
  },
];

export const shelfVideos: ChannelVideo[] = [
  {
    id: "composes",
    title: "Kitten Composes a Song?",
    duration: "4:21",
    image: "/channel/video-1.png",
    overlay: ["KITTEN", "COMPOSES", "A SONG?", "♫"],
  },
  {
    id: "elise",
    title: "Kitten Plays Fur Elise",
    subtitle: "(Adorably!)",
    duration: "5:12",
    image: "/channel/video-2.png",
    overlay: ["FUR", "ELISE?", "♫"],
  },
  {
    id: "hour",
    title: "1 Hour of Relaxing Piano",
    subtitle: "Music for Cats",
    duration: "1:02:15",
    image: "/channel/video-3.png",
    overlay: ["PIANO", "MUSIC", "FOR", "RELAXING", "CATS"],
  },
  {
    id: "classics",
    title: "Kitty Jams to Classics",
    subtitle: "(Funny Reactions)",
    duration: "7:44",
    image: "/channel/video-4.png",
    overlay: ["KITTY", "JAMS", "TO", "CLASSICS", "♫"],
  },
  {
    id: "practice",
    title: "Practice Makes Purrfect",
    subtitle: "A Kitten's Piano Journey",
    duration: "4:38",
    image: "/channel/video-5.png",
    overlay: ["TINY", "PAWS", "BIG", "PROGRESS"],
  },
  {
    id: "christmas",
    title: "Meowy Christmas",
    subtitle: "Holiday Piano Special",
    duration: "6:01",
    image: "/channel/video-6.png",
    overlay: ["MEOWY", "CHRISTMAS", "♫"],
  },
];

export const channelTabs = [
  "Home",
  "Videos",
  "Shorts",
  "Playlists",
  "Community",
  "About",
] as const;

export type ChannelTab = (typeof channelTabs)[number];
