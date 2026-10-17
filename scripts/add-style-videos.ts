import { eq, max, sql } from "drizzle-orm";
import { channels, videos } from "../drizzle/schema";
import { db } from "../lib/db";

const model = "openai/gpt-image-2";

type StyleVideo = {
  slug: string;
  title: string;
  style: string;
  scene: string;
  description: string;
  paragraphs: [string, string];
  categories: string[];
  hashtags: string[];
  views: string;
  uploaded: string;
  likes: string;
};

const batch: StyleVideo[] = [
  {
    slug: "cyberpunk-neon-alley",
    title: "Neon Whiskers: Cyberpunk Cat Owns the Rainy Alley",
    style: "Cyberpunk digital art, wet neon magenta and cyan, chrome and holograms",
    scene: "A sleek cat in a tiny lighted collar walks through a rainy megacity alley",
    description: "The cat steps through neon puddles while holographic signs flicker overhead.",
    paragraphs: [
      "A street cat treats a rainy megacity alley like a private runway.",
      "Magenta light, chrome whiskers, and one very unbothered strut.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#CyberpunkCat", "#NeonAlley"],
    views: "640K views",
    uploaded: "3 days ago",
    likes: "41K",
  },
  {
    slug: "fantasy-castle-wizard",
    title: "Arcane Paw: The Wizard Cat Casts Moonlight",
    style: "High fantasy oil painting, moonlit stone castle, rich velvet and gold trim",
    scene: "A cat wizard in a starry cloak stands on a castle parapet holding a glowing paw",
    description: "Moonlight spills over the battlements as the cat lifts one glowing paw.",
    paragraphs: [
      "The court wizard is a cat, and the spell of the evening is a ribbon of moonlight.",
      "No knights required. The cloak has enough drama on its own.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#FantasyCat", "#WizardCat"],
    views: "880K views",
    uploaded: "1 week ago",
    likes: "52K",
  },
  {
    slug: "anime-cherry-sprint",
    title: "Sakura Sprint: Anime Cat Dashes Through Petals",
    style: "Japanese anime cel animation, bold outlines, cherry blossom pinks, motion streaks",
    scene: "An anime cat hero sprints along a shrine path as petals whip past",
    description: "Petals streak sideways as the cat launches into a full sprint.",
    paragraphs: [
      "A shrine path, a sudden gust, and a cat who refuses to miss the dramatic timing.",
      "Drawn like a title card from a Saturday adventure show.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#AnimeCat", "#SakuraSprint"],
    views: "1.4M views",
    uploaded: "5 days ago",
    likes: "96K",
  },
  {
    slug: "noir-blind-shadows",
    title: "Case of the Missing Sardine: Noir Cat After Dark",
    style: "Black and white film noir, hard window-blind shadows, cigarette-free, rainy street",
    scene: "A cat in a tiny trench coat stands under a streetlamp in a black and white city",
    description: "Blind shadows slide across the cat as it turns toward a rainy streetlamp.",
    paragraphs: [
      "The city is monochrome, the puddles are shiny, and the detective has excellent whiskers.",
      "Somebody moved the sardine. The cat intends to find out who.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#NoirCat", "#CatDetective"],
    views: "510K views",
    uploaded: "4 days ago",
    likes: "33K",
  },
  {
    slug: "western-dust-standoff",
    title: "High Noon Meow: Western Cat Faces the Dust",
    style: "Spaghetti western cinema still, dusty gold sunset, wide desert street",
    scene: "A cat in a poncho stands in the middle of an empty frontier town at sunset",
    description: "Dust rolls down the empty street as the cat holds its ground at sunset.",
    paragraphs: [
      "One cat. One tumbleweed. A sunset doing far too much.",
      "The standoff ends when the tumbleweed blinks first.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#WesternCat", "#HighNoon"],
    views: "730K views",
    uploaded: "2 weeks ago",
    likes: "28K",
  },
  {
    slug: "space-opera-helm",
    title: "Captain Pounce and the Starship Window",
    style: "Cinematic space opera, deep blue starfield, polished spacecraft interior",
    scene: "A cat in a snug space suit sits at a starship window watching a ringed planet",
    description: "The cat presses one paw to the glass as the ringed planet drifts by.",
    paragraphs: [
      "Command of the ship is unofficial, but the view from the window is not.",
      "Somewhere a navigation console beeps. The captain is busy with the planet.",
    ],
    categories: ["Smart Cats"],
    hashtags: ["#SpaceCat", "#Starship"],
    views: "1.1M views",
    uploaded: "6 days ago",
    likes: "74K",
  },
  {
    slug: "steampunk-airship-deck",
    title: "Gears and Whiskers: Steampunk Cat on Deck",
    style: "Steampunk illustration, brass, copper pipes, warm lantern light, airship wood deck",
    scene: "A cat with brass goggles perched on its head stands beside a steaming valve",
    description: "Steam curls past the goggles as the cat checks a brass valve.",
    paragraphs: [
      "The airship stays aloft because somebody knows which lever not to sit on.",
      "Today that somebody is a cat with excellent goggles.",
    ],
    categories: ["Smart Cats"],
    hashtags: ["#SteampunkCat", "#Airship"],
    views: "420K views",
    uploaded: "8 days ago",
    likes: "19K",
  },
  {
    slug: "gothic-candle-manor",
    title: "Candlelight Prowl: Gothic Cat of the Old Manor",
    style: "Gothic horror painting, candlelight, deep green velvet, fog at tall windows, not gory",
    scene: "A long-haired cat walks a candlelit hallway of a foggy manor",
    description: "Candle flames lean as the cat walks the long hallway toward a fogged window.",
    paragraphs: [
      "The manor is all velvet, fog, and too many candles.",
      "The cat is the only resident who knows where the squeaky board is.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#GothicCat", "#Candlelight"],
    views: "390K views",
    uploaded: "9 days ago",
    likes: "22K",
  },
  {
    slug: "ghibli-hill-wind",
    title: "Wind on the Hill: A Painted Cat Afternoon",
    style: "Hand-painted animation background, soft watercolor clouds, gentle countryside, Ghibli-like",
    scene: "A round cat sits in tall grass on a green hill under huge soft clouds",
    description: "Tall grass bends around the cat as a slow cloud shadow crosses the hill.",
    paragraphs: [
      "Nothing urgent happens, which is the entire point of the hill.",
      "Painted clouds, a warm breeze, and a cat who has nowhere else to be.",
    ],
    categories: ["Sleepy Cats"],
    hashtags: ["#PaintedCat", "#HillWind"],
    views: "960K views",
    uploaded: "2 days ago",
    likes: "81K",
  },
  {
    slug: "pixel-dungeon-pounce",
    title: "1-Up Pounce: Pixel Cat Clears the Dungeon",
    style: "16-bit pixel art, limited palette, chunky pixels, dungeon tiles",
    scene: "A pixel-art cat jumps between stone dungeon platforms toward a tiny treasure chest",
    description: "The pixel cat hops from brick to brick toward a sparkling chest.",
    paragraphs: [
      "The dungeon is eight colors and one very committed jump.",
      "Treasure is optional. The landing is the whole show.",
    ],
    categories: ["Gaming Cats"],
    hashtags: ["#PixelCat", "#DungeonRun"],
    views: "1.7M views",
    uploaded: "1 day ago",
    likes: "120K",
  },
  {
    slug: "ukiyoe-great-wave",
    title: "The Great Meow: Woodblock Cat and the Wave",
    style: "Japanese ukiyo-e woodblock print, flat indigo and cream, bold black outlines",
    scene: "A cat sits on a small fishing boat as a huge stylized wave curls overhead",
    description: "The great wave curls, and the cat stays perfectly seated in the boat.",
    paragraphs: [
      "A famous wave, a tiny boat, and a cat who has decided this is fine.",
      "Printed like a woodblock that learned about whiskers.",
    ],
    categories: ["Sleepy Cats"],
    hashtags: ["#UkiyoECat", "#GreatWave"],
    views: "610K views",
    uploaded: "3 weeks ago",
    likes: "44K",
  },
  {
    slug: "art-deco-ballroom",
    title: "Gold Geometry: Art Deco Cat Enters the Ballroom",
    style: "Art deco poster, black and gold geometry, symmetrical ballroom, elegant 1920s",
    scene: "A poised cat stands on a black and gold staircase in a geometric ballroom",
    description: "The cat descends one gold step as the ballroom lights flare in a fan shape.",
    paragraphs: [
      "Every line in the room points at the cat, which feels correct.",
      "Black, gold, and the confidence of someone who owns the staircase.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#ArtDecoCat", "#Ballroom"],
    views: "350K views",
    uploaded: "11 days ago",
    likes: "17K",
  },
  {
    slug: "vaporwave-palm-grid",
    title: "Sunset Grid: Vaporwave Cat on the Marble",
    style: "Vaporwave aesthetic, pink marble, teal grid sunset, palm silhouette, soft glow",
    scene: "A cat sits on a pink marble plinth in front of a teal grid sunset and a palm",
    description: "The grid sunset pulses while the cat slowly blinks on the marble plinth.",
    paragraphs: [
      "A palm, a plinth, and a sunset that forgot what year it is.",
      "The cat provides the only solid object in the frame.",
    ],
    categories: ["Cat ASMR"],
    hashtags: ["#VaporwaveCat", "#GridSunset"],
    views: "280K views",
    uploaded: "2 weeks ago",
    likes: "15K",
  },
  {
    slug: "comic-rooftop-cape",
    title: "Cape On, Nap Later: Comic Cat Above the City",
    style: "American superhero comic, bold ink, halftone dots, primary colors",
    scene: "A cat in a small red cape poses on a rooftop with the city in halftone behind it",
    description: "The cape snaps in the wind as the cat plants both paws on the rooftop ledge.",
    paragraphs: [
      "The city needed a hero. It received a cat with a cape and strong opinions.",
      "Halftone skyline, bold ink, and a pose held for exactly one panel.",
    ],
    categories: ["Gaming Cats"],
    hashtags: ["#ComicCat", "#RooftopHero"],
    views: "1.2M views",
    uploaded: "4 days ago",
    likes: "88K",
  },
  {
    slug: "reef-diving-helmet",
    title: "Glow Reef: Cat in a Diving Helmet",
    style: "Bioluminescent underwater painting, deep teal water, glowing jellyfish",
    scene: "A cat inside a round brass diving helmet floats beside glowing jellyfish",
    description: "Jellyfish drift upward as the helmeted cat paddles through blue-green light.",
    paragraphs: [
      "The reef handles the lighting. The cat handles the staring.",
      "A brass helmet, a trail of bubbles, and fish that refuse to be impressed.",
    ],
    categories: ["Kittens"],
    hashtags: ["#UnderwaterCat", "#GlowReef"],
    views: "540K views",
    uploaded: "1 week ago",
    likes: "36K",
  },
  {
    slug: "wasteland-scarf-cat",
    title: "Dust Mile: The Last Cat on the Highway",
    style: "Post-apocalyptic concept art, warm dusty haze, ruined highway, hopeful light",
    scene: "A cat wearing a small patched scarf walks an empty cracked highway at golden hour",
    description: "The cat walks the cracked highway as dust glows in the low sun.",
    paragraphs: [
      "The highway is empty, the scarf is patched, and the cat is still going.",
      "Ruins in the distance, warm light, and no interest in turning around.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#WastelandCat", "#DustMile"],
    views: "470K views",
    uploaded: "12 days ago",
    likes: "29K",
  },
  {
    slug: "storybook-mushroom-wood",
    title: "Once Upon a Paw: Storybook Cat in the Mushroom Wood",
    style: "Children's storybook gouache, soft edges, mushroom forest, warm lantern light",
    scene: "A small cat with a lantern walks between oversized storybook mushrooms",
    description: "The lantern swings as the cat pads between glowing storybook mushrooms.",
    paragraphs: [
      "The mushrooms are taller than the cat, which the cat has chosen not to mention.",
      "A lantern, a path, and a page that looks ready to be read aloud.",
    ],
    categories: ["Kittens"],
    hashtags: ["#StorybookCat", "#MushroomWood"],
    views: "820K views",
    uploaded: "3 days ago",
    likes: "63K",
  },
  {
    slug: "disco-mirror-ball",
    title: "Saturday Meow: Disco Cat Under the Mirror Ball",
    style: "1970s disco photograph, mirror ball sparkles, warm club lights, flared silhouette",
    scene: "A cat strikes a dance pose on a lit floor under a spinning mirror ball",
    description: "Mirror-ball dots sweep across the cat as it holds a dance pose.",
    paragraphs: [
      "The floor lights up. The cat has already chosen a pose.",
      "Saturday night, one mirror ball, and absolutely no chill.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#DiscoCat", "#MirrorBall"],
    views: "990K views",
    uploaded: "6 days ago",
    likes: "70K",
  },
  {
    slug: "sumi-e-mountain-cat",
    title: "Ink and Mist: Sumi-e Cat on the Rock",
    style: "Japanese sumi-e ink wash, lots of empty paper, misty mountain, a few brush strokes",
    scene: "A cat rendered in black ink sits on a rock with a pale mountain behind it",
    description: "A brush of mist passes the rock while the ink cat stays perfectly still.",
    paragraphs: [
      "Most of the page is empty on purpose.",
      "One rock, one cat, and a mountain that is barely there.",
    ],
    categories: ["Sleepy Cats"],
    hashtags: ["#SumiECat", "#InkWash"],
    views: "260K views",
    uploaded: "2 weeks ago",
    likes: "18K",
  },
  {
    slug: "clay-kitchen-baker",
    title: "Stop-Motion Whisk: Clay Cat Bakes a Tiny Tart",
    style: "Claymation stop motion, visible clay texture, tiny handmade kitchen, warm practical light",
    scene: "A clay cat in a miniature kitchen reaches toward a tiny fruit tart",
    description: "The clay cat leans over the counter and pats a tiny fruit tart.",
    paragraphs: [
      "Everything in the kitchen is handmade, including the baker.",
      "The tart is smaller than a paw and somehow still the star.",
    ],
    categories: ["Cats Cooking"],
    hashtags: ["#ClaymationCat", "#TinyTart"],
    views: "1.0M views",
    uploaded: "2 days ago",
    likes: "77K",
  },
];
type FalImage = { url?: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function falImage(prompt: string) {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set.");
  const headers = {
    Authorization: `Key ${key}`,
    "Content-Type": "application/json",
  };
  const queued = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt,
      image_size: { width: 1280, height: 720 },
      quality: "low",
      num_images: 1,
      output_format: "jpeg",
    }),
  });
  if (!queued.ok) throw new Error(`FAL queue failed (${queued.status}).`);
  const ticket = (await queued.json()) as { status_url?: string; response_url?: string };
  if (!ticket.status_url || !ticket.response_url) throw new Error("FAL queue did not return status URLs.");

  const deadline = Date.now() + 180_000;
  let completed = false;
  while (Date.now() < deadline) {
    const statusResponse = await fetch(ticket.status_url, { headers });
    if (!statusResponse.ok) throw new Error(`FAL status failed (${statusResponse.status}).`);
    const status = (await statusResponse.json()) as { status?: string; error?: string };
    if (status.status === "COMPLETED") {
      completed = true;
      break;
    }
    if (status.status === "FAILED") throw new Error(status.error || "FAL image generation failed.");
    await sleep(2000);
  }
  if (!completed) throw new Error("FAL image generation timed out.");

  const resultResponse = await fetch(ticket.response_url, { headers });
  if (!resultResponse.ok) throw new Error(`FAL result failed (${resultResponse.status}).`);
  const result = (await resultResponse.json()) as { images?: FalImage[] };
  const url = result.images?.[0]?.url;
  if (!url) throw new Error("FAL returned no image URL.");
  return url;
}

