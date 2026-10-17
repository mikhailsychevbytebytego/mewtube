"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const cats = ["😺", "😸", "😹", "😻"];
const count = 240;
const paths = [
  "cat-rise-0",
  "cat-rise-1",
  "cat-rise-2",
  "cat-rise-3",
  "cat-rise-4",
  "cat-rise-5",
  "cat-rise-6",
  "cat-rise-7",
];

type Piece = {
  id: number;
  emoji: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  path: string;
};

function burstPieces(): Piece[] {
  const width = window.innerWidth;
  return Array.from({ length: count }, (_, id) => ({
    id,
    emoji: cats[Math.floor(Math.random() * cats.length)] ?? "😺",
    x: Math.random() * width,
    size: 22 + Math.random() * 18,
    duration: 3000 + Math.random() * 1800,
    delay: Math.random() * 280,
    path: paths[id % paths.length] ?? "cat-rise-0",
  }));
}

export function CatConfetti({ burst }: { burst: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!burst) return;
    setPieces(burstPieces());
    const timer = window.setTimeout(() => setPieces([]), 5600);
    return () => window.clearTimeout(timer);
  }, [burst]);

  if (pieces.length === 0) return null;

  return createPortal(
    <div
      className="pointer-events-none overflow-hidden"
      style={{ position: "fixed", inset: 0, zIndex: 70 }}
      aria-hidden
    >
      {pieces.map((piece) => (
        <span
          key={`${burst}-${piece.id}`}
          className={`cat-confetti absolute ${piece.path}`}
          style={{
            left: piece.x,
            bottom: 0,
            fontSize: piece.size,
            animationDuration: `${piece.duration}ms`,
            animationDelay: `${piece.delay}ms`,
          }}
        >
          {piece.emoji}
        </span>
      ))}
    </div>,
    document.body,
  );
}
