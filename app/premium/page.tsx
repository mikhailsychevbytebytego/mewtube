import type { Metadata } from "next";
import { PremiumScreen } from "@/components/premium-screen";

export const metadata: Metadata = {
  title: "CatTube Premium",
  description: "More cats. Zero ads. (Maybe.) Choose a CatTube Premium plan.",
};

export default function PremiumPage() {
  return <PremiumScreen />;
}
