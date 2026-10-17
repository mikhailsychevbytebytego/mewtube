import { and, eq } from "drizzle-orm";
import { channels, shelves } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/require-admin";

const reservedSlugs = new Set([
  "admin",
  "api",
  "channel",
  "login",
  "studio",
  "uploads",
  "watch",
]);

const palette = [
  { avatarColor: "#e09a62", innerEar: "#f3c2c8" },
  { avatarColor: "#d4786a", innerEar: "#f6c7be" },
  { avatarColor: "#c4a574", innerEar: "#f0d7c4" },
  { avatarColor: "#7f93b5", innerEar: "#d5e0f0" },
  { avatarColor: "#8aa88a", innerEar: "#d7ead4" },
];

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "channel";
}

function paletteFor(id: string) {
  const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;
  return palette[index] ?? palette[0];
}

async function uniqueChannelSlug(name: string) {
  const base = slugify(name);
  for (let n = 1; n <= 30; n += 1) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (reservedSlugs.has(slug)) continue;
    const [existing] = await db
      .select({ id: channels.id })
      .from(channels)
      .where(eq(channels.slug, slug))
      .limit(1);
    if (!existing) return slug;
  }
  return `channel-${crypto.randomUUID().slice(0, 8)}`;
}

export async function ensureOwnChannel(user: { id: string; name: string }) {
  const [existing] = await db
    .select()
    .from(channels)
    .where(eq(channels.ownerId, user.id))
    .limit(1);
  if (existing) return existing;

  const name = user.name.trim().replace(/\s+/g, " ").slice(0, 80) || "My channel";
  const colors = paletteFor(user.id);
  try {
    const [created] = await db
      .insert(channels)
      .values({
        slug: await uniqueChannelSlug(name),
        ownerId: user.id,
        name,
        subscribers: "0 subscribers",
        videoCount: 0,
        avatarColor: colors.avatarColor,
        innerEar: colors.innerEar,
        bio: ["Fresh cat videos from this channel."],
        hasPage: true,
      })
      .returning();
    if (!created) throw new Error("Could not create your channel.");
    return created;
  } catch (error) {
    const [again] = await db
      .select()
      .from(channels)
      .where(eq(channels.ownerId, user.id))
      .limit(1);
    if (again) return again;
    throw error;
  }
}

export async function requireOwnedChannel() {
  const session = await getCurrentSession();
  if (!session) return null;
  return ensureOwnChannel({ id: session.user.id, name: session.user.name });
}

export async function assertOwnShelf(channelId: string, shelfId: string) {
  if (!isUuid(shelfId)) return false;
  const [shelf] = await db
    .select({ id: shelves.id })
    .from(shelves)
    .where(and(eq(shelves.id, shelfId), eq(shelves.channelId, channelId)))
    .limit(1);
  return Boolean(shelf);
}
