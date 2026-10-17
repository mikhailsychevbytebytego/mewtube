import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AutoTokenizer,
  CLIPTextModelWithProjection,
  env,
  pipeline,
  type ImageFeatureExtractionPipeline,
  type PreTrainedTokenizer,
  type Tensor,
} from "@xenova/transformers";

env.allowLocalModels = false;
env.cacheDir = join(tmpdir(), "cattube-transformers");

const MODEL = "Xenova/clip-vit-base-patch32";
const DIMENSIONS = 512;
const CAT_PROMPT = "a yellow smiling cat face emoji";

type LoadedText = {
  tokenizer: PreTrainedTokenizer;
  text: CLIPTextModelWithProjection;
};

let images: Promise<ImageFeatureExtractionPipeline> | null = null;
let textModel: Promise<LoadedText> | null = null;
let queue: Promise<unknown> = Promise.resolve();
let scratch: Promise<string> | null = null;

function imageModel() {
  images ??= pipeline("image-feature-extraction", MODEL);
  return images;
}

function loadText() {
  textModel ??= Promise.all([
    AutoTokenizer.from_pretrained(MODEL),
    CLIPTextModelWithProjection.from_pretrained(MODEL),
  ]).then(([tokenizer, text]) => ({ tokenizer, text }));
  return textModel;
}

function scratchDir() {
  scratch ??= mkdtemp(join(tmpdir(), "cat-clip-"));
  return scratch;
}

function normalize(values: number[]) {
  const norm = Math.hypot(...values);
  if (norm === 0) throw new Error("CLIP returned a zero embedding.");
  return values.map((value) => value / norm);
}

function cosine(left: number[], right: number[]) {
  let sum = 0;
  for (let index = 0; index < left.length; index += 1) {
    sum += (left[index] ?? 0) * (right[index] ?? 0);
  }
  return sum;
}

function embedImage(png: Buffer) {
  const run = queue.then(async () => {
    const file = join(await scratchDir(), `${Date.now()}-${Math.random().toString(16).slice(2)}.png`);
    await writeFile(file, png);
    const extract = await imageModel();
    const output = await extract(file);
    const values = Array.from(output.data, (value) => Number(value));
    if (output.dims.at(-1) !== DIMENSIONS || values.length !== DIMENSIONS) {
      throw new Error(`Expected a ${DIMENSIONS}-d CLIP image embedding, got ${values.length}.`);
    }
    return normalize(values);
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function embedText(prompt: string) {
  const run = queue.then(async () => {
    const { tokenizer, text } = await loadText();
    const inputs = tokenizer([prompt], { padding: true, truncation: true });
    const { text_embeds } = (await text(inputs)) as { text_embeds: Tensor };
    const width = text_embeds.dims.at(-1);
    const values = Array.from(text_embeds.data, (value) => Number(value)).slice(0, width);
    if (width !== DIMENSIONS || values.length !== DIMENSIONS) {
      throw new Error(`Expected a ${DIMENSIONS}-d CLIP text embedding, got ${values.length}.`);
    }
    return normalize(values);
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export type CatClipScore = {
  emoji: number;
  other: number;
  prompt: number;
};

export async function fuzzyClipScores(
  samples: Buffer[],
  references: Buffer[],
  other: Buffer,
): Promise<CatClipScore[]> {
  const referenceEmbeds: number[][] = [];
  for (const reference of references) referenceEmbeds.push(await embedImage(reference));
  const otherEmbed = await embedImage(other);
  const promptEmbed = await embedText(CAT_PROMPT);
  const scores: CatClipScore[] = [];
  for (const sample of samples) {
    const embedding = await embedImage(sample);
    scores.push({
      emoji: Math.max(...referenceEmbeds.map((reference) => cosine(embedding, reference))),
      other: cosine(embedding, otherEmbed),
      prompt: cosine(embedding, promptEmbed),
    });
  }
  return scores;
}

export async function releaseClipScratch() {
  const directory = scratch ? await scratch : null;
  scratch = null;
  if (directory) await rm(directory, { recursive: true, force: true });
}
