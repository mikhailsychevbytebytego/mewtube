import { asc, eq } from "drizzle-orm";
import { channels, comments, users, videos } from "@/drizzle/schema";
import { db } from "@/lib/db";
import type { ChannelPage, ChannelVideo } from "@/lib/channel";
import type { Video, VideoCategory } from "@/lib/videos";
import type { WatchComment } from "@/lib/watch";

const categorySet = new Set<VideoCategory>([
  "Kittens",
  "Funny Cats",
  "Cat Compilations",
  "Cat ASMR",
  "Cats Cooking",
  "Gaming Cats",
  "Dramatic Cats",
  "Sleepy Cats",
  "Smart Cats",
]);

type VideoRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  paragraphs: string[];
  descriptionMore: string | null;
  views: string | null;
  uploaded: string | null;
  duration: string;
  thumbnail: string;
  playbackUrl: string | null;
  poster: string | null;
  featuredImage: string | null;
  overlay: string[];
  categories: string[];
  likes: string | null;
  hashtags: string[];
  commentCount: number;
  showOnHome: boolean;
  featured: boolean;
  channelSection: string | null;
  channelName: string;
  channelHandle: string;
  subscribers: string | null;
  avatarColor: string;
  innerEar: string | null;
  hasPage: boolean;
};

function asCategories(values: string[]): VideoCategory[] {
  return values.filter((value): value is VideoCategory =>
    categorySet.has(value as VideoCategory),
  );
}

function toVideo(row: VideoRow): Video {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    channel: row.channelName,
    channelHandle: row.channelHandle,
    hasChannelPage: row.hasPage,
    views: row.views ?? "",
    uploaded: row.uploaded ?? "",
    duration: row.duration,
    categories: asCategories(row.categories),
    avatar: row.avatarColor,
    innerEar: row.innerEar ?? "#f3c2c8",
    thumbnail: row.thumbnail,
    playbackUrl: row.playbackUrl,
    poster: row.poster,
    likes: row.likes,
    hashtags: row.hashtags,
    paragraphs: row.paragraphs,
    descriptionMore: row.descriptionMore,
    commentCount: row.commentCount,
    subscribers: row.subscribers,
  };
}

function toChannelVideo(row: VideoRow): ChannelVideo & { description?: string } {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    views: row.views ?? undefined,
    uploaded: row.uploaded ?? undefined,
    duration: row.duration,
    image: row.featured && row.featuredImage ? row.featuredImage : row.thumbnail,
    overlay: row.overlay,
    watchId: row.showOnHome ? row.slug : undefined,
    description: row.description ?? undefined,
  };
}

const videoColumns = {
  id: videos.id,
  slug: videos.slug,
  title: videos.title,
  subtitle: videos.subtitle,
  description: videos.description,
  paragraphs: videos.paragraphs,
  descriptionMore: videos.descriptionMore,
  views: videos.views,
  uploaded: videos.uploaded,
  duration: videos.duration,
  thumbnail: videos.thumbnail,
  playbackUrl: videos.playbackUrl,
  poster: videos.poster,
  featuredImage: videos.featuredImage,
  overlay: videos.overlay,
  categories: videos.categories,
  likes: videos.likes,
  hashtags: videos.hashtags,
  commentCount: videos.commentCount,
  showOnHome: videos.showOnHome,
  featured: videos.featured,
  channelSection: videos.channelSection,
  channelName: channels.name,
  channelHandle: channels.slug,
  subscribers: channels.subscribers,
  avatarColor: channels.avatarColor,
  innerEar: channels.innerEar,
  hasPage: channels.hasPage,
};

function videoQuery() {
  return db
    .select(videoColumns)
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id));
}

export async function getHomeVideos() {
  const rows = await videoQuery()
    .where(eq(videos.showOnHome, true))
    .orderBy(asc(videos.homeOrder));
  return rows.map(toVideo);
}

export async function getWatchVideo(id: string | undefined) {
  const rows = await videoQuery()
    .where(eq(videos.showOnHome, true))
    .orderBy(asc(videos.relatedOrder));
  const catalog = rows.map(toVideo);
  const video =
    catalog.find((item) => item.slug === id || item.id === id) ??
    catalog.find((item) => item.slug === "piano") ??
    catalog[0];
  if (!video) return null;
  const related = catalog.filter((item) => item.id !== video.id);
  const commentRows = await db
    .select({
      id: comments.id,
      author: users.name,
      avatar: users.avatar,
      innerEar: users.innerEar,
      posted: comments.posted,
      text: comments.body,
      likes: comments.likes,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.videoId, video.id))
    .orderBy(asc(comments.sortOrder));
  const watchComments: WatchComment[] = commentRows.map((comment) => ({
    ...comment,
    innerEar: comment.innerEar ?? "#f3c2c8",
  }));
  return { video, related, comments: watchComments };
}

export async function getChannelPage(handle: string) {
  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.slug, handle))
    .limit(1);
  if (!channel) return null;

  const rows = await videoQuery()
    .where(eq(videos.channelId, channel.id))
    .orderBy(asc(videos.sectionOrder));

  const featuredRow = rows.find((row) => row.featured);
  if (!channel.hasPage || !featuredRow) {
    return {
      kind: "library" as const,
      name: channel.name,
      handle: channel.slug,
      subscribers: channel.subscribers,
      avatar: channel.avatarColor,
      innerEar: channel.innerEar ?? "#f3c2c8",
      avatarImage: channel.avatarImage,
      videos: rows.filter((row) => row.showOnHome).map(toVideo),
    };
  }

  const page: ChannelPage = {
    kind: "designed",
    name: channel.name,
    handle: channel.slug,
    subscribersLabel: `${channel.subscribers} · ${channel.videoCount} videos`,
    bio: channel.bio,
    bioMore: channel.bioMore,
    bannerImage: channel.bannerImage ?? "",
    avatarImage: channel.avatarImage ?? "",
    creatorImage: channel.creatorImage,
    featured: {
      ...toChannelVideo(featuredRow),
      description: featuredRow.description ?? "",
    },
    forYou: rows
      .filter((row) => row.channelSection === "for-you")
      .map(toChannelVideo),
    shelf: rows.filter((row) => row.channelSection === "shelf").map(toChannelVideo),
  };
  return page;
}
