import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

process.env.MIDSCENE_MODEL_BASE_URL ??= "codex://app-server";
process.env.MIDSCENE_MODEL_NAME ??= "gpt-6.1-sol";
process.env.MIDSCENE_MODEL_FAMILY ??= "gpt-6";
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY ??= "1";

function ensureCodexOnPath() {
  try {
    execSync("codex --version", { stdio: "ignore" });
    return;
  } catch {
    // Codex is installed per-user, not always on PATH.
  }

  const binRoot = join(homedir(), "AppData", "Local", "OpenAI", "Codex", "bin");
  if (!existsSync(binRoot)) return;

  const directory = readdirSync(binRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(binRoot, entry.name))
    .find((dir) => existsSync(join(dir, process.platform === "win32" ? "codex.exe" : "codex")));

  if (directory) process.env.PATH = `${directory};${process.env.PATH ?? ""}`;
}

ensureCodexOnPath();

export default defineConfig({
  testDir: "./e2e",
  timeout: 6 * 60 * 1000,
  workers: 1,
  fullyParallel: false,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["@midscene/web/playwright-reporter", { type: "merged" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    viewport: { width: 1280, height: 800 },
    trace: "on",
    video: "on",
    screenshot: "on",
    launchOptions: {
      args: [
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
      ],
    },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
