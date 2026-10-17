"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClockIcon,
  MusicIcon,
  PlayMark,
  PlaylistIcon,
  ThumbIcon,
} from "@/components/icons";
import { GuideSidebar } from "@/components/guide-sidebar";
import { SiteHeader } from "@/components/site-header";

const benefits = [
  {
    title: "Fewer interruptions",
    detail: "Videos play without the usual ads. A surprise tuna commercial may still sneak in.",
    icon: <ThumbIcon />,
  },
  {
    title: "Play in the background",
    detail: "Keep the meows going while the screen is off, or while you pretend to work.",
    icon: <ClockIcon />,
  },
  {
    title: "Downloads",
    detail: "Save videos for the litter box, the train, and anywhere else the wifi gives up.",
    icon: <PlaylistIcon />,
  },
  {
    title: "CatTube Music",
    detail: "A separate pile of songs, purring loops, and playlists made for cats.",
    icon: <MusicIcon />,
  },
];

const offerings = [
  {
    name: "Individual",
    tagline: "One person. Every cat.",
    monthly: "$13.99",
    yearly: "$139.99",
    features: [
      "Ad-light videos across CatTube",
      "Background play and downloads",
      "CatTube Music included",
      "Higher quality, when the cat holds still",
    ],
    cta: "Get Individual",
    featured: true,
  },
  {
    name: "Family Litter",
    tagline: "Share with the household.",
    monthly: "$22.99",
    yearly: "$229.99",
    features: [
      "Up to 5 people on one plan",
      "Each person keeps their own meow history",
      "Background play and downloads",
      "CatTube Music for every member",
    ],
    cta: "Get Family",
    featured: false,
  },
  {
    name: "Student",
    tagline: "Same perks, smaller bowl.",
    monthly: "$7.99",
    yearly: "$79.99",
    features: [
      "Everything in Individual",
      "For students with a valid school email",
      "Renews at the student price for 4 years",
      "Does not include extra treats",
    ],
    cta: "Get Student",
    featured: false,
  },
  {
    name: "CatTube Music",
    tagline: "Songs only. No videos.",
    monthly: "$10.99",
    yearly: "$109.99",
    features: [
      "Ad-free music and purring mixes",
      "Background listening",
      "Offline playlists",
      "No video library",
    ],
    cta: "Get Music",
    featured: false,
  },
];

export function PremiumScreen() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [youOpen, setYouOpen] = useState(true);
  const [yearly, setYearly] = useState(false);

  function goHome() {
    setMobileOpen(false);
    router.push("/");
  }

  function toggleGuide() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((open) => !open);
      return;
    }
    setMobileOpen((open) => !open);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-ink">
      <SiteHeader query="" onMenu={toggleGuide} onHome={goHome} />
      <div className="flex min-h-0 flex-1">
        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close guide"
            className="fixed inset-x-0 bottom-0 top-[104px] z-30 bg-black/40 sm:top-[68px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        <GuideSidebar
          mobileOpen={mobileOpen}
          collapsed={collapsed}
          youOpen={youOpen}
          onToggleYou={() => setYouOpen((open) => !open)}
          onHome={goHome}
          onCloseMobile={() => setMobileOpen(false)}
          homeCurrent={false}
          premiumCurrent
        />
        <main className="min-w-0 flex-1 overflow-y-auto" aria-label="CatTube Premium">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
            <section className="rounded-2xl border border-line bg-chip px-6 py-8 sm:px-10 sm:py-12">
              <div className="flex items-center gap-3">
                <PlayMark className="h-8 w-11" />
                <p className="text-xs font-medium tracking-[0.14em] text-muted">
                  CATTUBE PREMIUM
                </p>
              </div>
              <h1 className="mt-4 max-w-xl text-3xl font-medium leading-tight sm:text-4xl">
                More cats. Zero ads. (Maybe.)
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted sm:text-base">
                Watch without the usual interruptions, download videos for later, and
                keep the music playing after the screen goes dark.
              </p>
              <button
                type="button"
                className="mt-6 h-10 rounded-full bg-ink px-5 text-sm font-medium text-background"
              >
                Try 1 month free
              </button>
            </section>

            <section aria-label="Benefits" className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex gap-4 rounded-xl border border-line px-4 py-4"
                >
                  <span className="mt-0.5 text-ink">{benefit.icon}</span>
                  <span>
                    <span className="block text-sm font-medium">{benefit.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-muted">
                      {benefit.detail}
                    </span>
                  </span>
                </div>
              ))}
            </section>

            <section aria-label="Plans" className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium">Choose a plan</h2>
                  <p className="mt-1 text-sm text-muted">
                    {yearly ? "Billed once a year." : "Billed every month."}
                  </p>
                </div>
                <div className="inline-flex rounded-full bg-chip p-1 text-sm">
                  <button
                    type="button"
                    aria-pressed={!yearly}
                    onClick={() => setYearly(false)}
                    className={`h-8 rounded-full px-4 ${
                      yearly ? "text-ink" : "bg-ink font-medium text-background"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    aria-pressed={yearly}
                    onClick={() => setYearly(true)}
                    className={`h-8 rounded-full px-4 ${
                      yearly ? "bg-ink font-medium text-background" : "text-ink"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {offerings.map((offering) => (
                  <article
                    key={offering.name}
                    className={`flex flex-col rounded-2xl border p-5 ${
                      offering.featured ? "border-ink" : "border-line"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-medium">{offering.name}</h3>
                        <p className="mt-1 text-sm text-muted">{offering.tagline}</p>
                      </div>
                      {offering.featured ? (
                        <span className="shrink-0 rounded-full bg-chip px-2.5 py-1 text-xs font-medium">
                          Most popular
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-5">
                      <span className="text-3xl font-medium">
                        {yearly ? offering.yearly : offering.monthly}
                      </span>
                      <span className="ml-1 text-sm text-muted">
                        {yearly ? "/year" : "/month"}
                      </span>
                    </p>
                    <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                      {offering.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <span aria-hidden className="text-muted">
                            •
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`mt-6 h-10 rounded-full text-sm font-medium ${
                        offering.featured
                          ? "bg-ink text-background"
                          : "bg-chip hover:bg-hover"
                      }`}
                    >
                      {offering.cta}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
