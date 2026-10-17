import { env, pipeline, type ImageFeatureExtractionPipeline } from "@xenova/transformers";

env.allowLocalModels = false;

const MODEL = "Xenova/clip-vit-base-patch32";
export const CLIP_DIMENSIONS = 512;

let extractor: Promise<ImageFeatureExtractionPipeline> | null = null;
let queue: Promise<unknown> = Promise.resolve();

function model() {
  extractor ??= pipeline("image-feature-extraction", MODEL);
  return extractor;
}

export function embedThumbnail(imageUrl: string): Promise<number[]> {
  const run = queue.then(async () => {
    const extract = await model();
    const output = await extract(imageUrl);
    const values = Array.from(output.data, (value) => Number(value));
    if (output.dims.at(-1) !== CLIP_DIMENSIONS || values.length !== CLIP_DIMENSIONS) {
      throw new Error(`Expected a ${CLIP_DIMENSIONS}-d CLIP embedding, got ${values.length}.`);
    }
    const norm = Math.hypot(...values);
    if (norm === 0) throw new Error("CLIP returned a zero embedding.");
    return values.map((value) => value / norm);
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
