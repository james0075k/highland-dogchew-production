// page.tsx - Fixed version without fetchAPI
export const dynamic = "force-dynamic";
import Image from "next/image";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import ImageDisplay from "@/components/atoms/ImageCard";
import Button from "@/components/atoms/button";
import TextHeader from "@/components/atoms/headings";
import TextDescription from "@/components/atoms/description";
import Link from "next/link";
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

const stats = [
  {
    iconSrc: "/images/stat1.png",
    title: "18+",
    subtitle: "Years of Experience",
    description: "Seasoned in travel excellence since day one.",
  },
  {
    iconSrc: "/images/stat2.png",
    title: "2750+",
    subtitle: "TripAdvisor Reviews",
    description: "Loved and trusted by thousands of travelers.",
  },
  {
    iconSrc: "/images/stat3.png",
    title: "116+",
    subtitle: "Cultural Tours",
    description: "Experience the heart of tradition and heritage with us.",
  },
  {
    iconSrc: "/images/stat4.png",
    title: "106+",
    subtitle: "Adventure Activities",
    description: "Thrills, treks, and unforgettable adrenaline rushes.",
  },
];

const journeyCards = [
  { src: "/images/Journey.png", title: "@jane87", variant: "smallsquare" },
  { src: "/images/Journey.png", title: "@jane87", variant: "smallsquare" },
  { src: "/images/Journey.png", title: "@jane87", variant: "smallsquare" },
  { src: "/images/Journey.png", title: "@jane87", variant: "smallsquare" },
];

const socialLinks = [
  {
    icon: <FaInstagram className="text-white backdrop-blur-[12.6px] border border-white/16 bg-white/15 p-2 rounded-xl w-9.5 h-9.5" />,
    link: "#",
    label: "Instagram",
  },
  {
    icon: <FaFacebookF className="text-white backdrop-blur-[12.6px] border border-white/16 bg-white/15 p-2 rounded-xl w-9.5 h-9.5" />,
    link: "#",
    label: "Facebook",
  },
  {
    icon: <FaYoutube className="text-white backdrop-blur-[12.6px] border border-white/16 bg-white/15 p-2 rounded-xl w-9.5 h-9.5" />,
    link: "#",
    label: "YouTube",
  },
];

// Mock data to replace API calls
const mockData = {
  partners: [],
  blogs: [
    {
      slug: "everest-adventure",
      imageUrl: "/images/blog1.jpg",
      title: "Everest Base Camp Trek",
      subtitle: "Journey to the Top of the World",
      description: "An unforgettable adventure through the Himalayas...",
      createdAt: new Date().toISOString(),
    },
    {
      slug: "pokhara-guide",
      imageUrl: "/images/blog2.jpg",
      title: "Pokhara Travel Guide",
      subtitle: "Exploring the Lake City",
      description: "Discover the beauty of Pokhara...",
      createdAt: new Date().toISOString(),
    },
    {
      slug: "nepal-culture",
      imageUrl: "/images/blog3.jpg",
      title: "Nepal Culture",
      subtitle: "Rich Heritage and Traditions",
      description: "Experience the cultural richness of Nepal...",
      createdAt: new Date().toISOString(),
    },
  ],
  faqs: [],
  destinations: [
    {
      slug: "kathmandu",
      title: "Kathmandu",
      subtitle: "The heart of Nepal",
      imageUrls: ["/images/kathmandu.jpg"],
      totalTrips: 25,
    },
    {
      slug: "pokhara",
      title: "Pokhara",
      subtitle: "Gateway to Annapurna",
      imageUrls: ["/images/pokhara.jpg"],
      totalTrips: 18,
    },
    {
      slug: "chitwan",
      title: "Chitwan",
      subtitle: "Wildlife paradise",
      imageUrls: ["/images/chitwan.jpg"],
      totalTrips: 12,
    },
    {
      slug: "lumbini",
      title: "Lumbini",
      subtitle: "Birthplace of Buddha",
      imageUrls: ["/images/lumbini.jpg"],
      totalTrips: 8,
    },
    {
      slug: "mustang",
      title: "Mustang",
      subtitle: "Hidden kingdom",
      imageUrls: ["/images/mustang.jpg"],
      totalTrips: 15,
    },
  ],
  packages: [
    {
      _id: "1",
      title: "Everest Base Camp",
      overview: "14-day trek to Everest Base Camp",
      description: "Experience the Himalayas",
      duration: { days: 14 },
      basePrice: 1200,
      gallery: ["/images/ebc.jpg"],
      type: "tour",
      category: "trekking",
    },
    {
      _id: "2",
      title: "Annapurna Circuit",
      overview: "18-day complete circuit trek",
      description: "Circle the Annapurna massif",
      duration: { days: 18 },
      basePrice: 1400,
      gallery: ["/images/annapurna.jpg"],
      type: "tour",
      category: "trekking",
    },
    {
      _id: "3",
      title: "Langtang Valley",
      overview: "7-day scenic valley trek",
      description: "Beautiful Langtang region",
      duration: { days: 7 },
      basePrice: 800,
      gallery: ["/images/langtang.jpg"],
      type: "tour",
      category: "trekking",
    },
    {
      _id: "4",
      title: "Pokhara Ultralight Flight",
      overview: "30-90 minute aerial adventure",
      description: "Feel the freedom in the sky",
      duration: { days: 1 },
      basePrice: 150,
      gallery: ["/images/pokharaflight.png"],
      type: "tour",
      category: "adventure",
    },
  ],                                                   
  activities: [
    {
      _id: "1",
      title: "Trekking",
      subtitle: "Mountain adventures",
      description: "Explore the Himalayas",
      image: "/images/trekking.jpg",
      slug: "trekking",
    },
    {
      _id: "2",
      title: "Rafting",
      subtitle: "River adventures",
      description: "Experience thrilling rapids",
      image: "/images/rafting.jpg",
      slug: "rafting",
    },
  ],
  testimonials: [],
  herobanner: {
    title: "Welcome to Fusion Expeditions",
    subtitle: "Your adventure starts here",
    image: "/images/hero.jpg",
  },
};

export default async function Home() {
  // Use mock data instead of API calls
  const destinations = mockData.destinations;
  const blogs = mockData.blogs;
  const activities = mockData.activities;
  const testimonialData = mockData.testimonials;
  const herosectiondata = { data: mockData.herobanner };

  // Filter packages
  const filteredPackages = mockData.packages.filter((card: any) => {
    const isActivity = card.type === "activity" || card.category === "activity";
    const isDestination = card.type === "destination" || card.category === "destination";
    return !isActivity && !isDestination;
  });

  return (
    <>
    <RhodeHero/>
      <section className="">
       
  <YakMilkSection/>
    
      </section>

      <PuffTreatsSection/>

    <HighlandMixChewSection/>
        <VarietiesSection/>

    <HimalayanStorySection/>

    <SizeGuideSection/>

       
     {/* <HimalayanDelightHero/> */}
      

{/* <TeamSection/> */}  
    
     {/* <DogChewHeroBanner/> */}

     <InstagramFeedSection/>

     <TestimonialSection/>
    



  
   

    

   
    </>
  );
}
