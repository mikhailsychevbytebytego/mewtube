import { sql } from "drizzle-orm";
import { channels, comments, users, videos } from "../drizzle/schema";
import { db } from "../lib/db";

const thumbs = [
  { file: "piano.jpg", duration: "3:24" },
  { file: "summer.jpg", duration: "4:12" },
  { file: "gravity.jpg", duration: "2:56" },
  { file: "jump.jpg", duration: "5:17" },
  { file: "sleepy.jpg", duration: "8:03" },
  { file: "chef.jpg", duration: "6:21" },
  { file: "gamer.jpg", duration: "7:48" },
  { file: "reaction.jpg", duration: "5:36" },
  { file: "box.jpg", duration: "4:03" },
  { file: "play.jpg", duration: "6:18" },
  { file: "happier.jpg", duration: "3:11" },
  { file: "morning.jpg", duration: "4:27" },
];

const categoryNames = [
  "Kittens",
  "Funny Cats",
  "Cat Compilations",
  "Cat ASMR",
  "Cats Cooking",
  "Gaming Cats",
  "Dramatic Cats",
  "Sleepy Cats",
  "Smart Cats",
];

type Channel = {
  slug: string;
  name: string;
  subscribers: string;
  avatar: string;
  innerEar: string;
  bio: string;
};

type User = { slug: string; name: string; avatar: string; innerEar: string };

type Comment = { user: string; body: string; posted: string; likes: string };

type Video = {
  slug: string;
  channel: string;
  title: string;
  views: string;
  uploaded: string;
  categories: string[];
  likes: string;
  hashtags: string[];
  paragraphs: string[];
  more: string;
  comments: Comment[];
};

function parseJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Model did not return JSON.");
  return JSON.parse(raw.slice(start, end + 1));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function normalizeCategory(value: string) {
  const exact = categoryNames.find((name) => name.toLowerCase() === value.toLowerCase());
  if (exact) return exact;
  const lower = value.toLowerCase();
  if (lower.includes("kitten")) return "Kittens";
  if (lower.includes("asmr")) return "Cat ASMR";
  if (lower.includes("sleep")) return "Sleepy Cats";
  if (lower.includes("game")) return "Gaming Cats";
  if (lower.includes("cook")) return "Cats Cooking";
  if (lower.includes("drama")) return "Dramatic Cats";
  if (lower.includes("smart")) return "Smart Cats";
  if (lower.includes("compil")) return "Cat Compilations";
  return "Funny Cats";
}

function hex(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

async function ask(prompt: string) {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set.");
  const response = await fetch("https://fal.run/fal-ai/any-llm", {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      priority: "latency",
      temperature: 0.9,
      max_tokens: 12000,
      system_prompt:
        "You write playful, wholesome cat-video catalog data for a fictional site called CatTube. Reply with one JSON object and no markdown.",
      prompt,
    }),
  });
  if (!response.ok) throw new Error(`FAL request failed (${response.status}).`);
  const payload = (await response.json()) as { output?: string; error?: string };
  if (!payload.output) throw new Error(payload.error || "FAL returned no output.");
  return payload.output;
}

async function askJson(prompt: string) {
  let lastError = "none";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const output = await ask(
      attempt === 1 ? prompt : `${prompt}\nPrevious answer was invalid JSON: ${lastError}. Return only JSON.`,
    );
    try {
      return parseJson(output);
    } catch (error) {
      lastError = error instanceof Error ? error.message : "invalid";
      console.error(`JSON attempt ${attempt}: ${lastError}`);
    }
  }
  throw new Error("Could not parse model JSON.");
}

