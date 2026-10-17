import type { Metadata } from "next";
import { SubscriptionsShell } from "@/components/subscriptions-shell";
import { subscriptionFeed } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscriptions - CatTube",
  description: "Videos from channels you subscribe to on CatTube.",
};

export default async function SubscriptionsPage() {
  const feed = await subscriptionFeed();
  return <SubscriptionsShell signedIn={feed.signedIn} videos={feed.videos} />;
}