async function uploadImage(slug: string, sourceUrl: string) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!account || !token) throw new Error("Cloudflare credentials are missing.");
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`;
  const form = new FormData();
  form.set("url", sourceUrl);
  form.set("id", slug);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const payload = (await response.json()) as {
    success?: boolean;
    errors?: { message?: string }[];
    result?: { variants?: string[] };
  };
  const variantOf = (variants?: string[]) =>
    variants?.find((item) => item.endsWith("/public")) ?? variants?.[0];
  if (!payload.success) {
    const existing = await fetch(`${endpoint}/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stored = (await existing.json()) as { success?: boolean; result?: { variants?: string[] } };
    const variant = variantOf(stored.result?.variants);
    if (existing.ok && stored.success && variant) return variant;
    throw new Error(payload.errors?.[0]?.message || `Cloudflare upload failed (${response.status}).`);
  }
  const variant = variantOf(payload.result?.variants);
  if (!variant) throw new Error("Cloudflare did not return an image URL.");
  return variant;
}

function imagePrompt(video: StyleVideo) {
  return [
    video.style + ".",
    "16:9 thumbnail of one cat.",
    `Scene: ${video.scene}.`,
    "No text, no letters, no logo, no watermark, no humans.",
  ].join(" ");
}

async function mapPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let next = 0;
  async function run() {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await worker(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
}

async function main() {
  if (batch.length !== 20) throw new Error(`Expected 20 videos, got ${batch.length}.`);
  const channelRows = await db
    .select({ id: channels.id, slug: channels.slug })
    .from(channels)
    .orderBy(channels.slug);
  if (channelRows.length === 0) throw new Error("No channels to attach videos to.");

  const [orderRow] = await db.select({ value: max(videos.homeOrder) }).from(videos);
  const startOrder = (orderRow?.value ?? 0) + 1;

  for (const [index, video] of batch.entries()) {
    const [existing] = await db
      .select({ slug: videos.slug })
      .from(videos)
      .where(eq(videos.slug, video.slug))
      .limit(1);
    if (existing) continue;
    const channel = channelRows[index % channelRows.length];
    await db.insert(videos).values({
      slug: video.slug,
      channelId: channel.id,
      title: video.title,
      description: video.description,
      paragraphs: video.paragraphs,
      views: video.views,
      uploaded: video.uploaded,
      duration: "0:15",
      thumbnail: "pending",
      overlay: [],
      categories: video.categories,
      likes: video.likes,
      hashtags: video.hashtags,
      commentCount: 0,
      showOnHome: true,
      featured: false,
      homeOrder: startOrder + index,
      relatedOrder: startOrder + index,
      sectionOrder: index,
    });
    console.log(`inserted ${video.slug} -> ${channel.slug}`);
  }

  await db.execute(sql`
    update public.channels
    set video_count = (
      select count(*) from public.videos where videos.channel_id = channels.id
    )
  `);

  const rows = await db
    .select({ slug: videos.slug, thumbnail: videos.thumbnail })
    .from(videos);
  const pending = batch.filter((video) => {
    const row = rows.find((item) => item.slug === video.slug);
    return row && !row.thumbnail.startsWith("https://imagedelivery.net/");
  });
  console.log(`Generating ${pending.length} styled thumbnails.`);
  const failures: string[] = [];
  await mapPool(pending, 3, async (video) => {
    let lastError = "unknown";
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const source = await falImage(imagePrompt(video));
        const url = await uploadImage(video.slug, source);
        await db.update(videos).set({ thumbnail: url }).where(eq(videos.slug, video.slug));
        console.log(`thumbnail ${video.slug}`);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error.message : "failed";
        console.error(`retry ${video.slug} (${attempt}): ${lastError}`);
      }
    }
    failures.push(`${video.slug}: ${lastError}`);
  });

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("Style thumbnails are ready.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});