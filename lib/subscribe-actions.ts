"use server";

import { listSubscriptionChannels, setSubscriptionRecord } from "@/lib/subscriptions";

export async function listSubscriptions() {
  return listSubscriptionChannels();
}

export async function setSubscription(channelSlug: string, subscribe: boolean) {
  return setSubscriptionRecord(channelSlug, subscribe);
}
