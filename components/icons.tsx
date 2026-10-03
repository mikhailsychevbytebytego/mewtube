import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon() {
  return (
    <Icon>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function SearchIcon() {
  return (
    <Icon className="size-5">
      <circle cx="11" cy="11" r="6.25" />
      <path d="M16 16.5 20 20.5" />
    </Icon>
  );
}

export function MicIcon() {
  return (
    <Icon>
      <rect x="9" y="3.5" width="6" height="10" rx="3" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20M8.5 20h7" />
    </Icon>
  );
}

export function BellIcon() {
  return (
    <Icon>
      <path d="M6 16.5h12l-1.2-2V10a4.8 4.8 0 0 0-9.6 0v4.5L6 16.5Z" />
      <path d="M10 16.5a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function HomeIcon({ filled = false }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0">
        <path
          fill="currentColor"
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-9.5Z"
        />
      </svg>
    );
  }

  return (
    <Icon>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-9.5Z" />
    </Icon>
  );
}

export function ShortsIcon() {
  return (
    <Icon>
      <rect x="7" y="3" width="10" height="18" rx="3" />
      <path d="m11 9.5 4 2.5-4 2.5v-5Z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function SubscriptionsIcon() {
  return (
    <Icon>
      <rect x="3.5" y="6" width="13" height="12" rx="2" />
      <path d="M16.5 9.5h2.2A1.3 1.3 0 0 1 20 10.8v5.4a1.3 1.3 0 0 1-1.3 1.3H8" />
      <path d="m8.5 10 4 2.2-4 2.2V10Z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function MeowmentsIcon() {
  return (
    <Icon>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M8 5v14M3.5 9.5h17M3.5 14.5h17" />
    </Icon>
  );
}

export function ClockIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </Icon>
  );
}

export function ThumbIcon() {
  return (
    <Icon>
      <path d="M8 10.5v8H5.2A1.2 1.2 0 0 1 4 17.3v-5.6A1.2 1.2 0 0 1 5.2 10.5H8Z" />
      <path d="M8 10.5 10.8 4.8a1.6 1.6 0 0 1 1.5-1 1.7 1.7 0 0 1 1.7 1.7V9h4.2a1.6 1.6 0 0 1 1.6 1.9l-1 6.2a1.6 1.6 0 0 1-1.6 1.4H8" />
    </Icon>
  );
}

export function PlaylistIcon() {
  return (
    <Icon>
      <path d="M4 7h11M4 12h11M4 17h7" />
      <path d="m16 15 4 2.2-4 2.2V15Z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function FlameIcon() {
  return (
    <Icon>
      <path d="M12 3s1 3 1 4.5C13 9 12 10 12 10s2.5-.4 3.5-2.2C17 10 18 12 18 14.2 18 17.4 15.3 20 12 20s-6-2.6-6-5.8C6 11 8 8.5 8 8.5S9 11 10.2 11C10.2 8 12 3 12 3Z" />
    </Icon>
  );
}

export function MusicIcon() {
  return (
    <Icon>
      <path d="M9 17V6.5l10-2V15" />
      <circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="15" r="2.2" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function LiveIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6" />
      <path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
    </Icon>
  );
}

export function GamepadIcon() {
  return (
    <Icon>
      <rect x="3" y="8" width="18" height="9" rx="4.5" />
      <path d="M8 11v4M6 13h4M15.5 12h.01M17.5 14.5h.01" />
    </Icon>
  );
}

export function NewsIcon() {
  return (
    <Icon>
      <path d="M5 6.5h11a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6.5Z" />
      <path d="M18 9h1.2A1.8 1.8 0 0 1 21 10.8V16a2 2 0 0 1-2 2M8 10h6M8 13.5h6" />
    </Icon>
  );
}

export function TrophyIcon() {
  return (
    <Icon>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 10M16 6h2.5A2.5 2.5 0 0 1 16 10M12 13v3M9 20h6M10 17h4" />
    </Icon>
  );
}

export function BulbIcon() {
  return (
    <Icon>
      <path d="M9 17h6M9.5 17a4.8 4.8 0 1 1 5 0" />
      <path d="M10 20h4" />
    </Icon>
  );
}

export function ShirtIcon() {
  return (
    <Icon>
      <path d="M9 5 7 7 4 6.2 6.2 11 8 10.2V19h8v-8.8l1.8.8L20 6.2 17 7 15 5a3 3 0 0 1-6 0Z" />
    </Icon>
  );
}

export function VrIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.2 12.4a4.2 4.2 0 0 1 7.2-2.2M15.8 11.6a4.2 4.2 0 0 1-7.2 2.2" />
      <path d="M15.2 9.2h1.6V11M8.8 14.8H7.2V13" />
    </Icon>
  );
}

export function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <Icon className="size-5">
      <path d="M16.5 13.5A6.5 6.5 0 0 1 9 5.2 6.5 6.5 0 1 0 16.5 13.5Z" />
    </Icon>
  );
}

export function SunIcon() {
  return (
    <Icon className="size-5">
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 3.5v1.8M12 18.7v1.8M3.5 12h1.8M18.7 12h1.8M6 6l1.3 1.3M16.7 16.7 18 18M18 6l-1.3 1.3M7.3 16.7 6 18" />
    </Icon>
  );
}

export function PlayMark({ className = "h-5 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" aria-hidden="true" className={className}>
      <rect width="28" height="20" rx="5" fill="#FF0000" />
      <path d="M11.2 5.2v9.6L20 10l-8.8-4.8Z" fill="#fff" />
    </svg>
  );
}

export function PawIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <ellipse cx="12" cy="15.6" rx="4.1" ry="3.2" />
      <circle cx="6.3" cy="10" r="1.7" />
      <circle cx="10" cy="7.1" r="1.7" />
      <circle cx="14.2" cy="7.1" r="1.7" />
      <circle cx="17.8" cy="10.2" r="1.7" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0">
      <circle cx="8" cy="8" r="8" fill="#606060" />
      <path
        d="M4.6 8.2 6.8 10.3 11.4 5.7"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
