export const relatedChips = [
  "All",
  "From Meowestro",
  "Kittens",
  "Piano Cats",
  "Related",
] as const;

export type RelatedChip = (typeof relatedChips)[number];

export const relatedOrder = [
  "sleepy",
  "gravity",
  "gamer",
  "chef",
  "jump",
  "play",
  "morning",
  "box",
  "summer",
  "reaction",
  "happier",
  "piano",
];

export const pianoDetails = {
  subscribers: "2.1M subscribers",
  likes: "120K",
  commentCount: 4892,
  hashtags: ["#Kittens", "#PianoCats", "#AdorableCats"],
  paragraphs: [
    "This tiny kitten is learning to play the piano, and it's the cutest thing you'll see today! 🎹🐱",
    "From curious paws to real little melodies, watch this fluffy musician discover the magic of music.",
    "Remember: even the smallest paws can make a big difference. 🐾❤️",
  ],
  more: "Filmed beside a sunny window, with one piano, one kitten, and no second takes.",
};

export type WatchComment = {
  id: string;
  author: string;
  avatar: string;
  innerEar: string;
  posted: string;
  text: string;
  likes: string;
};

export const pianoComments: WatchComment[] = [
  {
    id: "whiskerwonder",
    author: "WhiskerWonder",
    avatar: "#d7c4ae",
    innerEar: "#f0c2c8",
    posted: "2 weeks ago",
    text: "This is what the world needs more of. Tiny talent, big dreams! 🎹🐾❤️",
    likes: "4.2K",
  },
  {
    id: "purrfectlyhappy",
    author: "PurrfectlyHappy",
    avatar: "#f2b27a",
    innerEar: "#f6c8bc",
    posted: "2 weeks ago",
    text: "The little head tilt at 1:20 melted my heart 🥹 So much concentration!",
    likes: "1.1K",
  },
  {
    id: "catdadlife",
    author: "CatDadLife",
    avatar: "#b9a08c",
    innerEar: "#efc0c4",
    posted: "13 days ago",
    text: "Some cats chase mice. This one chases masterpieces. 🎵🐱",
    likes: "683",
  },
];
