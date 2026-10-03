import type { Metadata } from "next";
import Script from "next/script";
import { Caveat, Roboto } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className={`${roboto.className} h-full`}>
        <Script id="theme" strategy="beforeInteractive">
          {`try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
