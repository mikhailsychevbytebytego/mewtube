export function CatFace({
  color,
  innerEar = "#f3c2c8",
}: {
  color: string;
  innerEar?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full">
      <circle cx="32" cy="36" r="22" fill={color} />
      <path d="M16 30 12 12l16 10Z" fill={color} />
      <path d="M48 30 52 12 36 22Z" fill={color} />
      <path d="M18 28 16 16l10 8Z" fill={innerEar} />
      <path d="M46 28 48 16 38 24Z" fill={innerEar} />
      <ellipse cx="24" cy="36" rx="3.2" ry="4" fill="#2c241c" />
      <ellipse cx="40" cy="36" rx="3.2" ry="4" fill="#2c241c" />
      <circle cx="25" cy="34.6" r="1" fill="#fff" />
      <circle cx="41" cy="34.6" r="1" fill="#fff" />
      <path d="M30.2 42.2 33.8 42.2 32 45.2Z" fill="#e98998" />
      <path
        d="M14 40h8M42 40h8M15 44h7M42 44h7"
        stroke="#6a5344"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
