import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Page } from "@playwright/test";

const EMOJIS = ["😺", "😸", "😹", "😻"];

export type CatClipScore = {
  emoji: number;
  other: number;
  prompt: number;
};

export async function captureEmojiReferences(page: Page) {
  const ref = await page.context().newPage();
  await ref.setViewportSize({ width: 720, height: 220 });
  await ref.setContent(`<!doctype html>
    <style>
      html, body { margin: 0; background: #fff; }
      .row { display: flex; gap: 16px; align-items: center; padding: 16px; }
      .emoji { font-size: 96px; line-height: 1; }
      #other { font: 32px Arial, sans-serif; }
    </style>
    <div class="row">
      ${EMOJIS.map((emoji, index) => `<span class="emoji" id="e${index}">${emoji}</span>`).join("")}
      <span id="other">Subscribe</span>
    </div>`);
  await ref.evaluate(() => document.fonts.ready);
  const cats: Buffer[] = [];
  for (let index = 0; index < EMOJIS.length; index += 1) {
    cats.push(await ref.locator(`#e${index}`).screenshot({ type: "png" }));
  }
  const other = await ref.locator("#other").screenshot({ type: "png" });
  await ref.close();
  return { cats, other };
}

export async function captureVisibleCats(page: Page, limit = 6) {
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if (animation.playState === "running") animation.pause();
    }
  });

  try {
    const pageShot = await page.screenshot({ type: "png" });
    const boxes = await page.evaluate((wanted) => {
      const found: { x: number; y: number; width: number; height: number }[] = [];
      for (const node of document.querySelectorAll(".cat-confetti")) {
        const rect = node.getBoundingClientRect();
        const opacity = Number(getComputedStyle(node).opacity);
        if (opacity < 0.55 || rect.width < 12 || rect.height < 12) continue;
        const x = Math.max(0, rect.x);
        const y = Math.max(0, rect.y);
        const right = Math.min(window.innerWidth, rect.right);
        const bottom = Math.min(window.innerHeight, rect.bottom);
        if (right - x < 12 || bottom - y < 12) continue;
        found.push({ x, y, width: right - x, height: bottom - y });
      }
      const step = Math.max(1, Math.floor(found.length / wanted));
      const chosen: { x: number; y: number; width: number; height: number }[] = [];
      for (let index = 0; index < found.length && chosen.length < wanted; index += step) {
        const box = found[index];
        if (box) chosen.push(box);
      }
      return chosen;
    }, limit);
    const crops: Buffer[] = [];
    for (const box of boxes) {
      crops.push(
        await page.screenshot({
          type: "png",
          clip: { x: box.x, y: box.y, width: box.width, height: box.height },
        }),
      );
    }
    await page.waitForTimeout(1000);
    return { pageShot, crops };
  } finally {
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) {
        if (animation.playState === "paused") animation.play();
      }
    });
  }
}

export async function scoreCatScreenshots(
  samples: Buffer[],
  references: Buffer[],
  other: Buffer,
): Promise<CatClipScore[]> {
  const dir = await mkdtemp(join(tmpdir(), "cat-shots-"));
  try {
    for (let index = 0; index < samples.length; index += 1) {
      const shot = samples[index];
      if (shot) await writeFile(join(dir, `sample-${index}.png`), shot);
    }
    for (let index = 0; index < references.length; index += 1) {
      const shot = references[index];
      if (shot) await writeFile(join(dir, `ref-${index}.png`), shot);
    }
    await writeFile(join(dir, "other.png"), other);
    await runScorer(dir);
    return JSON.parse(await readFile(join(dir, "scores.json"), "utf8")) as CatClipScore[];
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function runScorer(dir: string) {
  const cli = join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
  return new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [cli, "e2e/score-cats.ts", dir], {
      cwd: process.cwd(),
      windowsHide: true,
    });
    let err = "";
    child.stderr.on("data", (chunk: Buffer) => {
      err += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err || `CLIP scorer exited with code ${code}`));
    });
  });
}
