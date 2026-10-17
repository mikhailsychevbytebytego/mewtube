"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

const ONE_YEAR = 60 * 60 * 24 * 365;

function writeTheme(theme: "dark" | "light") {
  localStorage.setItem("theme", theme);
  document.cookie = `theme=${theme}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("theme-change", onStoreChange);
  return () => window.removeEventListener("theme-change", onStoreChange);
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored !== "dark" && stored !== "light") return;
    document.documentElement.classList.toggle("dark", stored === "dark");
    document.cookie = `theme=${stored}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    window.dispatchEvent(new Event("theme-change"));
  }, []);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    writeTheme(next ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  }

  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-chip"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
