import React from 'react';
import Link from 'next/link';
import {
  Home, Info, ShoppingBag, Image, Star, Phone,
  FileText, RotateCcw, Map, ChevronRight, Layers,
  Package, Sparkles, FlaskConical, Users, MessageSquare,
  ShoppingCart, CheckCircle, ExternalLink,
} from 'lucide-react';

interface SiteLink {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

interface SiteSection {
  title: string;
  description: string;
  color: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'orange';
  links: SiteLink[];
}

const SECTIONS: SiteSection[] = [
  {
    title: 'Main Pages',
    description: 'The core pages of our website',
    color: 'amber',
    links: [
      {
        href: '/',
        label: 'Home',
        description: 'Welcome to Highland Yak Chew — natural Himalayan dog chews',
        icon: Home,
      },
      {
        href: '/about',
        label: 'About Us',
        description: 'Our story, mission, and commitment to natural dog treats',
        icon: Info,
      },
      {
        href: '/contact',
        label: 'Contact',
        description: 'Get in touch with our team — we reply within 2 business days',
        icon: Phone,
      },
      {
        href: '/gallery',
        label: 'Gallery',
        description: 'Browse photos of our full range of flavoured dog chews',
        icon: Image,
      },
      {
        href: '/testimonials',
        label: 'Testimonials',
        description: 'Read what our happy customers say about their dogs',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Products',
    description: 'Explore our complete range of natural dog chews',
    color: 'orange',
    links: [
      {
        href: '/products',
        label: 'All Products',
        description: 'Browse our entire collection of Himalayan yak milk dog chews',
        icon: ShoppingBag,
      },
      {
        href: '/products/yak-chews',
        label: 'Yak Chews',
        description: 'Our original, long-lasting Himalayan yak & cow milk chews',
        icon: Package,
        badge: 'Best Seller',
      },
      {
        href: '/products/puff-treats',
        label: 'Puff Treats',
        description: 'Light, airy puffed treats made from leftover chew pieces',
        icon: Sparkles,
      },
      {
        href: '/products/highland-mix',
        label: 'Highland Mix',
        description: 'A curated mixed pack — the perfect sampler for your dog',
        icon: Layers,
      },
      {
        href: '/mixchew',
        label: 'Mix Chew',
        description: 'Flavour-infused chews combining multiple natural ingredients',
        icon: FlaskConical,
      },
      {
        href: '/variety',
        label: 'Variety Flavours',
        description: 'Honey, strawberry, blueberry, coconut, pumpkin & more',
        icon: Sparkles,
      },
    ],
  },
  {
    title: 'Learn More',
    description: 'Discover how our products are made and who we are',
    color: 'blue',
    links: [
      {
        href: '/process',
        label: 'Our Process',
        description: 'How traditional Himalayan methods create our unique chews',
        icon: FlaskConical,
      },
      {
        href: '/future',
        label: 'Our Future',
        description: 'Where Highland Yak Chew is headed — upcoming products & plans',
        icon: Sparkles,
      },
      {
        href: '/testimonial',
        label: 'Reviews',
        description: 'Customer reviews and dog owner stories',
        icon: Star,
      },
    ],
  },
  {
    title: 'Shopping',
    description: 'Your cart, checkout, and order tracking',
    color: 'emerald',
    links: [
      {
        href: '/cart',
        label: 'Shopping Cart',
        description: 'View and manage the items in your cart',
        icon: ShoppingCart,
      },
      {
        href: '/checkout',
        label: 'Checkout',
        description: 'Complete your order securely with Stripe',
        icon: CheckCircle,
      },
    ],
  },
  {
    title: 'Legal & Policies',
    description: 'Our terms, returns policy, and legal information',
    color: 'purple',
    links: [
      {
        href: '/about/terms',
        label: 'Terms & Conditions',
        description: 'The legal terms governing your use of our website and products',
        icon: FileText,
      },
      {
        href: '/refunds',
        label: 'Refund & Returns Policy',
        description: '14-day return window on unopened products — full details inside',
        icon: RotateCcw,
      },
      {
        href: '/site-map',
        label: 'Site Map',
        description: 'You are here — a full overview of all pages on our website',
        icon: Map,
        badge: 'This page',
      },
    ],
  },
];

const colorMap = {
  amber:   { bg: 'bg-amber-50  dark:bg-amber-900/20',  border: 'border-amber-200  dark:border-amber-800',  icon: 'bg-amber-100  dark:bg-amber-900/40  text-amber-600  dark:text-amber-400',  dot: 'bg-amber-400',  badge: 'bg-amber-100  dark:bg-amber-900/40  text-amber-700  dark:text-amber-400  border-amber-200  dark:border-amber-800', label: 'text-amber-600  dark:text-amber-500' },
  orange:  { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400', dot: 'bg-orange-400', badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800', label: 'text-orange-600 dark:text-orange-500' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'text-emerald-600 dark:text-emerald-500' },
  blue:    { bg: 'bg-blue-50   dark:bg-blue-900/20',   border: 'border-blue-200   dark:border-blue-800',   icon: 'bg-blue-100   dark:bg-blue-900/40   text-blue-600   dark:text-blue-400',   dot: 'bg-blue-400',   badge: 'bg-blue-100   dark:bg-blue-900/40   text-blue-700   dark:text-blue-400   border-blue-200   dark:border-blue-800',   label: 'text-blue-600   dark:text-blue-500' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400', dot: 'bg-purple-400', badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800', label: 'text-purple-600 dark:text-purple-500' },
  rose:    { bg: 'bg-rose-50   dark:bg-rose-900/20',   border: 'border-rose-200   dark:border-rose-800',   icon: 'bg-rose-100   dark:bg-rose-900/40   text-rose-600   dark:text-rose-400',   dot: 'bg-rose-400',   badge: 'bg-rose-100   dark:bg-rose-900/40   text-rose-700   dark:text-rose-400   border-rose-200   dark:border-rose-800',   label: 'text-rose-600   dark:text-rose-500' },
};

export default function SiteMapPage() {
  const totalLinks = SECTIONS.reduce((sum, s) => sum + s.links.length, 0);

  return (
    <main className="min-h-screen bg-[#f9f5ef] dark:bg-[#150e09] pt-32">

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f1e14] via-[#3d2512] to-[#1e1108] py-16 md:py-20">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-amber-200/50 mb-6 uppercase tracking-widest">
            <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-200/80">Site Map</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">Navigation</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            Site Map
          </h1>
          <p className="text-amber-100/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            A complete overview of every page on{' '}
            <strong className="text-amber-200">highlanddogchew.co.uk</strong> — find
            exactly what you&apos;re looking for.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-amber-200/50">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              {SECTIONS.length} sections
            </span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              {totalLinks} pages
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 space-y-10">

        {SECTIONS.map((section) => {
          const c = colorMap[section.color];
          return (
            <div key={section.title}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                <div>
                  <h2 className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc] leading-tight">
                    {section.title}
                  </h2>
                  <p className="text-xs text-[#7a5c45] dark:text-[#9a7a68] mt-0.5">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Links grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-start gap-4 p-4 rounded-2xl border ${c.bg} ${c.border} hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
                      <link.icon className="w-4.5 h-4.5" size={18} />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc] group-hover:underline underline-offset-2 leading-tight">
                          {link.label}
                        </span>
                        {link.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#7a5c45] dark:text-[#9a7a68] leading-snug">
                        {link.description}
                      </p>
                      <span className={`inline-block text-[10px] font-mono mt-1.5 ${c.label}`}>
                        {link.href}
                      </span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="flex-shrink-0 w-4 h-4 text-[#c8b6a6] dark:text-[#5a4030] group-hover:translate-x-0.5 transition-transform mt-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* ── Footer note ── */}
        <div className="rounded-2xl bg-gradient-to-br from-[#2f1e14] to-[#1e1108] p-8 text-center text-sm text-amber-100/60 mt-4">
          <Map className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="max-w-xl mx-auto leading-relaxed">
            Can&apos;t find what you&apos;re looking for? Our team is happy to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-5">
            <Link href="/contact"     className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">Contact Us</Link>
            <span className="text-amber-800">·</span>
            <Link href="/products"    className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">Shop Products</Link>
            <span className="text-amber-800">·</span>
            <Link href="/about/terms" className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">Terms & Conditions</Link>
            <span className="text-amber-800">·</span>
            <Link href="/refunds"     className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 text-xs">Refund Policy</Link>
          </div>
        </div>

      </div>
    </main>
  );
}
