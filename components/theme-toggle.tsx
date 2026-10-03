"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("theme-change", onStoreChange);
  return () => window.removeEventListener("theme-change", onStoreChange);
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
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
