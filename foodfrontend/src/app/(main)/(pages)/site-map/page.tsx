"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Home, Info, ShoppingBag, Image, Star, Phone,
  FileText, RotateCcw, Map, ChevronRight, Layers,
  Package, Sparkles, FlaskConical, MessageSquare,
  ShoppingCart, CheckCircle, ExternalLink,
} from 'lucide-react';

/* ═══ Data ════════════════════════════════════════════════════════════════ */

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
  links: SiteLink[];
}

const SECTIONS: SiteSection[] = [
  {
    title: 'Main Pages',
    description: 'The core pages of our website',
    links: [
      { href: '/',             label: 'Home',         description: 'Welcome to Highland Yak Chew — natural Himalayan dog chews', icon: Home },
      { href: '/about',        label: 'About Us',     description: 'Our story, mission, and commitment to natural dog treats',    icon: Info },
      { href: '/contact',      label: 'Contact',      description: 'Get in touch — we reply within 2 business days',              icon: Phone },
      { href: '/gallery',      label: 'Gallery',      description: 'Browse photos of our full range of flavoured dog chews',      icon: Image },
      { href: '/testimonials', label: 'Testimonials', description: 'Read what happy customers say about their dogs',              icon: MessageSquare },
    ],
  },
  {
    title: 'Products',
    description: 'Explore our complete range of natural dog chews',
    links: [
      { href: '/products',           label: 'All Products',     description: 'Browse our entire collection of Himalayan yak milk dog chews', icon: ShoppingBag },
      { href: '/products/yak-chews', label: 'Yak Chews',        description: 'Our original, long-lasting Himalayan yak & cow milk chews',   icon: Package, badge: 'Best Seller' },
      { href: '/products/puff-treats',label: 'Puff Treats',     description: 'Light, airy puffed treats made from leftover chew pieces',    icon: Sparkles },
      { href: '/products/highland-mix',label:'Highland Mix',    description: 'A curated mixed pack — the perfect sampler for your dog',     icon: Layers },
      { href: '/mixchew',            label: 'Mix Chew',         description: 'Flavour-infused chews combining multiple natural ingredients', icon: FlaskConical },
      { href: '/variety',            label: 'Variety Flavours', description: 'Honey, strawberry, blueberry, coconut, pumpkin & more',       icon: Sparkles },
    ],
  },
  {
    title: 'Learn More',
    description: 'Discover how our products are made and who we are',
    links: [
      { href: '/process',    label: 'Our Process', description: 'How traditional Himalayan methods create our unique chews',         icon: FlaskConical },
      { href: '/future',     label: 'Our Future',  description: 'Where Highland Yak Chew is headed — upcoming products & plans',    icon: Sparkles },
      { href: '/testimonial',label: 'Reviews',     description: 'Customer reviews and dog owner stories',                           icon: Star },
    ],
  },
  {
    title: 'Shopping',
    description: 'Your cart, checkout, and order tracking',
    links: [
      { href: '/cart',     label: 'Shopping Cart', description: 'View and manage the items in your cart',          icon: ShoppingCart },
      { href: '/checkout', label: 'Checkout',      description: 'Complete your order securely with Stripe',        icon: CheckCircle },
    ],
  },
  {
    title: 'Legal & Policies',
    description: 'Our terms, returns policy, and legal information',
    links: [
      { href: '/about/terms', label: 'Terms & Conditions',   description: 'Legal terms governing your use of our website and products', icon: FileText },
      { href: '/refunds',     label: 'Refund & Returns',     description: '14-day return window on unopened products',                  icon: RotateCcw },
      { href: '/site-map',    label: 'Site Map',             description: 'You are here — a full overview of every page on the site',   icon: Map, badge: 'This page' },
    ],
  },
];

/* ═══ Hooks ═══════════════════════════════════════════════════════════════ */

function useReveal(threshold = 0.07) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ═══ Decorative SVGs ═════════════════════════════════════════════════════ */

