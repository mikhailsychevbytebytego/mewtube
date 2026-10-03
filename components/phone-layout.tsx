"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { PhoneIcon } from "@/components/icons";

const eventName = "layout-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(eventName, onStoreChange);
  return () => window.removeEventListener(eventName, onStoreChange);
}

function readPhone() {
  return localStorage.getItem("layout") === "phone";
}

function subscribeWidth(onStoreChange: () => void) {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function readWide() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function readEmbedded() {
  return window.self !== window.top;
}

export function applyPhone(phone: boolean) {
  localStorage.setItem("layout", phone ? "phone" : "desktop");
  window.dispatchEvent(new Event(eventName));
}

export function MobileToggle() {
  const phone = useSyncExternalStore(subscribe, readPhone, () => false);

  return (
    <button
      type="button"
      aria-pressed={phone}
      aria-label={phone ? "Show desktop layout" : "Show phone layout"}
      onClick={() => applyPhone(!phone)}
      className="hidden size-10 shrink-0 place-items-center rounded-full hover:bg-chip lg:grid"
    >
      <PhoneIcon />
    </button>
  );
}

function DeviceFrame() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState("");

  useEffect(() => {
    setSrc(window.location.pathname + window.location.search);
  }, []);

  function exit() {
    const here = window.location.pathname + window.location.search;
    let next = here;
    try {
      const location = frameRef.current?.contentWindow?.location;
      if (location && location.origin === window.location.origin) {
        next = location.pathname + location.search;
      }
    } catch {
      next = here;
    }
    applyPhone(false);
    if (next !== here) window.location.assign(next);
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-[#161616] p-4 text-white">
      <button
        type="button"
        onClick={exit}
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0f0f0f]"
      >
        Show desktop layout
      </button>
      <div className="h-[min(844px,calc(100dvh-72px))] w-[390px] overflow-hidden rounded-[36px] border-[10px] border-black bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        {src ? (
          <iframe ref={frameRef} title="Phone layout" src={src} className="size-full border-0 bg-white" />
        ) : null}
      </div>
    </div>
  );
}

export function PhoneShell({ children }: { children: ReactNode }) {
  const phone = useSyncExternalStore(subscribe, readPhone, () => false);
  const wide = useSyncExternalStore(subscribeWidth, readWide, () => false);
  const embedded = useSyncExternalStore(subscribe, readEmbedded, () => false);

  if (phone && wide && !embedded) return <DeviceFrame />;
  return children;
}
