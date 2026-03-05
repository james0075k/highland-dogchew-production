// layout.tsx
export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { DM_Sans, Playfair_Display, Cormorant_Garamond, DM_Serif_Display } from "next/font/google";

import "../../app/globals.css";
import Footer from "@/components/organisms/Footer";
import Navbar from "@/components/organisms/NavBar";
import GoToTop from "@/components/organisms/GoToTop/GoToTop";
import WhatsappWidget from "@/components/organisms/WhatsappWidget/WhatsappWidget";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/providers/ThemeProvider";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const dmSerifDisplay = DM_Serif_Display({ variable: "--font-antique-serif", subsets: ["latin"], weight: "400", display: "swap" });

const BASE_URL = 'https://highlanddogchew.co.uk';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Highland Yakchew | Highland Yak Chew – Natural Dog Chews & Treats UK',
    template: '%s | Highland Yakchew',
  },

  description:
    'Shop Highland Yakchew – premium highland yak chew treats for dogs. 100% natural Yak Milk Chews, Himalayan Puff Treats & Highland Mix. Long-lasting, high-protein dog chews made from authentic mountain recipes. Free UK delivery. Grain-free, natural ingredients your dog will love.',

  keywords: [
    'highland yak chew',
    'highland yak chews',
    'highland yakchew',
    'highland dog chew',
    'highland dog chews uk',
    'yak milk dog chew',
    'yak chew for dogs',
    'himalayan dog chew',
    'himalayan yak chew',
    'yak cheese dog chew',
    'natural dog treats UK',
    'Highland Yakchew',
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

  authors: [{ name: 'Highland Yakchew', url: BASE_URL }],
  creator: 'Highland Yakchew',
  publisher: 'Highland Yakchew',

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
    siteName: 'Highland Yakchew',
    title: 'Highland Yakchew | Highland Yak Chew – Natural Dog Chews & Treats UK',
    description:
      'Shop Highland Yakchew – highland yak chew treats for dogs. 100% natural Yak Milk Chews, Himalayan Puff Treats & Highland Mix. Long-lasting, high-protein dog chews. Free UK delivery.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Highland Yakchew – Premium Natural Dog Chews UK',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@HighlandDogchew',
    creator: '@HighlandDogchew',
    title: 'Highland Yakchew | Premium Yak Milk Dog Chews UK',
    description:
      '100% natural Yak Milk Chews, Himalayan Puff Treats & Highland Mix. Long-lasting dog chews made from authentic mountain recipes. Free UK delivery.',
    images: ['/og-image.jpg'],
  },

  icons: {
    icon: [
      { url: '/images/logos.jpeg', type: 'image/jpeg', sizes: '512x512' },
      { url: '/images/logos.jpeg', type: 'image/jpeg', sizes: '192x192' },
      { url: '/images/logos.jpeg', type: 'image/jpeg' },
    ],
    apple: '/images/logos.jpeg',
    shortcut: '/images/logos.jpeg',
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
  name: 'Highland Yakchew',
  url: BASE_URL,
  logo: `${BASE_URL}/images/logos.jpeg`,
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
  name: 'Highland Yakchew',
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
  name: 'Highland Yakchew',
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
          brand: { '@type': 'Brand', name: 'Highland Yakchew' },
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
          brand: { '@type': 'Brand', name: 'Highland Yakchew' },
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
          brand: { '@type': 'Brand', name: 'Highland Yakchew' },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${dmSans.variable} ${playfair.variable} ${cormorant.variable} ${dmSerifDisplay.variable}`}
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
        {/* Preconnect to API */}
        <link rel="preconnect" href="https://highlanddogchew.co.uk" />
        <link rel="dns-prefetch" href="https://highlanddogchew.co.uk" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <GoToTop />
            <WhatsappWidget />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