async function main() {
  const people = (await askJson(`Return JSON:
{"channels":[{"slug":"","name":"","subscribers":"1.2M subscribers","avatar":"#c4b8ae","innerEar":"#e7b7c2","bio":"one sentence"}],"users":[{"slug":"","name":"","avatar":"#e09a62","innerEar":"#f3c2c8"}]}
Exactly 8 original cat channels and 10 commenter users.
Slugs are unique lowercase hyphenated words. Do not use the slug "you".
No real people.`)) as { channels?: Channel[]; users?: User[] };

  const used = new Set<string>(["you"]);
  const channelList: Channel[] = [];
  for (const channel of people.channels ?? []) {
    let slug = slugify(channel.slug || channel.name || "");
    if (!slug) continue;
    while (used.has(slug)) slug = `${slug}-tv`;
    used.add(slug);
    channelList.push({
      slug,
      name: channel.name?.trim() || slug,
      subscribers: channel.subscribers?.trim() || "120K subscribers",
      avatar: hex(channel.avatar, "#c4b8ae"),
      innerEar: hex(channel.innerEar, "#e7b7c2"),
      bio: channel.bio?.trim() || "Daily videos about cats.",
    });
  }
  if (channelList.length < 8) throw new Error(`Need 8 channels, got ${channelList.length}.`);
  channelList.splice(8);

  const userList: User[] = [];
  for (const user of people.users ?? []) {
    let slug = slugify(user.slug || user.name || "");
    if (!slug || slug === "you") continue;
    while (used.has(slug)) slug = `${slug}-fan`;
    used.add(slug);
    userList.push({
      slug,
      name: user.name?.trim() || slug,
      avatar: hex(user.avatar, "#d9a07a"),
      innerEar: hex(user.innerEar, "#f3c2c8"),
    });
  }
  if (userList.length < 8) throw new Error(`Need at least 8 users, got ${userList.length}.`);
  userList.splice(10);

  const channelSlugs = channelList.map((channel) => channel.slug);
  const userSlugs = userList.map((user) => user.slug);
  const videoList: Video[] = [];

  const batches = [
    "Mix kittens, funny fails, compilations, and smart tricks.",
    "Use different premises from the first batch: cooking, gaming, ASMR, sleepy routines, dramatic reactions, travel, talent shows, and rainy-day indoor games. Do not retell red-dot, cardboard, tuna, bath, toilet paper, pizza, door stopper, sunbeam, or squirrel videos.",
  ];
  for (const brief of batches) {
    const count = 16;
    const batch = (await askJson(`Channels: ${channelSlugs.join(", ")}
Users: ${userSlugs.join(", ")}
Already used titles:
${videoList.map((video) => video.title).join("\n") || "(none yet)"}
Return JSON {"videos":[{
  "slug":"","channel":"one channel slug above","title":"",
  "views":"1.2M views","uploaded":"2 weeks ago",
  "categories":["Funny Cats"],"likes":"24K","hashtags":["#Cats"],
  "paragraphs":["sentence one","sentence two"],"more":"one extra sentence",
  "comments":[
    {"user":"one user slug above","body":"","posted":"3 days ago","likes":"42"},
    {"user":"another user slug above","body":"","posted":"1 day ago","likes":"18"}
  ]
}]}
Exactly ${count} new videos. ${brief}
Spread them across the channels.
Titles are cute cat video titles. Copy is original and family-friendly.
Do not reuse these slugs: ${[...used].join(", ")}`)) as { videos?: Video[] };
    for (const video of batch.videos ?? []) {
      if (videoList.length >= 32) break;
      let slug = slugify(video.slug || video.title || `cat-clip-${videoList.length + 1}`);
      if (!slug) slug = `cat-clip-${videoList.length + 1}`;
      while (used.has(slug)) slug = `${slug}-${videoList.length + 1}`;
      const channel = channelSlugs.includes(video.channel)
        ? video.channel
        : channelSlugs[videoList.length % channelSlugs.length];
      const paragraphs = (video.paragraphs ?? []).map((line) => line.trim()).filter(Boolean);
      while (paragraphs.length < 2) paragraphs.push("A cat finds a new way to steal the show.");
      const commentsForVideo = (video.comments ?? [])
        .filter((comment) => comment.body?.trim())
        .slice(0, 2)
        .map((comment, index) => ({
          user: userSlugs.includes(comment.user) ? comment.user : userSlugs[index % userSlugs.length],
          body: comment.body.trim(),
          posted: comment.posted?.trim() || "2 days ago",
          likes: comment.likes?.trim() || "12",
        }));
      while (commentsForVideo.length < 2) {
        const index = commentsForVideo.length;
        commentsForVideo.push({
          user: userSlugs[(videoList.length + index) % userSlugs.length],
          body: index === 0 ? "I watched this twice already." : "The timing on this is perfect.",
          posted: "1 day ago",
          likes: "8",
        });
      }
      used.add(slug);
      videoList.push({
        slug,
        channel,
        title: video.title?.trim() || "Untitled cat video",
        views: video.views?.trim() || "100K views",
        uploaded: video.uploaded?.trim() || "1 week ago",
        categories: [...new Set((video.categories ?? []).map(normalizeCategory))].slice(0, 2),
        likes: video.likes?.trim() || "1.2K",
        hashtags: (video.hashtags ?? []).map((tag) => tag.trim()).filter(Boolean).slice(0, 3),
        paragraphs: paragraphs.slice(0, 3),
        more: video.more?.trim() || "More clips land every week.",
        comments: commentsForVideo,
      });
    }
    if ((batch.videos ?? []).length < count && videoList.length < 32) {
      console.error(`Batch returned ${batch.videos?.length ?? 0}, have ${videoList.length}.`);
    }
  }

  if (videoList.length < 32) throw new Error(`Need 32 videos, got ${videoList.length}.`);
  videoList.splice(32);
  for (const video of videoList) {
    if (video.categories.length === 0) video.categories = ["Funny Cats"];
  }

  const channelCounts = new Map(channelList.map((channel) => [channel.slug, 0]));
  for (const video of videoList) {
    channelCounts.set(video.channel, (channelCounts.get(video.channel) ?? 0) + 1);
  }

  await db.transaction(async (tx) => {
    await tx.delete(comments);
    await tx.delete(videos);
    await tx.delete(channels);
    await tx.delete(users);

    await tx.insert(users).values([
      { slug: "you", name: "You", avatar: "#e09a62", innerEar: "#f3c2c8" },
      ...userList.map((user) => ({
        slug: user.slug,
        name: user.name,
        avatar: user.avatar,
        innerEar: user.innerEar,
      })),
    ]);
    const userRows = await tx.select({ id: users.id, slug: users.slug }).from(users);
    const userId = new Map(userRows.map((user) => [user.slug, user.id]));

    await tx.insert(channels).values(
      channelList.map((channel) => ({
        slug: channel.slug,
        name: channel.name,
        subscribers: channel.subscribers,
        videoCount: channelCounts.get(channel.slug) ?? 0,
        avatarColor: channel.avatar,
        innerEar: channel.innerEar,
        avatarImage: null,
        bannerImage: null,
        creatorImage: null,
        bio: [channel.bio],
        bioMore: null,
        hasPage: false,
      })),
    );
    const channelRows = await tx.select({ id: channels.id, slug: channels.slug }).from(channels);
    const channelId = new Map(channelRows.map((channel) => [channel.slug, channel.id]));

    await tx.insert(videos).values(
      videoList.map((video, index) => {
        const thumb = thumbs[index % thumbs.length];
        return {
          slug: video.slug,
          channelId: channelId.get(video.channel)!,
          title: video.title,
          subtitle: null,
          description: video.paragraphs[0] ?? null,
          paragraphs: video.paragraphs,
          descriptionMore: video.more,
          views: video.views,
          uploaded: video.uploaded,
          duration: thumb.duration,
          thumbnail: `/thumbnails/${thumb.file}`,
          poster: null,
          featuredImage: null,
          overlay: [],
          categories: video.categories,
          likes: video.likes,
          hashtags: video.hashtags,
          commentCount: video.comments.length,
          showOnHome: true,
          featured: false,
          channelSection: null,
          homeOrder: index,
          relatedOrder: 31 - index,
          sectionOrder: 0,
        };
      }),
    );
    const videoRows = await tx.select({ id: videos.id, slug: videos.slug }).from(videos);
    const videoId = new Map(videoRows.map((video) => [video.slug, video.id]));

    await tx.insert(comments).values(
      videoList.flatMap((video) =>
        video.comments.map((comment, index) => ({
          videoId: videoId.get(video.slug)!,
          userId: userId.get(comment.user)!,
          body: comment.body,
          posted: comment.posted,
          likes: comment.likes,
          sortOrder: index,
        })),
      ),
    );
  });

  const counts = await db.execute(sql`
    select
      (select count(*) from public.users) as users,
      (select count(*) from public.channels) as channels,
      (select count(*) from public.videos) as videos,
      (select count(*) from public.comments) as comments
  `);
  console.log(counts);
  console.log(videoList.map((video) => video.title).join("\n"));
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