function PawPrint({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <ellipse cx="50" cy="70" rx="22" ry="18" />
      <ellipse cx="22" cy="50" rx="10" ry="13" />
      <ellipse cx="78" cy="50" rx="10" ry="13" />
      <ellipse cx="33" cy="28" rx="9"  ry="11" />
      <ellipse cx="67" cy="28" rx="9"  ry="11" />
    </svg>
  );
}

function MountainLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 160" className={className} fill="none" preserveAspectRatio="none" aria-hidden>
      <polyline
        points="0,160 160,60 280,110 420,20 560,80 680,35 820,90 940,45 1080,75 1200,50 1200,160"
        stroke="currentColor" strokeWidth="1.5"
      />
      <polyline
        points="0,160 120,100 240,130 380,55 500,105 640,65 760,105 900,70 1040,95 1200,75 1200,160"
        stroke="currentColor" strokeWidth="1" opacity="0.35"
      />
    </svg>
  );
}

/* ═══ Link Card ═══════════════════════════════════════════════════════════ */

function LinkCard({ link, delay = 0 }: { link: SiteLink; delay?: number }) {
  const { ref, visible } = useReveal();
  const [hov, setHov] = useState(false);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      <Link
        href={link.href}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="group relative flex items-start gap-4 p-5 rounded-2xl border overflow-hidden h-full"
        style={{
          background:   'var(--surface-card)',
          borderColor:  hov ? 'rgba(184,151,106,0.45)' : 'var(--border-base)',
          boxShadow:    hov ? '0 8px 30px rgba(184,151,106,0.1)' : '0 1px 4px rgba(46,31,20,0.04)',
          transform:    hov ? 'translateY(-2px)' : 'translateY(0)',
          transition:   'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
            opacity: hov ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Icon */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-250"
          style={{
            background:  hov ? 'rgba(184,151,106,0.18)' : 'rgba(184,151,106,0.07)',
            borderColor: hov ? 'rgba(184,151,106,0.4)'  : 'rgba(184,151,106,0.18)',
          }}
        >
          <link.icon className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-sm font-bold leading-tight"
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                color: hov ? 'var(--color-gold-hover)' : 'var(--text-primary)',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </span>
            {link.badge && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest"
                style={{
                  background:  'rgba(184,151,106,0.1)',
                  borderColor: 'rgba(184,151,106,0.3)',
                  color:       'var(--color-gold)',
                }}
              >
                {link.badge}
              </span>
            )}
          </div>
          <p className="text-[12px] leading-snug mb-2" style={{ color: 'var(--text-muted)' }}>
            {link.description}
          </p>
          <span
            className="inline-block text-[10px] font-mono px-2 py-0.5 rounded border"
            style={{
              color:       'var(--color-gold)',
              background:  'rgba(184,151,106,0.06)',
              borderColor: 'rgba(184,151,106,0.15)',
            }}
          >
            {link.href}
          </span>
        </div>

        {/* Arrow */}
        <ChevronRight
          className="flex-shrink-0 w-4 h-4 mt-0.5 transition-all duration-250"
          style={{
            color:     hov ? 'var(--color-gold)' : 'var(--text-muted)',
            transform: hov ? 'translateX(3px)' : 'translateX(0)',
          }}
        />
      </Link>
    </div>
  );
}

/* ═══ Section Group ═══════════════════════════════════════════════════════ */

