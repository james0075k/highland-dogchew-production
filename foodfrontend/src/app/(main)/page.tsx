// page.tsx — server component, statically rendered with ISR
export const revalidate = 300; // re-generate at most every 5 min

import { Metadata } from "next";

const BASE_URL = "https://highlanddogchew.co.uk";

export const metadata: Metadata = {
  title: "Highland Yakchew | Premium Highland Yak Chew Dog Treats UK",
  description:
    "Highland Yakchew – the UK's premium highland yak chew brand. 100% natural yak milk dog chews, Himalayan puff treats & highland mix. Long-lasting, high-protein, grain-free. Made by Himalayan farmers. Free UK delivery.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Highland Yakchew | Premium Highland Yak Chew Dog Treats UK",
    description:
      "100% natural highland yak chew dog treats – long-lasting, high-protein, grain-free. Handcrafted by Himalayan farmers. Free UK delivery.",
    url: BASE_URL,
    images: [
      {
        url: "/images/logos.jpeg",
        width: 512,
        height: 512,
        alt: "Highland Yakchew Logo",
      },
    ],
  },
};
import RhodeHero from "@/components/organisms/HeroBanner/RhodeHero";
import VarietiesSection from "@/components/organisms/Varitites/VarietiesSection";
import HimalayanDelightHero from "@/components/organisms/ThirdSection/HimalayanDelightHero";
import TeamSection from "@/components/organisms/TeamSection/TeamSection";
import DogChewHeroBanner from "@/components/organisms/DogChewHeroBanner/DogChewHeroBanner";
import TestimonialSection from "@/components/organisms/Testimonial/TestimonialSection";
import YakMilkSection from "@/components/organisms/YakMilkSection/YakMilkSection";
import InstagramFeedSection from "@/components/organisms/InstagramFeedSection/InstagramFeedSection";
import PuffTreatsSection from "@/components/organisms/puffTreats/puffTreats";
import HimalayanStorySection from "@/components/organisms/HimalayanStorySection/HimalayanStorySection";
import SizeGuideSection from "@/components/organisms/SizeGuideSection/SizeGuideSection";
import HighlandMixChewSection from "@/components/organisms/HighlandMixChewSection/HighlandMixChewSection";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

async function fetchByType(type: string) {
  try {
    const r = await fetch(`${API_BASE}/products?type=${type}`, {
      next: { revalidate: 300 },
    });
    if (!r.ok) return [];
    const data = await r.json();
    return data?.success ? data.data || [] : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [yak, puff, mix] = await Promise.all([
    fetchByType("yak-milk"),
    fetchByType("puff-treat"),
    fetchByType("highland-mix"),
  ]);

  return (
    <>
      <RhodeHero />
      <YakMilkSection initialProducts={yak} />
      <PuffTreatsSection initialProducts={puff} />
      <HighlandMixChewSection initialProducts={mix} />
      <VarietiesSection />
      <HimalayanStorySection />
      <SizeGuideSection />
      <InstagramFeedSection />
      <TestimonialSection />
    </>
  );
}
