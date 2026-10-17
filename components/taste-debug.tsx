"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  TASTE_CLICK_BOOST,
  TASTE_DECAY,
  TASTE_WATCH_BOOST,
  tasteDimension,
  tasteDimensions,
} from "@/lib/taste";
import {
  getServerTasteProfile,
  getTasteProfile,
  resetTasteProfile,
  subscribeTaste,
} from "@/lib/taste-profile";

let debugOpen = false;
const debugListeners = new Set<() => void>();

function subscribeDebug(listener: () => void) {
  debugListeners.add(listener);
  return () => debugListeners.delete(listener);
}

function getDebugOpen() {
  return debugOpen;
}

function setDebugOpen(open: boolean) {
  debugOpen = open;
  for (const listener of debugListeners) listener();
}

export function toggleTasteDebug() {
  setDebugOpen(!debugOpen);
}

function formatScore(score: number) {
  return score.toFixed(2);
}

export function TasteDebug() {
  const open = useSyncExternalStore(subscribeDebug, getDebugOpen, () => false);
  const profile = useSyncExternalStore(subscribeTaste, getTasteProfile, getServerTasteProfile);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDebugOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const rows = tasteDimensions
    .map((dimension) => ({
      ...dimension,
      score: profile.scores[dimension.id] ?? 0,
    }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  const maxScore = rows.reduce((max, row) => Math.max(max, row.score), 0);
  const boosted = new Set(profile.last?.boosted ?? []);

  if (!open) return null;

  return (
    <aside
      id="taste-debug"
      role="dialog"
      aria-label="Taste debug"
      className="fixed inset-x-0 bottom-0 top-14 z-50 overflow-y-auto border-t border-line bg-background p-4 text-ink shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[420px] sm:border-l sm:border-t-0"
    >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">What CatTube knows</h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                {`${tasteDimensions.length} tastes. A click adds ${TASTE_CLICK_BOOST.toFixed(2)}, and every 5 seconds of watching adds ${TASTE_WATCH_BOOST.toFixed(2)}. Each new signal fades every other taste by ${Math.round((1 - TASTE_DECAY) * 100)}%.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDebugOpen(false)}
              className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-chip"
            >
              Close
            </button>
          </div>

          <p className="mt-4 text-sm">
            {profile.signals === 0
              ? "No signals yet. Open a video and let it play."
              : `${profile.signals} signal${profile.signals === 1 ? "" : "s"} so far.`}
          </p>
          {profile.last ? (
            <p className="mt-1 text-sm text-muted">
              {profile.last.kind === "click"
                ? "Opened"
                : `Watched ${profile.last.watchSeconds}s`}
              {": "}
              {profile.last.title}
            </p>
          ) : null}
          {profile.last ? (
            <p className="mt-2 text-xs leading-5 text-muted">
              Boosted:{" "}
              {profile.last.boosted
                .map((id) => tasteDimension(id)?.label ?? id)
                .join(", ")}
            </p>
          ) : null}

          <button
            type="button"
            onClick={resetTasteProfile}
            className="mt-4 rounded-full bg-chip px-3 py-1.5 text-sm font-medium hover:bg-hover"
          >
            Reset taste
          </button>

          <ol className="mt-4 space-y-2">
            {rows.map((row) => {
              const width = maxScore > 0 ? (row.score / maxScore) * 100 : 0;
              const active = boosted.has(row.id);
              return (
                <li key={row.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      {row.label}
                      <span className="ml-2 text-xs text-muted">{row.group}</span>
                      {active ? (
                        <span className="ml-2 text-xs font-medium">up</span>
                      ) : row.score > 0 ? (
                        <span className="ml-2 text-xs text-muted">fading</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {formatScore(row.score)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-chip">
                    <div
                      className="h-full rounded-full bg-ink"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
    </aside>
  );
}
