"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellIcon, MenuIcon, PawIcon, PlayMark, SearchIcon } from "@/components/icons";
import { CatFace } from "@/components/cat-face";
import { TasteDebug, toggleTasteDebug } from "@/components/taste-debug";
import { ThemeToggle } from "@/components/theme-toggle";
import { VoiceSearchButton } from "@/components/voice-search-button";
import { authClient } from "@/lib/auth-client";
import { searchHref } from "@/lib/videos";

function SearchField({
  id,
  query,
  onQueryChange,
}: {
  id: string;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="flex h-10 w-full min-w-0 max-w-[640px] items-center rounded-full border border-field-border pl-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-[#1c62b9]">
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search for cats, meows, and more..."
        className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        aria-label="Search"
        className="grid h-10 w-14 shrink-0 place-items-center rounded-r-full border-l border-field-border bg-field hover:bg-hover"
      >
        <SearchIcon />
      </button>
    </div>
  );
}

export function SiteHeader({
  query = "",
  onMenu,
  onHome,
}: {
  query?: string;
  onMenu: () => void;
  onHome: () => void;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [draft, setDraft] = useState(query);
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(searchHref(draft));
  }

  async function signOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <header className="z-50 shrink-0 border-b border-line bg-background">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-[68px] sm:px-4">
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Guide"
            className="grid size-10 place-items-center rounded-full hover:bg-chip"
          >
            <MenuIcon />
          </button>
          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-chip"
          >
            <PlayMark />
            <span className="text-left leading-none">
              <span className="flex items-center gap-1 text-[20px] font-bold tracking-tight text-ink">
                CatTube
                <PawIcon className="size-3.5" />
              </span>
              <span className="mt-1 hidden text-[11px] font-normal text-muted sm:block">
                Good Cats. Better Days.
              </span>
            </span>
          </button>
        </div>

        <form
          role="search"
          className="mx-auto hidden min-w-0 flex-1 items-center justify-center gap-3 px-2 sm:flex sm:px-4"
          onSubmit={submit}
        >
          <SearchField id="search" query={draft} onQueryChange={setDraft} />
          <VoiceSearchButton
            onChange={setDraft}
            onCommit={(transcript) => router.push(searchHref(transcript))}
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0 sm:gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Notifications"
            className="grid size-10 place-items-center rounded-full hover:bg-chip"
          >
            <BellIcon />
          </button>
          {isPending || session ? null : (
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-medium hover:bg-chip"
            >
              Sign in
            </Link>
          )}
          <div ref={accountRef} className="relative">
            <button
              type="button"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="account-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-8 place-items-center overflow-hidden rounded-full bg-[#f3d2b0]"
            >
              <CatFace color="#e09a62" />
            </button>
            {menuOpen ? (
              <div
                id="account-menu"
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-xl border border-line bg-background py-1 shadow-lg"
              >
                <Link
                  href="/studio"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium hover:bg-chip"
                >
                  Your channel
                </Link>
                {session?.user.admin ? (
                  <Link
                    href="/admin"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium hover:bg-chip"
                  >
                    Admin
                  </Link>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    toggleTasteDebug();
                  }}
                  className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-chip"
                >
                  Taste
                </button>
                {session ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      void signOut();
                    }}
                    className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-chip"
                  >
                    Sign out
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <TasteDebug />

      <form
        role="search"
        className="flex items-center gap-2 px-3 pb-2 sm:hidden"
        onSubmit={submit}
      >
        <div className="min-w-0 flex-1">
          <SearchField
            id="search-mobile"
            query={draft}
            onQueryChange={setDraft}
          />
        </div>
        <VoiceSearchButton
          onChange={setDraft}
          onCommit={(transcript) => router.push(searchHref(transcript))}
        />
      </form>
    </header>
  );
}
