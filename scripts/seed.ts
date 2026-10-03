import { sql } from "drizzle-orm";
import { channelBio, featuredVideo, forYouVideos, shelfVideos } from "../lib/channel";
import { db } from "../lib/db";
import { pianoComments, pianoDetails, relatedOrder } from "../lib/watch";
import { videos as homeVideos } from "../lib/videos";

function handleFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
await db.execute(sql`
  drop table if exists public.comments;
  drop table if exists public.videos;
  drop table if exists public.channels;
  drop table if exists public.users;

  create table public.users (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    avatar text not null,
    inner_ear text
  );

  create table public.channels (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    subscribers text,
    video_count integer,
    avatar_color text not null,
    inner_ear text,
    avatar_image text,
    banner_image text,
    creator_image text,
    bio text[] not null default '{}',
    bio_more text,
    has_page boolean not null default false
  );

  create table public.videos (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    channel_id uuid not null references public.channels(id),
    title text not null,
    subtitle text,
    description text,
    paragraphs text[] not null default '{}',
    description_more text,
    views text,
    uploaded text,
    duration text not null,
    thumbnail text not null,
    poster text,
    featured_image text,
    overlay text[] not null default '{}',
    categories text[] not null default '{}',
    likes text,
    hashtags text[] not null default '{}',
    comment_count integer not null default 0,
    show_on_home boolean not null default false,
    featured boolean not null default false,
    channel_section text,
    home_order integer not null default 0,
    related_order integer not null default 0,
    section_order integer not null default 0
  );

  create table public.comments (
    id uuid primary key default gen_random_uuid(),
    video_id uuid not null references public.videos(id),
    user_id uuid not null references public.users(id),
    body text not null,
    posted text not null,
    likes text not null,
    sort_order integer not null default 0
  );

  alter table public.users enable row level security;
  alter table public.channels enable row level security;
  alter table public.videos enable row level security;
  alter table public.comments enable row level security;
`);

const { users, channels, videos, comments } = await import("../drizzle/schema");

const channelByName = new Map<string, { avatar: string; innerEar: string }>();
for (const video of homeVideos) {
  if (!channelByName.has(video.channel)) {
    channelByName.set(video.channel, {
      avatar: video.avatar,
      innerEar: video.innerEar,
    });
  }
}

const insertedUsers = await db.insert(users).values([
  {
    slug: "you",
    name: "You",
    avatar: "#e09a62",
    innerEar: "#f3c2c8",
  },
  ...pianoComments.map((comment) => ({
    slug: comment.id,
    name: comment.author,
    avatar: comment.avatar,
    innerEar: comment.innerEar,
  })),
]).returning({ id: users.id, slug: users.slug });
const userId = new Map(insertedUsers.map((user) => [user.slug, user.id]));

const insertedChannels = await db.insert(channels).values(
  [...channelByName.entries()].map(([name, face]) => {
    const slug = handleFromName(name);
    const isMeowestro = slug === "meowestro";
    return {
      slug,
      name,
      subscribers: isMeowestro ? "2.1M subscribers" : null,
      videoCount: isMeowestro ? 312 : null,
      avatarColor: face.avatar,
      innerEar: face.innerEar,
      avatarImage: isMeowestro ? "/channel/avatar.png" : null,
      bannerImage: isMeowestro ? "/channel/banner.png" : null,
      creatorImage: isMeowestro ? "/channel/creator.png" : null,
      bio: isMeowestro ? channelBio : [],
      bioMore: isMeowestro
        ? "New melodies every week, filmed beside a sunny window."
        : null,
      hasPage: isMeowestro,
    };
  }),
).returning({ id: channels.id, slug: channels.slug });
const channelId = new Map(insertedChannels.map((channel) => [channel.slug, channel.id]));

const relatedIndex = new Map(relatedOrder.map((id, index) => [id, index]));

const insertedHome = await db.insert(videos).values(
  homeVideos.map((video, index) => {
    const isPiano = video.id === "piano";
    return {
      slug: video.id,
      channelId: channelId.get(handleFromName(video.channel))!,
      title: video.title,
      subtitle: null,
      description: isPiano ? featuredVideo.description : null,
      paragraphs: isPiano ? pianoDetails.paragraphs : [],
      descriptionMore: isPiano ? pianoDetails.more : null,
      views: video.views,
      uploaded: video.uploaded,
      duration: video.duration,
      thumbnail: `/thumbnails/${video.id}.jpg`,
      poster: isPiano ? "/thumbnails/piano-player.jpg" : null,
      featuredImage: isPiano ? featuredVideo.image : null,
      overlay: isPiano ? featuredVideo.overlay : [],
      categories: [...video.categories],
      likes: isPiano ? pianoDetails.likes : null,
      hashtags: isPiano ? [...pianoDetails.hashtags] : [],
      commentCount: isPiano ? pianoDetails.commentCount : 0,
      showOnHome: true,
      featured: isPiano,
      channelSection: null,
      homeOrder: index,
      relatedOrder: relatedIndex.get(video.id) ?? index + 100,
      sectionOrder: isPiano ? 0 : index,
    };
  }),
).returning({ id: videos.id, slug: videos.slug });
const videoId = new Map(insertedHome.map((video) => [video.slug, video.id]));

await db.insert(videos).values(
  [...forYouVideos, ...shelfVideos].map((video, index) => ({
    slug: video.id,
    channelId: channelId.get("meowestro")!,
    title: video.title,
    subtitle: video.subtitle ?? null,
    description: null,
    paragraphs: [],
    descriptionMore: null,
    views: video.views ?? null,
    uploaded: video.uploaded ?? null,
    duration: video.duration,
    thumbnail: video.image,
    poster: null,
    featuredImage: null,
    overlay: video.overlay,
    categories: [],
    likes: null,
    hashtags: [],
    commentCount: 0,
    showOnHome: false,
    featured: false,
    channelSection: index < forYouVideos.length ? "for-you" : "shelf",
    homeOrder: 0,
    relatedOrder: 0,
    sectionOrder: index < forYouVideos.length ? index : index - forYouVideos.length,
  })),
);

await db.insert(comments).values(
  pianoComments.map((comment, index) => ({
    videoId: videoId.get("piano")!,
    userId: userId.get(comment.id)!,
    body: comment.text,
    posted: comment.posted,
    likes: comment.likes,
    sortOrder: index,
  })),
);

const [counts] = await db.execute(sql`
  select
    (select count(*) from public.users) as users,
    (select count(*) from public.channels) as channels,
    (select count(*) from public.videos) as videos,
    (select count(*) from public.comments) as comments
`);

console.log(counts);
process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
