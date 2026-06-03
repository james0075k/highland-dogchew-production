// layout.tsx
import { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

import "../../app/globals.css";
import dynamic from "next/dynamic";
import Footer from "@/components/organisms/Footer";
import Navbar from "@/components/organisms/NavBar";
import { CartProvider } from "@/context/CartContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Below-the-fold floating widgets — code-split so their JS doesn't compete
// with LCP-critical work. (Next 15 forbids ssr:false in server components,
// but it's not needed here: these are already 'use client' with useEffect-gated
// rendering, so SSR yields an empty initial state regardless.)
const GoToTop        = dynamic(() => import("@/components/organisms/GoToTop/GoToTop"));
const WhatsappWidget = dynamic(() => import("@/components/organisms/WhatsappWidget/WhatsappWidget"));
const CookieConsent  = dynamic(() => import("@/components/organisms/CookieConsent/CookieConsent"));

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-antique-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
/*
  Playfair + Cormorant were each loading separate Google Font requests.
  Both are aliased to DM Serif Display so existing var(--font-playfair) /
  var(--font-cormorant) usages keep working without a 2nd/3rd font download.
*/

const BASE_URL = 'https://highlanddogchew.co.uk';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Highland Yak Chew – Natural Dog Chews & Treats UK',
    template: '%s | Highland Yak Chew',
  },

  description:
    'Shop Highland Yak Chew – premium highland yak chew treats for dogs. 100% natural Yak Milk Chews, Himalayan Puff Treats & Highland Mix. Long-lasting, high-protein dog chews made from authentic mountain recipes. Free UK delivery. Grain-free, natural ingredients your dog will love.',

  keywords: [
    'highland yak chew',
    'highland yak chews',
    'Highland Yak Chew',
    'highland dog chew',
    'highland dog chews uk',
    'yak milk dog chew',
    'yak chew for dogs',
    'himalayan dog chew',
    'himalayan yak chew',
    'yak cheese dog chew',
    'natural dog treats UK',
    'Highland Yak Chew',
    'long lasting dog chews',
    'natural dog chews uk',
    'himalayan chew uk',
    'puff treats for dogs',
    'protein dog treats',
    'dog chews uk',
    'premium dog chews',
    'all natural dog treats',
    'grain free dog treats',
    'cheese puffs for dogs',
    'dog dental chews',
    'highland mix dog chews',
    'buy dog chews uk',
    'best dog chews 2025',
    'natural himalayan chew',
    'yak chew uk',
    'yak milk chew uk',
  ],

  authors: [{ name: 'Highland Yak Chew', url: BASE_URL }],
  creator: 'Highland Yak Chew',
  publisher: 'Highland Yak Chew',

  category: 'pet supplies',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
    languages: { 'en-GB': BASE_URL },
  },

  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: BASE_URL,
    siteName: 'Highland Yak Chew',
    title: 'Highland Yak Chew – Natural Dog Chews & Treats UK',
    description:
      'Shop Highland Yak Chew – highland yak chew treats for dogs. 100% natural Yak Milk Chews, Himalayan Puff Treats & Highland Mix. Long-lasting, high-protein dog chews. Free UK delivery.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Highland Yak Chew – Premium Natural Dog Chews UK',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@HighlandDogchew',
    creator: '@HighlandDogchew',
    title: 'Highland Yak Chew | Premium Yak Milk Dog Chews UK',
    description:
      '100% natural Yak Milk Chews, Himalayan Puff Treats & Highland Mix. Long-lasting dog chews made from authentic mountain recipes. Free UK delivery.',
    images: ['/og-image.jpg'],
  },

  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/images/logos.png', type: 'image/png', sizes: '192x192' },
      { url: '/images/logos.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: { url: '/images/logos.png', type: 'image/png', sizes: '180x180' },
    shortcut: '/favicon.png',
  },

  manifest: '/site.webmanifest',

  verification: {
    google: 'MEnr-Q9qVuzELch8yumHVjnnl4uOcdjbgbS_M5-nVyE',
  },

  other: {
    'geo.region': 'GB',
    'geo.placename': 'United Kingdom',
    'rating': 'general',
  },
};

