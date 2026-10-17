import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  innerEar: text("inner_ear"),
});

export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  ownerId: text("owner_id")
    .unique()
    .references(() => user.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  subscribers: text("subscribers"),
  videoCount: integer("video_count"),
  avatarColor: text("avatar_color").notNull(),
  innerEar: text("inner_ear"),
  avatarImage: text("avatar_image"),
  bannerImage: text("banner_image"),
  creatorImage: text("creator_image"),
  bio: text("bio").array().notNull(),
  bioMore: text("bio_more"),
  hasPage: boolean("has_page").notNull().default(false),
});

export const shelves = pgTable(
  "shelves",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("shelves_channel_id_idx").on(table.channelId)],
);

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  channelId: uuid("channel_id")
    .notNull()
    .references(() => channels.id),
  shelfId: uuid("shelf_id").references(() => shelves.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  paragraphs: text("paragraphs").array().notNull(),
  descriptionMore: text("description_more"),
  views: text("views"),
  uploaded: text("uploaded"),
  duration: text("duration").notNull(),
  thumbnail: text("thumbnail").notNull(),
  playbackUrl: text("playback_url"),
  poster: text("poster"),
  featuredImage: text("featured_image"),
  overlay: text("overlay").array().notNull(),
  categories: text("categories").array().notNull(),
  likes: text("likes"),
  hashtags: text("hashtags").array().notNull(),
  commentCount: integer("comment_count").notNull().default(0),
  showOnHome: boolean("show_on_home").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  channelSection: text("channel_section"),
  homeOrder: integer("home_order").notNull().default(0),
  relatedOrder: integer("related_order").notNull().default(0),
  sectionOrder: integer("section_order").notNull().default(0),
  thumbnailEmbedding: vector("thumbnail_embedding", { dimensions: 512 }),
}, (table) => [
  index("videos_thumbnail_embedding_hnsw").using(
    "hnsw",
    table.thumbnailEmbedding.op("vector_cosine_ops"),
  ),
  index("videos_shelf_id_idx").on(table.shelfId),
]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.channelId] }),
    index("subscriptions_channel_id_idx").on(table.channelId),
  ],
);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  posted: text("posted").notNull(),
  likes: text("likes").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