function SectionGroup({ section, index }: { section: SiteSection; index: number }) {
  const { ref, visible } = useReveal(0.05);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="relative"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* Subtle paw watermark per section */}
      <div
        className="absolute -top-4 -right-4 pointer-events-none select-none hidden lg:block"
        style={{ opacity: 0.025 }}
      >
        <PawPrint className="w-28 h-28 text-[#B8976A]" />
      </div>

      {/* Section header */}
      <div className="relative flex items-start gap-4 mb-6">
        {/* Big number watermark */}
        <span
          className="hidden md:block absolute -left-1 -top-3 font-black leading-none pointer-events-none select-none"
          style={{
            fontSize: '80px',
            color: 'var(--color-gold)',
            opacity: 0.055,
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1.5">
            <span
              className="text-[10px] font-bold tracking-[0.22em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              {String(index + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
            </span>
            <div
              className="h-px w-8"
              style={{ background: 'var(--color-gold)', opacity: 0.4 }}
            />
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold leading-tight"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              color: 'var(--text-primary)',
            }}
          >
            {section.title}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {section.description}
          </p>
        </div>

        {/* Page count chip */}
        <div className="ml-auto flex-shrink-0">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border"
            style={{
              background:  'rgba(184,151,106,0.07)',
              borderColor: 'rgba(184,151,106,0.22)',
              color:       'var(--color-gold)',
            }}
          >
            <ExternalLink className="w-3 h-3" />
            {section.links.length} {section.links.length === 1 ? 'page' : 'pages'}
          </span>
        </div>
      </div>

      {/* Decorative rule */}
      <div
        className="h-px mb-7"
        style={{
          background: 'linear-gradient(90deg, var(--color-gold), transparent)',
          opacity: 0.3,
        }}
      />

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {section.links.map((link, i) => (
          <LinkCard key={link.href} link={link} delay={i * 55} />
        ))}
      </div>
    </div>
  );
}

/* ═══ Closing Banner ══════════════════════════════════════════════════════ */

