'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, X, ChevronLeft, ChevronRight, ImageOff,
  ZoomIn, Camera,
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
    <div className="rounded-2xl border border-amber-100 dark:border-[#3a2c23] bg-white dark:bg-[#1e1510] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-amber-100 dark:bg-[#2a1e16]" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 w-3/4 bg-amber-100 dark:bg-[#2a1e16] rounded-full" />
        <div className="h-2.5 w-1/2 bg-amber-50 dark:bg-[#241a12] rounded-full" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const GalleryPage: React.FC = () => {
  const [activeFilter, setActiveFilter]     = useState<string>('ALL');
  const [searchTerm, setSearchTerm]         = useState<string>('');
  const [lightboxIndex, setLightboxIndex]   = useState<number | null>(null);
  const [imgErrors, setImgErrors]           = useState<Set<string>>(new Set());
  const [loaded, setLoaded]                 = useState(false);
  const [items, setItems]                   = useState<GalleryItem[]>([]);
  const [fetching, setFetching]             = useState(true);

  // Fetch gallery from API
  useEffect(() => {
    fetch(`${API_BASE}/gallery`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.data)) setItems(data.data);
      })
      .catch(() => {})
      .finally(() => {
        setFetching(false);
        setTimeout(() => setLoaded(true), 50);
      });
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setLightboxIndex(i => i !== null ? (i - 1 + filteredItems.length) % filteredItems.length : null);
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? (i + 1) % filteredItems.length : null);
      if (e.key === 'Escape')     setLightboxIndex(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex]);

  const itemKey = (item: GalleryItem) => item._id || String(item.id || item.image);

  const handleImgError = (key: string) =>
    setImgErrors(prev => new Set([...prev, key]));

  // Only show categories that have items (+ ALL)
  const presentCats = ['ALL', ...Array.from(new Set(items.map(i => i.category))).sort()];
  const CATEGORIES = ALL_CATEGORIES.filter(c => presentCats.includes(c));

  const filteredItems = items.filter(item => {
    const matchesFilter = activeFilter === 'ALL' || item.category === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const lightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <main className="min-h-screen bg-[#f9f5ef] dark:bg-[#150e09]">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f1e14] via-[#3d2512] to-[#1e1108] pt-32 pb-16 md:pb-20">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-amber-200/50 mb-6 uppercase tracking-widest">
            <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-200/80">Gallery</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">Highland Yak Chew</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            Our Gallery
          </h1>
          <p className="text-amber-100/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Discover our range of natural Himalayan dog chews — crafted from pure yak milk
            with premium, dog-friendly flavours your pet will love.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-amber-200/50">
            <span>{items.length} photos</span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span>{Math.max(CATEGORIES.length - 1, 0)} flavours</span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span>100% natural</span>
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#f9f5ef]/95 dark:bg-[#150e09]/95 backdrop-blur-sm border-b border-amber-200 dark:border-[#3a2c23] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

            {/* Search */}
            <div className="relative flex-shrink-0 w-full sm:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1e1510] border border-amber-200 dark:border-[#3a2c23] rounded-xl text-sm text-[#2f1e14] dark:text-[#f5e9dc] placeholder-amber-300 dark:placeholder-amber-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 ${
                    activeFilter === cat
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-white dark:bg-[#1e1510] text-[#5C4033] dark:text-[#c8b6a6] border border-amber-200 dark:border-[#3a2c23] hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-700 dark:hover:text-amber-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Gallery grid ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">

        {/* Loading skeletons */}
        {fetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            <p className="text-xs text-amber-500 font-bold tracking-widest uppercase mb-8">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              {activeFilter !== 'ALL' && <span className="text-amber-400"> · {activeFilter}</span>}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredItems.map((item, index) => {
                const key = itemKey(item);
                return (
                  <div
                    key={key}
                    onClick={() => setLightboxIndex(index)}
                    style={{ transitionDelay: `${Math.min(index * 55, 550)}ms` }}
                    className={`group relative overflow-hidden rounded-2xl border border-amber-100 dark:border-[#3a2c23] bg-white dark:bg-[#1e1510] shadow-sm hover:shadow-xl hover:shadow-amber-900/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-amber-50 dark:bg-[#2a1e16]">
                      {imgErrors.has(key) ? (
                        <ImageFallback title={item.title} />
                      ) : (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          onError={() => handleImgError(key)}
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1108]/95 via-[#1e1108]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none">
                      <div className="absolute bottom-[68px] left-0 right-0 p-5">
                        <span className="inline-block px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold tracking-widest uppercase rounded-full mb-2">
                          {item.category}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1">{item.title}</h3>
                        <p className="text-white/70 text-xs">{item.description}</p>
                      </div>
                      <div className="absolute top-3.5 right-3.5">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="p-4 border-t border-amber-50 dark:border-[#2a1e16]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#2f1e14] dark:text-[#f5e9dc] truncate">{item.title}</p>
                          <p className="text-[11px] text-[#7a5c45] dark:text-[#9a7a68] truncate mt-0.5">{item.description}</p>
                        </div>
                        <span className="flex-shrink-0 text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : items.length === 0 ? (
          /* Gallery is empty — no photos uploaded yet */
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">Gallery coming soon</h3>
            <p className="text-[#7a5c45] dark:text-[#9a7a68] text-sm">
              Check back soon — we&apos;re adding photos of our products.
            </p>
          </div>
        ) : (
          /* Has items but search/filter returned nothing */
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">No items found</h3>
            <p className="text-[#7a5c45] dark:text-[#9a7a68] text-sm mb-4">
              Try a different filter or clear your search.
            </p>
            <button
              onClick={() => { setActiveFilter('ALL'); setSearchTerm(''); }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-amber-500/20"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {lightboxItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/70 text-xs font-semibold pointer-events-none">
            {lightboxIndex + 1} / {filteredItems.length}
          </div>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i !== null ? (i - 1 + filteredItems.length) % filteredItems.length : null); }}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-amber-500 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i !== null ? (i + 1) % filteredItems.length : null); }}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-amber-500 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Content */}
          <div
            className="w-full max-w-4xl mx-14 md:mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#1e1510] border border-[#3a2c23]">
              {imgErrors.has(itemKey(lightboxItem)) ? (
                <div className="aspect-video flex items-center justify-center bg-[#2a1e16]">
                  <ImageFallback title={lightboxItem.title} />
                </div>
              ) : (
                <Image
                  src={lightboxItem.image}
                  alt={lightboxItem.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[65vh] object-contain"
                  onError={() => handleImgError(itemKey(lightboxItem))}
                />
              )}
              <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold tracking-widest uppercase rounded-full mb-2">
                    {lightboxItem.category}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight">{lightboxItem.title}</h3>
                  <p className="text-white/60 text-sm mt-1">{lightboxItem.description}</p>
                </div>
                <div className="text-right text-xs text-white/40 flex-shrink-0">
                  <p className="font-semibold">{lightboxIndex + 1} of {filteredItems.length}</p>
                  <p className="mt-0.5">← → to navigate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default GalleryPage;
