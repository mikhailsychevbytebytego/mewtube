import { expect } from "@playwright/test";
import {
  captureEmojiReferences,
  captureVisibleCats,
  scoreCatScreenshots,
} from "./cat-shots";
import { test } from "./fixture";

const watchPath = "/watch?v=orange-kitten-bats-a-paper-airplane";

type CatProbe = {
  avg: number;
  frames: number;
  slow: number;
  count: number;
  pending: number;
  risen: number;
};

test("logged-out subscribe opens sign-in, then cats rise at 60fps", async ({
  page,
  aiTap,
  aiAssert,
  aiInput,
  aiBoolean,
  recordToReport,
}, testInfo) => {
  await page.goto(watchPath);
  await expect(page.getByRole("button", { name: "Subscribe", exact: true })).toBeVisible();
  const emojiReferences = await captureEmojiReferences(page);

  await aiAssert(
    "This is a video watch page. A Subscribe button sits beside the channel name. The header shows Sign in, so the viewer is signed out.",
  );

  await aiTap("the Subscribe button beside the channel name, under the video title");

  await aiAssert(
    'A dialog titled Sign in is open. It says "Sign in to subscribe to this channel." No cat face emojis are flying up the screen.',
  );

  expect(
    await aiBoolean("Is the channel button still labeled Subscribe, rather than Subscribed?"),
  ).toBe(true);
  await expect(page.locator(".cat-confetti")).toHaveCount(0);

  await aiTap('the text button that says "Need an account? Create one"');
  await aiAssert("The dialog now asks to create an account and shows Name, Email, and Password fields.");

  const email = `midscene-${Date.now()}@example.com`;
  await aiInput("Midscene Tester", "the Name field in the account dialog");
  await aiInput(email, "the Email field in the account dialog");
  await aiInput("testpass1", "the Password field in the account dialog");

  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setFocusEmulationEnabled", { enabled: true });

  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll(".cat-confetti")].filter((node) => {
        const box = node.getBoundingClientRect();
        return (
          Number(getComputedStyle(node).opacity) > 0.55 &&
          box.top > 0 &&
          box.bottom < window.innerHeight
        );
      }).length >= 8,
    null,
    { timeout: 20_000 },
  );
  const { pageShot, crops } = await captureVisibleCats(page);
  expect(crops.length).toBeGreaterThanOrEqual(4);
  await testInfo.attach("cat-emojis-on-screen.png", { body: pageShot, contentType: "image/png" });
  for (let index = 0; index < crops.length; index += 1) {
    const crop = crops[index];
    if (!crop) continue;
    await testInfo.attach(`cat-emoji-${index + 1}.png`, { body: crop, contentType: "image/png" });
  }
  await recordToReport("Cat emojis visible on screen", {
    content: "The burst was paused while the cats were on screen. The first image is the full page. The following images are the close-ups scored by CLIP.",
    screenshots: [
      { base64: pageShot.toString("base64"), description: "Full page with cat emojis frozen on screen" },
      ...crops.map((crop, index) => ({
        base64: crop.toString("base64"),
        description: `Cat emoji close-up ${index + 1}`,
      })),
    ],
  });

  await page.evaluate(() => {
    const samples: number[] = [];
    let last = 0;
    const started = performance.now();
    const tick = (now: number) => {
      if (last) samples.push(now - last);
      last = now;
      if (now - started < 1000) {
        requestAnimationFrame(tick);
        return;
      }
      const cats = [...document.querySelectorAll(".cat-confetti")];
      const motions = cats.flatMap((node) => node.getAnimations());
      const risen = cats.filter(
        (node) => node.getBoundingClientRect().top < window.innerHeight * 0.55,
      ).length;
      const avg = samples.reduce((sum, value) => sum + value, 0) / Math.max(samples.length, 1);
      (window as unknown as { __catProbe?: CatProbe }).__catProbe = {
        avg,
        frames: samples.length,
        slow: samples.filter((value) => value > 24).length,
        count: cats.length,
        pending: motions.filter((motion) => motion.pending).length,
        risen,
      };
    };
    requestAnimationFrame(tick);
  });

  await page.waitForFunction(
    () => Boolean((window as unknown as { __catProbe?: CatProbe }).__catProbe),
    null,
    { timeout: 5_000 },
  );

  const probe = await page.evaluate(
    () => (window as unknown as { __catProbe: CatProbe }).__catProbe,
  );
  console.log("cat confetti probe", probe);

  expect(probe.count).toBeGreaterThanOrEqual(200);
  expect(probe.risen).toBeGreaterThan(100);
  expect(probe.pending).toBe(0);

  await aiAssert(
    "The account dialog is closed. The channel button says Subscribed. Many cat face emojis are visible on the page, spread upward from the bottom like confetti.",
  );

  expect(probe.frames).toBeGreaterThan(45);
  expect(probe.avg).toBeLessThan(20);
  expect(probe.slow).toBeLessThan(8);

  const clipScores = await scoreCatScreenshots(crops, emojiReferences.cats, emojiReferences.other);
  console.log("cat emoji clip", clipScores);
  for (const score of clipScores) {
    expect(score.emoji).toBeGreaterThan(0.7);
    expect(score.emoji).toBeGreaterThan(score.other + 0.03);
  }
  await expect(page.getByRole("button", { name: "Subscribed", exact: true })).toBeVisible();

  await page.waitForFunction(() => document.querySelectorAll(".cat-confetti").length === 0, null, {
    timeout: 8_000,
  });

  await aiTap("the Subscribed button beside the channel name");
  await page.waitForTimeout(800);
  await expect(page.locator(".cat-confetti")).toHaveCount(0);
  await aiAssert(
    "The channel button says Subscribe again. No cat face emojis are flying on the screen. The header shows the viewer is signed in.",
  );
});
