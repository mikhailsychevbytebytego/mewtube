import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AutoTokenizer,
  CLIPTextModelWithProjection,
  env,
  type PreTrainedTokenizer,
  type Tensor,
} from "@xenova/transformers";

env.allowLocalModels = false;
env.cacheDir = join(tmpdir(), "cattube-transformers");

const MODEL = "Xenova/clip-vit-base-patch32";
const DIMENSIONS = 512;

type Loaded = {
  tokenizer: PreTrainedTokenizer;
  text: CLIPTextModelWithProjection;
};

let loaded: Promise<Loaded> | null = null;
let queue: Promise<unknown> = Promise.resolve();

function load() {
  loaded ??= Promise.all([
    AutoTokenizer.from_pretrained(MODEL),
    CLIPTextModelWithProjection.from_pretrained(MODEL),
  ]).then(([tokenizer, text]) => ({ tokenizer, text }));
  return loaded;
}

function normalize(values: number[]) {
  const norm = Math.hypot(...values);
  if (norm === 0) throw new Error("CLIP returned a zero embedding.");
  return values.map((value) => value / norm);
}

export function embedQuery(query: string): Promise<number[]> {
  const run = queue.then(async () => {
    const { tokenizer, text } = await load();
    const inputs = tokenizer([query], { padding: true, truncation: true });
    const { text_embeds } = (await text(inputs)) as { text_embeds: Tensor };
    const width = text_embeds.dims.at(-1);
    const values = Array.from(text_embeds.data, (value) => Number(value)).slice(0, width);
    if (width !== DIMENSIONS || values.length !== DIMENSIONS) {
      throw new Error(`Expected a ${DIMENSIONS}-d CLIP embedding, got ${values.length}.`);
    }
    return normalize(values);
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
