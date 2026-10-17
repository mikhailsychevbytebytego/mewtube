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
  {
    slug: "anime-mecha-launch",
    title: "Launch Sequence: Anime Cat Pilots the Mecha",
    style: "Japanese anime cel animation, giant robot cockpit, bold outlines, sunrise glare",
    scene: "An anime cat in a pilot suit sits in a brightly lit mecha cockpit as the hatch opens",
    description: "The cockpit hatch rises and the cat grips the controls as the city drops away.",
    paragraphs: [
      "The robot is enormous. The pilot is a cat who practiced this pose in a mirror.",
      "Sunrise, warning lights, and a launch that feels like a season finale.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#AnimeCat", "#Mecha"],
    views: "2.2M views",
    uploaded: "1 day ago",
    likes: "140K",
  },
  {
    slug: "anime-magical-leap",
    title: "Star Wand Up: Magical Anime Cat Takes the Stage",
    style: "Magical-girl anime, sparkling pastel light, ribbons, cel shading, night sky",
    scene: "An anime cat in a frilled costume leaps with a star wand over a moonlit rooftop",
    description: "Ribbons whip upward as the cat leaps and the wand throws a fan of sparkles.",
    paragraphs: [
      "Transformation complete. The rooftop is now a stage.",
      "Sparkles, a moon, and a landing the cat intends to stick.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#AnimeCat", "#MagicalCat"],
    views: "1.6M views",
    uploaded: "2 days ago",
    likes: "98K",
  },
  {
    slug: "anime-tournament-clash",
    title: "Final Round: Anime Cats Clash in the Arena",
    style: "Shonen anime tournament, speed lines, dust burst, packed stadium lights",
    scene: "Two anime cats face off in a chalk arena as the crowd becomes streaks of color",
    description: "Dust bursts from the arena floor as both cats launch toward each other.",
    paragraphs: [
      "The bracket said this was the final. The cats took that personally.",
      "Speed lines, a roaring crowd, and one very serious stare.",
    ],
    categories: ["Gaming Cats"],
    hashtags: ["#AnimeCat", "#Tournament"],
    views: "1.9M views",
    uploaded: "4 days ago",
    likes: "121K",
  },
  {
    slug: "superhero-skyline-cape",
    title: "City Needs a Cat: Superhero Above the Skyline",
    style: "Cinematic superhero poster, flowing cape, night skyline, rim light",
    scene: "A cat in a sleek suit and long cape stands on a gargoyle above a lit city",
    description: "The cape snaps straight out as the cat steps off the gargoyle into the wind.",
    paragraphs: [
      "The skyline gets a guardian with excellent balance and a better cape.",
      "No secret identity. The ears give it away immediately.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#SuperheroCat", "#Skyline"],
    views: "1.3M views",
    uploaded: "3 days ago",
    likes: "86K",
  },
  {
    slug: "superhero-team-rooftop",
    title: "Assemble, Sort Of: Superhero Cats on the Roof",
    style: "Superhero team lineup, colorful suits, rooftop at dusk, comic-cinematic lighting",
    scene: "Three cats in different bright superhero suits stand in a line on a rooftop",
    description: "The three suited cats turn toward the camera as their capes settle.",
    paragraphs: [
      "A team-up, if everyone can agree who stands in front.",
      "Three suits, one roof, and a sky that is doing the poster work.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#SuperheroCat", "#TeamUp"],
    views: "870K views",
    uploaded: "5 days ago",
    likes: "54K",
  },
  {
    slug: "superhero-alley-sprint",
    title: "Mask On: Superhero Cat Sprints the Alley",
    style: "Superhero action still, motion blur, mask, neon alley, dynamic low angle",
    scene: "A masked cat in a bright suit sprints down a narrow alley toward the camera",
    description: "The masked cat blurs forward through the alley, cape streaming behind.",
    paragraphs: [
      "The mask is small. The sprint is not.",
      "An alley, a streak of color, and a cat who already knows the way out.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#SuperheroCat", "#AlleySprint"],
    views: "760K views",
    uploaded: "6 days ago",
    likes: "41K",
  },
  {
    slug: "action-rooftop-chase",
    title: "Don't Look Down: Action Cat Clears the Gap",
    style: "Action-movie still, rooftop chase, golden hour, motion and dust",
    scene: "A cat mid-leap between two rooftops with the street far below",
    description: "The cat stretches across the gap as gravel spills off the ledge behind it.",
    paragraphs: [
      "The chase moved to the roofs. The cat was already better at this.",
      "One gap, a lot of air, and a landing that has not happened yet.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#ActionCat", "#RooftopChase"],
    views: "1.5M views",
    uploaded: "2 days ago",
    likes: "93K",
  },
  {
    slug: "action-train-top",
    title: "Express Paw: Action Cat Rides the Train",
    style: "Action thriller, cat on a moving train roof, wind, sunset rails, cinematic",
    scene: "A cat braces on top of a speeding train as the landscape streaks past",
    description: "Wind flattens the cat's fur as the train roof hums under its paws.",
    paragraphs: [
      "Tickets were not part of the plan.",
      "The train is fast. The cat has decided to be faster than the wind.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#ActionCat", "#TrainTop"],
    views: "1.1M views",
    uploaded: "1 week ago",
    likes: "67K",
  },
  {
    slug: "action-spy-corridor",
    title: "Laser Hall: Spy Cat Times the Dash",
    style: "Spy movie, sleek corridor, crisscross red laser beams, cool blue light",
    scene: "A cat in a tiny black turtleneck pauses between red laser beams in a corridor",
    description: "The cat ducks under a laser and slides one paw into the next gap.",
    paragraphs: [
      "The hallway is a geometry problem. The cat treats it like a nap spot with rules.",
      "Red beams, blue walls, and perfect timing.",
    ],
    categories: ["Smart Cats"],
    hashtags: ["#ActionCat", "#SpyCat"],
    views: "690K views",
    uploaded: "8 days ago",
    likes: "38K",
  },
  {
    slug: "sports-soccer-strike",
    title: "Top Corner: Soccer Cat Takes the Shot",
    style: "Sports photography, night soccer stadium, floodlights, frozen action",
    scene: "A cat in a tiny jersey strikes a soccer ball on a floodlit pitch",
    description: "The cat's paw meets the ball as stadium lights flare behind the goal.",
    paragraphs: [
      "The keeper was a cone. The cone never stood a chance.",
      "Floodlights, a perfect strike, and grass in the air.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#SportsCat", "#Soccer"],
    views: "1.8M views",
    uploaded: "3 days ago",
    likes: "110K",
  },
  {
    slug: "sports-skate-bowl",
    title: "Drop In: Skate Cat Owns the Bowl",
    style: "Sports action photo, concrete skate bowl, afternoon sun, motion",
    scene: "A cat rides a skateboard up the wall of a concrete bowl",
    description: "The board lifts as the cat carves up the side of the bowl.",
    paragraphs: [
      "No pads. Questionable decisions. Excellent form.",
      "The bowl echoes, and the cat is already planning the next drop.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#SportsCat", "#SkateCat"],
    views: "940K views",
    uploaded: "5 days ago",
    likes: "72K",
  },
  {
    slug: "sports-boxing-ring",
    title: "Final Bell: Boxing Cat Holds the Ring",
    style: "Boxing sports photo, spotlight ring, red ropes, sweat-free dramatic light",
    scene: "A cat wearing tiny boxing gloves stands in a spotlighted ring",
    description: "The cat raises one glove as the spotlight tightens on the canvas.",
    paragraphs: [
      "The opponent left. The cat is calling that a win.",
      "Red ropes, one spotlight, and gloves that are mostly for the look.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#SportsCat", "#BoxingCat"],
    views: "580K views",
    uploaded: "9 days ago",
    likes: "31K",
  },
  {
    slug: "music-video-neon-chorus",
    title: "Chorus Hit: Music Video Cat on the Neon Set",
    style: "Pop music video, saturated neon set, lens flares, performer lighting",
    scene: "A cat strikes a singing pose on a neon music-video set with colored spotlights",
    description: "Colored spotlights swing onto the cat as it hits the chorus pose.",
    paragraphs: [
      "The set is louder than the song, which is saying something.",
      "Neon, a chorus, and a cat who knows exactly where the camera is.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#MusicVideo", "#NeonChorus"],
    views: "2.0M views",
    uploaded: "1 day ago",
    likes: "150K",
  },
  {
    slug: "music-video-rain-ballad",
    title: "Slow Chorus: Ballad Cat in the Rain",
    style: "Emotional music video, rainy night street, soft backlight, cinematic",
    scene: "A cat stands in gentle rain under a streetlamp like the cover of a ballad",
    description: "Rain beads on the cat's fur as it turns toward the streetlamp.",
    paragraphs: [
      "The ballad does not need lyrics if the streetlamp is doing this much.",
      "Slow, wet, and extremely committed to the mood.",
    ],
    categories: ["Cat ASMR"],
    hashtags: ["#MusicVideo", "#RainBallad"],
    views: "640K views",
    uploaded: "1 week ago",
    likes: "47K",
  },
  {
    slug: "music-video-dance-break",
    title: "Dance Break: Music Video Cat Hits the Floor",
    style: "Dance music video, glossy studio floor, colored gels, sharp choreography still",
    scene: "A cat freezes mid dance move on a glossy studio floor under pink and blue gels",
    description: "The cat snaps into a dance pose as the floor reflects the colored lights.",
    paragraphs: [
      "Choreography by instinct. Lighting by someone who owns too many gels.",
      "One beat, one pose, and a floor shiny enough to count as a mirror.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#MusicVideo", "#DanceBreak"],
    views: "1.2M views",
    uploaded: "4 days ago",
    likes: "89K",
  },
  {
    slug: "punk-basement-show",
    title: "Three Chords: Punk Cat in the Basement",
    style: "DIY punk concert photo, cramped basement, harsh flash, stickers, no readable text",
    scene: "A cat shouts into a microphone on a tiny basement stage with a drum kit behind it",
    description: "The cat leans into the microphone as the basement flash pops.",
    paragraphs: [
      "The ceiling is low, the amp is smaller than the cat, and the show is already too loud.",
      "Stickers on the wall, one mic, and zero interest in playing quietly.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#PunkCat", "#BasementShow"],
    views: "430K views",
    uploaded: "6 days ago",
    likes: "36K",
  },
  {
    slug: "punk-alley-gig",
    title: "Alley Set: Punk Cat and the Borrowed Amp",
    style: "Street punk concert, night alley, spray-paint wall with no letters, raw flash",
    scene: "A spiky-furred cat plays a tiny guitar beside a battered amp in a night alley",
    description: "The cat thrashes the tiny guitar as the amp rattles against the alley wall.",
    paragraphs: [
      "The venue is an alley because the alley did not say no.",
      "One amp, one guitar, and a riff that scares the trash cans.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#PunkCat", "#AlleyGig"],
    views: "510K views",
    uploaded: "2 weeks ago",
    likes: "29K",
  },
  {
    slug: "metal-stage-solo",
    title: "Solo Face: Metal Cat Under the Lights",
    style: "Heavy metal concert, huge stage, white spotlight beams, smoke, dramatic",
    scene: "A long-haired cat plays an electric guitar under crossing white concert beams",
    description: "Smoke rolls through the spotlight beams as the cat throws its head back over the guitar.",
    paragraphs: [
      "The solo has no notes yet. The hair is already doing the work.",
      "A huge stage, white beams, and a cat who rehearsed the headbang.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#MetalCat", "#GuitarSolo"],
    views: "1.4M views",
    uploaded: "3 days ago",
    likes: "102K",
  },
  {
    slug: "metal-crowd-barrier",
    title: "Front Row: Metal Cat at the Barrier",
    style: "Metal concert crowd photo, stage lights from behind, barrier, energetic, not violent",
    scene: "A cat in a studded collar stands at a concert barrier with stage lights blazing behind",
    description: "Stage light flares over the barrier as the cat plants both paws on the rail.",
    paragraphs: [
      "Front row was a suggestion. The cat treated it as a reservation.",
      "Studs, a barrier, and a wall of light where the band should be.",
    ],
    categories: ["Funny Cats"],
    hashtags: ["#MetalCat", "#FrontRow"],
    views: "770K views",
    uploaded: "1 week ago",
    likes: "58K",
  },
  {
    slug: "metal-drum-riser",
    title: "Double Kick: Metal Cat Takes the Drums",
    style: "Metal concert drum riser, red lights, cymbals, smoke, powerful still",
    scene: "A cat sits behind a drum kit on a riser surrounded by cymbals and red light",
    description: "A cymbal flashes as the cat lifts both paws over the kit.",
    paragraphs: [
      "The riser is high enough to see the whole room and ignore it.",
      "Red light, too many cymbals, and a count-in that is mostly attitude.",
    ],
    categories: ["Dramatic Cats"],
    hashtags: ["#MetalCat", "#DrumRiser"],
    views: "860K views",
    uploaded: "5 days ago",
    likes: "64K",
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
  if (batch.length < 20) throw new Error(`Expected at least 20 videos, got ${batch.length}.`);
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
