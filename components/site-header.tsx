import Link from "next/link";
import { BellIcon, MenuIcon, MicIcon, PawIcon, PlayMark, SearchIcon } from "@/components/icons";
import { CatFace } from "@/components/cat-face";
import { ThemeToggle } from "@/components/theme-toggle";

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
  query,
  onQueryChange,
  onMenu,
  onHome,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onMenu: () => void;
  onHome: () => void;
}) {
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
          onSubmit={(event) => event.preventDefault()}
        >
          <SearchField id="search" query={query} onQueryChange={onQueryChange} />
          <button
            type="button"
            aria-label="Voice search"
            className="hidden size-10 shrink-0 place-items-center rounded-full bg-chip hover:bg-hover sm:grid"
          >
            <MicIcon />
          </button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0 sm:gap-2">
          <p className="mr-2 hidden font-script text-[26px] leading-none text-ink xl:block">
            Life is Better with Cats
          </p>
          <Link
            href="/admin"
            className="rounded-full px-3 py-2 text-sm font-medium hover:bg-chip"
          >
            Admin
          </Link>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Notifications"
            className="grid size-10 place-items-center rounded-full hover:bg-chip"
          >
            <BellIcon />
          </button>
          <button
            type="button"
            aria-label="Account"
            className="grid size-8 place-items-center overflow-hidden rounded-full bg-[#f3d2b0]"
          >
            <CatFace color="#e09a62" />
          </button>
        </div>
      </div>

      <form
        role="search"
        className="px-3 pb-2 sm:hidden"
        onSubmit={(event) => event.preventDefault()}
      >
        <SearchField
          id="search-mobile"
          query={query}
          onQueryChange={onQueryChange}
        />
      </form>
    </header>
  );
}
