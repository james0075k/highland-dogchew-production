'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, X, ChevronLeft, ChevronRight, ImageOff,
  ZoomIn, Camera, Sparkles, PawPrint, Leaf,
} from 'lucide-react';

interface GalleryItem {
  _id?: string;
  id?: number;
  image: string;
  title: string;
  category: string;
  description: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

// Static dog spotlight items — always shown regardless of API state
const STATIC_ITEMS: GalleryItem[] = [
  {
    id: 9001,
    image: '/images/dog-34.webp',
    title: 'Happy Chewer — Blissful Moments',
    category: 'GALLERY',
    description: 'Pure joy captured — one of our Highland Yak Chew fans in a moment of total contentment.',
  },
  {
    id: 9002,
    image: '/images/dog-35.webp',
    title: 'Highland Spirit — Natural & Free',
    category: 'GALLERY',
    description: 'A spirited dog living their best life, fuelled by the natural goodness of Highland Yak Chews.',
  },
];

const ALL_CATEGORIES = [
  'ALL', 'GALLERY', 'HONEY', 'PUMPKIN', 'STRAWBERRY',
  'BLUEBERRY', 'COCONUT', 'PEANUT', 'MINT', 'TURMERIC', 'FLAXSEED',
];

// ─── Fallback shown when an image fails to load ───────────────────────────────
function ImageFallback({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-900/20">
      <ImageOff className="w-9 h-9 text-amber-300 dark:text-amber-700 mb-2" />
      <p className="text-xs text-amber-400 dark:text-amber-600 text-center px-4 leading-snug">{title}</p>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-amber-100 dark:border-[#3a2c23] bg-white dark:bg-[#241b16] overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-amber-100/60 dark:bg-amber-900/20" />
      <div className="aspect-[4/3] bg-amber-100 dark:bg-[#2d221c]" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 w-3/4 bg-amber-100 dark:bg-[#2d221c] rounded-full" />
        <div className="h-2.5 w-1/2 bg-amber-50 dark:bg-[#241a12] rounded-full" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const GalleryPage: React.FC = () => {
  const [activeFilter, setActiveFilter]   = useState<string>('ALL');
  const [searchTerm, setSearchTerm]       = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imgErrors, setImgErrors]         = useState<Set<string>>(new Set());
  const [loaded, setLoaded]               = useState(false);
  const [items, setItems]                 = useState<GalleryItem[]>([]);
  const [fetching, setFetching]           = useState(true);

  // Fetch gallery from API and merge with static items
  useEffect(() => {
    fetch(`${API_BASE}/gallery`)
      .then((r) => r.json())
      .then((data) => {
        const apiItems = Array.isArray(data.data) ? data.data : [];
        setItems([...STATIC_ITEMS, ...apiItems]);
      })
      .catch(() => {
        setItems(STATIC_ITEMS);
      })
      .finally(() => {
        setFetching(false);
        setTimeout(() => setLoaded(true), 50);
      });
  }, []);

  const itemKey = (item: GalleryItem) => item._id || String(item.id || item.image);

  const handleImgError = (key: string) =>
    setImgErrors((prev) => new Set([...prev, key]));

  // Only show categories that have items (+ ALL)
  const presentCats = ['ALL', ...Array.from(new Set(items.map((i) => i.category))).sort()];
  const CATEGORIES = ALL_CATEGORIES.filter((c) => presentCats.includes(c));

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesFilter = activeFilter === 'ALL' || item.category === activeFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  }), [items, activeFilter, searchTerm]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const len = filteredItems.length;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setLightboxIndex((i) => (i !== null ? (i - 1 + len) % len : null));
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i !== null ? (i + 1) % len : null));
      if (e.key === 'Escape')     setLightboxIndex(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, filteredItems.length]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [lightboxIndex]);

  const lightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;
  const flavourCount = Math.max(CATEGORIES.length - 1, 0);

  return (
    <>
      <style>{`
        @keyframes galleryFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lightboxIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <main className="relative min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] transition-colors duration-300 overflow-hidden">

        {/* ── Ambient amber glows (decorative) ───────────────────────── */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 -right-40 w-[560px] h-[560px] rounded-full bg-amber-200/40 dark:bg-amber-900/20 blur-3xl" />
          <div className="absolute top-1/3 -left-40 w-[440px] h-[440px] rounded-full bg-orange-200/30 dark:bg-orange-900/15 blur-3xl" />
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        {/* pt-40 = 160px clears the fixed navbar (~144px) */}
        <section className="relative pt-40 pb-12 md:pb-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center" style={{ animation: 'galleryFadeUp 0.5s ease both' }}>
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-[11px] text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60 mb-6 uppercase tracking-[0.2em] font-semibold">
              <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 opacity-60" />
              <span className="text-amber-600 dark:text-amber-400">Gallery</span>
            </nav>

            {/* Eyebrow chip */}
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold tracking-[0.25em] uppercase px-3.5 py-1.5 rounded-full mb-6">
              <Camera className="w-3 h-3" />
              Highland Yak Chew
            </div>

            <h1 className="font-antique text-5xl sm:text-6xl md:text-7xl text-[#2f1e14] dark:text-[#f5e9dc] leading-[1.02] tracking-tight mb-5">
              Our <span className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 dark:from-amber-300 dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent">Gallery</span>
            </h1>

            <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Discover our range of natural Himalayan dog chews — crafted from pure yak milk
              with premium, dog-friendly flavours your pet will love.
            </p>

            {/* Stat strip */}
            <div className="mt-9 flex flex-wrap items-stretch justify-center gap-3 sm:gap-4">
              <Stat icon={<Camera className="w-3.5 h-3.5" />} value={items.length} label={items.length === 1 ? 'photo' : 'photos'} />
              <Stat icon={<Leaf className="w-3.5 h-3.5" />}   value={flavourCount}    label={flavourCount === 1 ? 'flavour' : 'flavours'} />
              <Stat icon={<PawPrint className="w-3.5 h-3.5" />} value="100%"          label="natural" />
            </div>

            {/* Decorative divider */}
            <div className="mt-12 h-px max-w-md mx-auto bg-gradient-to-r from-transparent via-amber-300 dark:via-amber-700 to-transparent" />
          </div>
        </section>

        {/* ── Sticky filter bar ────────────────────────────────────────── */}
        {/* top-36 = 144px = navbar height, so this docks just below the nav */}
        <div className="sticky top-36 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white/85 dark:bg-[#241b16]/85 backdrop-blur-md border border-amber-200/70 dark:border-[#3a2c23] rounded-2xl shadow-md dark:shadow-[0_8px_28px_rgba(0,0,0,0.45)] px-4 py-3.5">
              <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center">

                {/* Search */}
                <div className="relative w-full lg:w-72 flex-shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    type="text"
                    placeholder="Search gallery…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-amber-50/60 dark:bg-[#2d221c] border border-amber-100 dark:border-[#3a2c23] rounded-xl text-sm text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#7A5C4F]/60 dark:placeholder-[#c8b6a6]/50 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[#7A5C4F]/60 hover:text-amber-600 dark:text-[#c8b6a6]/50 dark:hover:text-amber-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter pills (horizontal scroll on mobile) */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 lg:flex-wrap lg:overflow-visible scrollbar-thin">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white shadow-md shadow-amber-500/30 dark:shadow-amber-900/40 scale-[1.04]'
                            : 'bg-white dark:bg-[#1e1510] text-[#7A5C4F] dark:text-[#c8b6a6] border border-amber-100 dark:border-[#3a2c23] hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-700 dark:hover:text-amber-400'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Gallery grid ─────────────────────────────────────────────── */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">

          {/* Loading skeletons */}
          {fetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-600 dark:text-amber-400">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                  {activeFilter !== 'ALL' && <span className="text-[#7A5C4F]/70 dark:text-[#c8b6a6]/50 font-medium normal-case tracking-normal"> · filtered by {activeFilter.toLowerCase()}</span>}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 via-amber-200/40 to-transparent dark:from-amber-800/60 dark:via-amber-900/30" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filteredItems.map((item, index) => {
                  const key = itemKey(item);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      style={{ transitionDelay: `${Math.min(index * 55, 550)}ms` }}
                      className={`group relative overflow-hidden rounded-2xl border border-amber-100/80 dark:border-[#3a2c23] bg-white dark:bg-[#241b16] shadow-sm hover:shadow-xl hover:shadow-amber-900/10 dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.55)] hover:border-amber-300 dark:hover:border-amber-700 hover:-translate-y-1.5 transition-all duration-500 text-left ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                      {/* Amber accent stripe — same motif as cart item cards */}
                      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-amber-50 dark:bg-[#2d221c]">
                        {imgErrors.has(key) ? (
                          <ImageFallback title={item.title} />
                        ) : (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            onError={() => handleImgError(key)}
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}

                        {/* Category chip — top-left, always visible */}
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 dark:bg-[#1a1410]/85 backdrop-blur-sm text-[#2f1e14] dark:text-amber-300 text-[10px] font-bold tracking-[0.18em] uppercase rounded-full shadow-sm border border-white/60 dark:border-white/10">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          {item.category}
                        </span>

                        {/* Hover zoom badge */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                          <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-900/30">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Hover gradient overlay with title */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2f1e14]/95 via-[#2f1e14]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none flex items-end">
                          <div className="p-5 w-full">
                            <h3 className="font-antique text-xl text-white leading-tight mb-1.5">
                              {item.title}
                            </h3>
                            <p className="text-amber-100/85 text-xs leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="p-4">
                        <p className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] text-sm leading-snug truncate">
                          {item.title}
                        </p>
                        <p className="text-[12px] text-[#7A5C4F] dark:text-[#c8b6a6] truncate mt-1 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="mt-3 pt-3 border-t border-dashed border-amber-100 dark:border-[#3a2c23] flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400">
                            View
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : items.length === 0 ? (
            /* Gallery is empty — no photos uploaded yet */
            <EmptyState
              icon={<Camera className="w-7 h-7 text-amber-500" />}
              title="Gallery coming soon"
              subtitle="We're adding photos of our products. Check back soon."
            />
          ) : (
            /* Has items but search/filter returned nothing */
            <EmptyState
              icon={<Search className="w-7 h-7 text-amber-500" />}
              title="No items found"
              subtitle="Try a different filter or clear your search."
              action={
                <button
                  onClick={() => { setActiveFilter('ALL'); setSearchTerm(''); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-500 dark:to-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-amber-300/60 hover:-translate-y-0.5"
                >
                  Clear filters
                </button>
              }
            />
          )}
        </section>

        {/* ── Bottom CTA banner ───────────────────────────────────────── */}
        {/* Light cream-amber panel in light mode; subtle warm-brown in dark mode.
            Keeps the same warm vibe as the cart/checkout cards instead of slamming
            a dark slab over the cream page background. */}
        {!fetching && items.length > 0 && (
          <section className="relative pb-20 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-[#fbf3e4] to-orange-50 dark:from-[#241b16] dark:via-[#2a1f18] dark:to-[#1e1510] border border-amber-200/80 dark:border-[#3a2c23] px-6 py-12 sm:px-12 sm:py-14 text-center shadow-md dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                {/* Amber accent top stripe — same motif as cart/gallery cards */}
                <div aria-hidden className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                {/* Soft ambient glows */}
                <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-300/40 dark:bg-amber-900/25 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-orange-200/50 dark:bg-orange-900/20 blur-3xl" />

                <div className="relative">
                  <span className="inline-flex items-center gap-2 bg-white/70 dark:bg-[#1a1410]/60 backdrop-blur-sm border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-bold tracking-[0.25em] uppercase px-3.5 py-1.5 rounded-full mb-5">
                    <PawPrint className="w-3 h-3" />
                    Treat your pup
                  </span>
                  <h2 className="font-antique text-3xl sm:text-4xl md:text-5xl text-[#2f1e14] dark:text-[#f5e9dc] leading-[1.05] mb-4">
                    Ready to make your{' '}
                    <span className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 dark:from-amber-300 dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                      dog smile?
                    </span>
                  </h2>
                  <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
                    Every chew in our gallery comes from the same recipe — pure yak milk, slow-pressed, naturally smoked.
                  </p>
                  <Link
                    href="/products"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 text-white font-bold py-3.5 px-7 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-amber-300/60 dark:hover:shadow-amber-900/50 hover:-translate-y-0.5"
                  >
                    Shop the collection
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Lightbox ─────────────────────────────────────────────────── */}
        {lightboxItem && lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            {/* Close */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-amber-500 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/80 text-xs font-bold tracking-[0.2em] uppercase pointer-events-none">
              {lightboxIndex + 1} / {filteredItems.length}
            </div>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i !== null ? (i - 1 + filteredItems.length) % filteredItems.length : null)); }}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-amber-500 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i !== null ? (i + 1) % filteredItems.length : null)); }}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-amber-500 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Content */}
            <div
              key={itemKey(lightboxItem)}
              className="w-full max-w-4xl mx-12 md:mx-20"
              style={{ animation: 'lightboxIn 0.25s ease-out both' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#241b16] border border-[#3a2c23]">
                {/* Amber stripe */}
                <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

                {imgErrors.has(itemKey(lightboxItem)) ? (
                  <div className="aspect-video flex items-center justify-center bg-[#2d221c]">
                    <ImageFallback title={lightboxItem.title} />
                  </div>
                ) : (
                  <Image
                    src={lightboxItem.image}
                    alt={lightboxItem.title}
                    width={1200}
                    height={800}
                    className="w-full h-auto max-h-[65vh] object-contain bg-[#1a1410]"
                    onError={() => handleImgError(itemKey(lightboxItem))}
                  />
                )}
                <div className="px-6 py-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="inline-block px-2.5 py-1 bg-amber-500 text-[#2f1e14] text-[10px] font-bold tracking-[0.2em] uppercase rounded-full mb-2">
                      {lightboxItem.category}
                    </span>
                    <h3 className="font-antique text-2xl text-white leading-tight">{lightboxItem.title}</h3>
                    <p className="text-amber-100/60 text-sm mt-1.5 leading-relaxed">{lightboxItem.description}</p>
                  </div>
                  <div className="text-right text-[10px] text-white/40 flex-shrink-0 hidden sm:block">
                    <p className="font-bold tracking-widest uppercase">{lightboxIndex + 1} of {filteredItems.length}</p>
                    <p className="mt-1">← → to navigate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
};

// ─── Small inline components ──────────────────────────────────────────────────

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 bg-white/70 dark:bg-[#241b16]/70 backdrop-blur-sm border border-amber-200/70 dark:border-[#3a2c23] rounded-2xl px-4 py-2.5 shadow-sm">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
        {icon}
      </span>
      <span className="text-sm">
        <span className="font-bold text-[#2f1e14] dark:text-[#f5e9dc]">{value}</span>
        <span className="text-[#7A5C4F] dark:text-[#c8b6a6] ml-1">{label}</span>
      </span>
    </div>
  );
}

function EmptyState({
  icon, title, subtitle, action,
}: { icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-20 sm:py-24">
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-900/30 scale-[1.5] blur-md" />
        <div className="relative w-20 h-20 rounded-2xl bg-amber-50 dark:bg-[#2d221c] border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="font-antique text-2xl text-[#2f1e14] dark:text-[#f5e9dc] mb-2">{title}</h3>
      <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm max-w-sm mx-auto mb-6">{subtitle}</p>
      {action}
    </div>
  );
}

export default GalleryPage;