function ClosingBanner() {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center"
      style={{
        background: 'linear-gradient(135deg, #2f1e14 0%, #1a0f08 100%)',
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* Glows */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,151,106,0.12), transparent 70%)' }} />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,151,106,0.07), transparent 70%)' }} />
      {/* Top rule */}
      <div className="absolute top-0 inset-x-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,151,106,0.45), transparent)' }} />
      {/* Paw */}
      <PawPrint className="w-10 h-10 text-amber-400 mx-auto mb-5 opacity-75" />
      <h3
        className="text-xl md:text-2xl font-bold text-white mb-3"
        style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
      >
        Can&apos;t find what you&apos;re looking for?
      </h3>
      <p className="max-w-md mx-auto text-sm md:text-base leading-relaxed mb-7"
        style={{ color: 'rgba(244,237,228,0.5)' }}>
        Our team is happy to help. Reach out and we&apos;ll point you in the right direction.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { href: '/contact',      label: 'Contact Us' },
          { href: '/products',     label: 'Shop Products' },
          { href: '/about/terms',  label: 'Terms & Conditions' },
          { href: '/refunds',      label: 'Refund Policy' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-xs px-5 py-2 rounded-full border transition-all duration-200 hover:bg-[rgba(184,151,106,0.15)] hover:border-[rgba(184,151,106,0.5)]"
            style={{ color: 'var(--color-gold-light)', borderColor: 'rgba(184,151,106,0.3)' }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══ Page ════════════════════════════════════════════════════════════════ */

export default function SiteMapPage() {
  const totalLinks = SECTIONS.reduce((s, sec) => s + sec.links.length, 0);

  // floating paw data
  const PAWS: Array<{ top: string; side: 'left' | 'right'; pos: string; w: number; opacity: number; rotate: number }> = [
    { top: '12%',  side: 'left',  pos: '1.5%',  w: 72,  opacity: 0.028, rotate: 15  },
    { top: '28%',  side: 'right', pos: '2%',    w: 96,  opacity: 0.022, rotate: -22 },
    { top: '44%',  side: 'left',  pos: '4%',    w: 52,  opacity: 0.032, rotate: 35  },
    { top: '60%',  side: 'right', pos: '3.5%',  w: 80,  opacity: 0.02,  rotate: -12 },
    { top: '74%',  side: 'left',  pos: '2%',    w: 60,  opacity: 0.03,  rotate: 50  },
    { top: '88%',  side: 'right', pos: '5%',    w: 44,  opacity: 0.025, rotate: -40 },
  ];

  return (
    <main className="relative min-h-screen pt-32" style={{ background: 'var(--surface-page)' }}>

      {/* ── Floating background paws ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
        {PAWS.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top:       p.top,
              left:      p.side === 'left'  ? p.pos : undefined,
              right:     p.side === 'right' ? p.pos : undefined,
              opacity:   p.opacity,
              transform: `rotate(${p.rotate}deg)`,
            }}
          >
            <PawPrint
              className="text-[#B8976A]"
              style={{ width: p.w, height: p.w } as React.CSSProperties}
            />
          </div>
        ))}
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 overflow-hidden py-20 md:py-28"
        style={{ background: 'linear-gradient(135deg, #2E1F14 0%, #3d2a18 45%, #1a0f08 100%)' }}
      >
        {/* Noise */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
        {/* Radial glows */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(184,151,106,0.13) 0%, transparent 65%)' }} />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(184,151,106,0.08) 0%, transparent 65%)' }} />

        {/* Mountain silhouette */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-[0.055]">
          <MountainLine className="w-full h-24 md:h-32 text-[#B8976A]" />
        </div>

        {/* Hero paw decorations */}
        <div className="absolute top-6 right-[8%] pointer-events-none" style={{ opacity: 0.055 }}>
          <PawPrint className="w-28 h-28 text-[#D4BC8E]" />
        </div>
        <div className="absolute bottom-8 left-[5%] pointer-events-none" style={{ opacity: 0.04 }}>
          <PawPrint className="w-16 h-16 text-[#D4BC8E]" />
        </div>

        {/* Top rule */}
        <div className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(184,151,106,0.45), transparent)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 mb-8">
            <Link href="/" className="text-[11px] tracking-[0.18em] uppercase hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(212,188,142,0.5)' }}>
              Home
            </Link>
            <ChevronRight className="w-3 h-3" style={{ color: 'rgba(212,188,142,0.3)' }} />
            <span className="text-[11px] tracking-[0.18em] uppercase"
              style={{ color: 'rgba(212,188,142,0.75)' }}>
              Site Map
            </span>
          </nav>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 border"
            style={{ background: 'rgba(184,151,106,0.1)', borderColor: 'rgba(184,151,106,0.28)' }}
          >
            <Map className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-gold-light)' }}>
              Navigation
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-black text-white leading-[1.05] mb-5"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              fontSize: 'clamp(2.6rem, 7vw, 5rem)',
            }}
          >
            Site{' '}
            <em
              className="not-italic"
              style={{
                background: 'linear-gradient(135deg, #e8d4a8 0%, #B8976A 60%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Map
            </em>
          </h1>

          {/* Paw divider */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-16"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(184,151,106,0.5))' }} />
            <PawPrint className="w-4 h-4 text-[#B8976A] opacity-60" />
            <div className="h-px w-16"
              style={{ background: 'linear-gradient(270deg, transparent, rgba(184,151,106,0.5))' }} />
          </div>

          {/* Subtitle */}
          <p
            className="max-w-2xl mx-auto leading-relaxed mb-8"
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
              color: 'rgba(244,237,228,0.6)',
            }}
          >
            A complete overview of every page on{' '}
            <strong style={{ color: 'var(--color-gold-light)' }}>highlanddogchew.co.uk</strong>{' '}
            — find exactly what you&apos;re looking for.
          </p>

          {/* Stats chips */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { Icon: Layers,      label: `${SECTIONS.length} sections` },
              { Icon: ExternalLink,label: `${totalLinks} pages` },
              { Icon: Map,         label: 'All routes indexed' },
            ].map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-[11px] rounded-full px-4 py-2 border"
                style={{
                  background:  'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(184,151,106,0.2)',
                  color:       'rgba(212,188,142,0.55)',
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">

        {/* Quick-jump bar */}
        <div
          className="flex flex-wrap gap-2 mb-14 md:mb-20 p-4 rounded-2xl border"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-base)' }}
        >
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase self-center mr-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Jump to:
          </span>
          {SECTIONS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all duration-200 hover:border-[rgba(184,151,106,0.45)] hover:bg-[rgba(184,151,106,0.1)]"
              style={{
                background:  'transparent',
                borderColor: 'var(--border-base)',
                color:       'var(--text-secondary)',
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-16 md:space-y-24">
          {SECTIONS.map((section, i) => (
            <div key={section.title} id={`section-${i}`}>
              <SectionGroup section={section} index={i} />
            </div>
          ))}
        </div>

        {/* Closing banner */}
        <div className="mt-16 md:mt-24">
          <ClosingBanner />
        </div>
      </div>
    </main>
  );
}