// ── JSON-LD Structured Data ────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Highland Yak Chew',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/images/logos.png`,
    width: 512,
    height: 512,
  },
  image: `${BASE_URL}/og-image.jpg`,
  description: 'Premium natural yak milk dog chews and Himalayan dog treats, handcrafted for healthy, happy dogs.',
  sameAs: [
    'https://www.instagram.com/highlanddogchew',
    'https://www.tiktok.com/@highlanddogchew',
    'https://www.facebook.com/highlanddogchew',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'hello@highlanddogchew.co.uk',
    availableLanguage: 'English',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'GB',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Highland Yak Chew',
  url: BASE_URL,
  description: 'Premium natural yak milk dog chews and Himalayan dog treats for dogs.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/products?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'Highland Yak Chew',
  url: BASE_URL,
  image: `${BASE_URL}/og-image.jpg`,
  description: 'Premium natural yak milk dog chews, Himalayan puff treats and highland mix dog chews.',
  priceRange: '££',
  currenciesAccepted: 'GBP',
  paymentAccepted: 'Credit Card, Debit Card, Apple Pay, Google Pay, PayPal',
  areaServed: { '@type': 'Country', name: 'United Kingdom' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Dog Chews & Treats',
    itemListElement: [
      {
        '@type': 'Offer',
        url: `${BASE_URL}/products/yak-chews`,
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'Product',
          name: 'Yak Milk Chews',
          description: '100% natural yak milk chews for dogs — long-lasting, high-protein, grain-free.',
          url: `${BASE_URL}/products/yak-chews`,
          image: `${BASE_URL}/images/logos.jpeg`,
          brand: { '@type': 'Brand', name: 'Highland Yak Chew' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '120', bestRating: '5' },
          offers: { '@type': 'Offer', priceCurrency: 'GBP', availability: 'https://schema.org/InStock', url: `${BASE_URL}/products/yak-chews` },
        },
      },
      {
        '@type': 'Offer',
        url: `${BASE_URL}/products/puff-treats`,
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'Product',
          name: 'Himalayan Puff Treats',
          description: 'Light and crunchy puffed yak milk treats — microwave the end piece for a puffy snack your dog will love.',
          url: `${BASE_URL}/products/puff-treats`,
          image: `${BASE_URL}/images/logos.jpeg`,
          brand: { '@type': 'Brand', name: 'Highland Yak Chew' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '85', bestRating: '5' },
          offers: { '@type': 'Offer', priceCurrency: 'GBP', availability: 'https://schema.org/InStock', url: `${BASE_URL}/products/puff-treats` },
        },
      },
      {
        '@type': 'Offer',
        url: `${BASE_URL}/products/highland-mix`,
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'Product',
          name: 'Highland Mix Chews',
          description: 'A premium variety mix of natural highland yak chews in multiple flavours.',
          url: `${BASE_URL}/products/highland-mix`,
          image: `${BASE_URL}/images/logos.jpeg`,
          brand: { '@type': 'Brand', name: 'Highland Yak Chew' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '64', bestRating: '5' },
          offers: { '@type': 'Offer', priceCurrency: 'GBP', availability: 'https://schema.org/InStock', url: `${BASE_URL}/products/highland-mix` },
        },
      },
    ],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Products', item: `${BASE_URL}/products` },
  ],
};

const siteNavigationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Highland Yak Chew Navigation',
  itemListElement: [
    {
      '@type': 'SiteNavigationElement',
      position: 1,
      name: 'Yak Milk Chews',
      description: '100% natural yak milk dog chews – long-lasting, high-protein, grain-free.',
      url: `${BASE_URL}/products/yak-chews`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 2,
      name: 'Himalayan Puff Treats',
      description: 'Light and crunchy puffed yak milk treats your dog will love.',
      url: `${BASE_URL}/products/puff-treats`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 3,
      name: 'Highland Mix Chews',
      description: 'Premium variety mix of natural highland yak chews in multiple flavours.',
      url: `${BASE_URL}/products/highland-mix`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 4,
      name: 'Our Story',
      description: 'Learn about Highland Yak Chew and how we bring Himalayan recipes to your dog.',
      url: `${BASE_URL}/about`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 5,
      name: 'Blog',
      description: 'Expert articles on dog nutrition, yak chew guides, and healthy treat tips.',
      url: `${BASE_URL}/blog`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 6,
      name: 'Contact Us',
      description: 'Get in touch with the Highland Yak Chew team.',
      url: `${BASE_URL}/contact`,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${dmSans.variable} ${dmSerifDisplay.variable}`}
      style={{
        // Alias removed fonts to the same serif so existing usages keep working
        ['--font-playfair' as string]: 'var(--font-antique-serif)',
        ['--font-cormorant' as string]: 'var(--font-antique-serif)',
      }}
    >
      <head>
        {/* Structured Data / JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
        {/* Preconnect to API */}
        <link rel="preconnect" href="https://highlanddogchew.co.uk" />
        <link rel="dns-prefetch" href="https://highlanddogchew.co.uk" />

        {/* The first hero image carries `priority` + `fetchPriority="high"` on its
            <Image> tag — Next/image emits its own responsive preload <link> with
            imagesrcset/imagesizes so the browser pulls the correctly-sized variant
            (AVIF on modern browsers). A manual preload here would race that and
            cause a double download. */}
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <CartProvider>
            <SubscriptionProvider>
              <Navbar />
              {children}
              <Footer />
              <GoToTop />
              <WhatsappWidget />
              <CookieConsent />
            </SubscriptionProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
