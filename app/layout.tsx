import type { Metadata } from "next";
import { Caveat, Roboto } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CatTube – Meow More Today",
  description:
    "Good Cats. Better Days. Watch kittens, compilations, and cozy cat videos on CatTube.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = (await cookies()).get("theme")?.value;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${caveat.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}
    >
      <body className={`${roboto.className} h-full`}>{children}</body>
    </html>
  );
}
