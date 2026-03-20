'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

const PLACEHOLDER_SRC = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23F4EDE4"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="22" fill="%23C4A882">🐾</text></svg>';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  gallery?: string[];
}

interface Props { open: boolean; onClose: () => void; }

const suggestions = [
  { label: 'Yak Milk Chews', href: '/products/yak-chews' },
  { label: 'Puff Treats', href: '/products/puff-treats' },
  { label: 'Highland Mix', href: '/products/highland-mix' },
  { label: 'All Products', href: '/products' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
];

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
    }
  }, [open]);

  // Reset active index whenever results change
  useEffect(() => { setActiveIndex(-1); }, [results]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Global Escape handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.success ? (data.data || []).slice(0, 6) : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 300ms debounce, 2+ char minimum
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const navigateTo = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!query.trim()) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        navigateTo(`/products/${results[activeIndex].slug}`);
      } else {
        navigateTo(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const getProductImage = (p: Product) => p.image || p.gallery?.[0] || '';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9997] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Right-side drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[9998] w-full sm:w-[400px] bg-[#FDFAF6] dark:bg-[#1a1209] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-5 border-b border-[#2E1F14]/8 dark:border-[#3a2c23]">
          <h2 className="text-base font-semibold tracking-[0.12em] uppercase text-[#2E1F14] dark:text-[#f5e9dc]">
            Search
          </h2>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#7A5C4F] dark:text-[#c8b6a6] hover:bg-[#F4EDE4] dark:hover:bg-[#241b16] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 bg-white dark:bg-[#241b16] border border-[#2E1F14]/12 dark:border-[#3a2c23] rounded-full px-4 py-3 shadow-sm focus-within:border-[#C4A882] dark:focus-within:border-amber-600 transition-colors">
            <Search className="w-4 h-4 text-[#C4A882] dark:text-amber-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type here..."
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-[#2E1F14] dark:text-[#f5e9dc] placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/40 focus:outline-none"
            />
            {loading
              ? <Loader2 className="w-3.5 h-3.5 text-[#C4A882] animate-spin flex-shrink-0" />
              : query && (
                <button
                  onClick={() => { setQuery(''); setResults([]); setActiveIndex(-1); }}
                  className="text-[#7A5C4F]/50 dark:text-[#c8b6a6]/50 hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )
            }
          </div>
          {/* Min-length hint */}
          {query.length === 1 && (
            <p className="text-[11px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 mt-2 px-1">
              Type at least 2 characters to search…
            </p>
          )}
        </div>

        {/* Scrollable content */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-6 pb-8">

          {/* Suggestions — shown when no active query */}
          {query.trim().length < 2 && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C4A882] dark:text-amber-500 mb-3">
                Popular
              </p>
              <ul className="space-y-0.5">
                {suggestions.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      onClick={onClose}
                      className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[#F4EDE4] dark:hover:bg-[#241b16] group transition-colors"
                    >
                      <span className="text-sm text-[#5C4033] dark:text-[#c8b6a6] group-hover:text-[#2E1F14] dark:group-hover:text-[#f5e9dc] transition-colors">
                        {s.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C4A882]/40 dark:text-amber-500/40 group-hover:text-[#C4A882] dark:group-hover:text-amber-500 transition-all group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Product results */}
          {query.trim().length >= 2 && results.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C4A882] dark:text-amber-500 mb-3">
                Products
              </p>
              <div className="space-y-0.5" role="listbox">
                {results.map((p, i) => {
                  const imgSrc = getProductImage(p);
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={p._id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => navigateTo(`/products/${p.slug}`)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group text-left ${isActive ? 'bg-[#F4EDE4] dark:bg-[#241b16]' : 'hover:bg-[#F4EDE4] dark:hover:bg-[#241b16]'}`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F4EDE4] dark:bg-[#2d221c] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc || PLACEHOLDER_SRC}
                          alt={p.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          onError={e => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-amber-700 dark:text-amber-400' : 'text-[#2E1F14] dark:text-[#f5e9dc] group-hover:text-amber-700 dark:group-hover:text-amber-400'}`}>
                          {p.name}
                        </p>
                        <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] mt-0.5">
                          £{Number(p.price).toFixed(2)}
                        </p>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-all ${isActive ? 'text-[#C4A882] translate-x-0.5' : 'text-[#C4A882]/40 group-hover:text-[#C4A882] group-hover:translate-x-0.5'}`} />
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => navigateTo(`/search?q=${encodeURIComponent(query.trim())}`)}
                className="mt-4 w-full text-xs font-semibold tracking-[0.1em] uppercase text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors py-2.5 border border-[#2E1F14]/10 dark:border-[#3a2c23] rounded-full hover:border-[#2E1F14]/30 dark:hover:border-[#5a4233]"
              >
                View all results for &ldquo;{query}&rdquo; →
              </button>
            </div>
          )}

          {/* No results */}
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] px-3 py-2">
              No products found for{' '}
              <strong className="text-[#2E1F14] dark:text-[#f5e9dc]">&ldquo;{query}&rdquo;</strong>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
