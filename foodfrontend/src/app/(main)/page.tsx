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
import dynamic from "next/dynamic";

// Above-the-fold: render eagerly for fast LCP + SEO
import RhodeHero from "@/components/organisms/HeroBanner/RhodeHero";
import YakMilkSection from "@/components/organisms/YakMilkSection/YakMilkSection";

// Below-the-fold: code-split. SSR stays on (default) for SEO; JS is fetched only
// when the chunk is needed, cutting initial bundle on the homepage.
// Each dynamic() is inlined so TypeScript can infer each component's prop types.
const SectionSkeleton = () => <div className="w-full h-[60vh] md:h-[80vh]" aria-hidden="true" />;
const loading = () => <SectionSkeleton />;

const PuffTreatsSection      = dynamic(() => import("@/components/organisms/puffTreats/puffTreats"),                                { loading });
const HighlandMixChewSection = dynamic(() => import("@/components/organisms/HighlandMixChewSection/HighlandMixChewSection"),       { loading });
const VarietiesSection       = dynamic(() => import("@/components/organisms/Varitites/VarietiesSection"),                          { loading });
const HimalayanStorySection  = dynamic(() => import("@/components/organisms/HimalayanStorySection/HimalayanStorySection"),         { loading });
const SizeGuideSection       = dynamic(() => import("@/components/organisms/SizeGuideSection/SizeGuideSection"),                   { loading });
const InstagramFeedSection   = dynamic(() => import("@/components/organisms/InstagramFeedSection/InstagramFeedSection"),           { loading });
const TestimonialSection     = dynamic(() => import("@/components/organisms/Testimonial/TestimonialSection"),                      { loading });

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
