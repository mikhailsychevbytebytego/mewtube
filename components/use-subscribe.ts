"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { setSubscription } from "@/lib/subscribe-actions";

export const subscriptionsChanged = "cattube-subscriptions";

export function useSubscribe(channelHandle?: string, initialSubscribed = false) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [confetti, setConfetti] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setSubscribed(initialSubscribed);
  }, [initialSubscribed, channelHandle]);

  const hadSession = useRef(false);
  useEffect(() => {
    if (session) hadSession.current = true;
    if (!isPending && !session && hadSession.current) setSubscribed(false);
  }, [isPending, session]);

  async function persist(next: boolean) {
    if (!channelHandle) return;
    try {
      const saved = await setSubscription(channelHandle, next);
      setSubscribed(saved);
      if (saved === next) {
        window.dispatchEvent(new Event(subscriptionsChanged));
        router.refresh();
      }
    } catch {
      setSubscribed(!next);
    }
  }

  function subscribe() {
    if (!session) {
      if (!isPending) setLoginOpen(true);
      return;
    }
    const next = !subscribed;
    if (next) setConfetti((burst) => burst + 1);
    setSubscribed(next);
    void persist(next);
  }

  function finishLogin() {
    setLoginOpen(false);
    setSubscribed(true);
    setConfetti((burst) => burst + 1);
    void persist(true);
  }

  return { subscribed, confetti, loginOpen, setLoginOpen, subscribe, finishLogin };
}
