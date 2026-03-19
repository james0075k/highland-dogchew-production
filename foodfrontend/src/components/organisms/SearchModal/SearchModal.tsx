'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

interface Product { _id: string; name: string; slug: string; price: number; images?: string[]; }

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
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.success ? (data.data || []).slice(0, 5) : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 350);
    return () => clearTimeout(t);
  }, [query, search]);

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
              onKeyDown={e => {
                if (e.key === 'Enter' && query.trim()) {
                  router.push(`/products?search=${encodeURIComponent(query.trim())}`);
                  onClose();
                }
              }}
              placeholder="Type here..."
              className="flex-1 bg-transparent text-sm text-[#2E1F14] dark:text-[#f5e9dc] placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/40 focus:outline-none"
            />
            {loading
              ? <Loader2 className="w-3.5 h-3.5 text-[#C4A882] animate-spin flex-shrink-0" />
              : query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-[#7A5C4F]/50 dark:text-[#c8b6a6]/50 hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )
            }
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">

          {/* Suggestions — shown when no query */}
          {!query.trim() && (
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
          {query.trim() && results.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C4A882] dark:text-amber-500 mb-3">
                Products
              </p>
              <div className="space-y-0.5">
                {results.map(p => (
                  <Link
                    key={p._id}
                    href={`/products/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F4EDE4] dark:hover:bg-[#241b16] transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F4EDE4] dark:bg-[#2d221c] flex-shrink-0">
                      {p.images?.[0] && (
                        <Image src={p.images[0]} alt={p.name} width={48} height={48} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2E1F14] dark:text-[#f5e9dc] truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] mt-0.5">
                        £{Number(p.price).toFixed(2)}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C4A882]/40 group-hover:text-[#C4A882] flex-shrink-0 transition-all group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>

              {results.length >= 5 && (
                <button
                  onClick={() => { router.push(`/products?search=${encodeURIComponent(query.trim())}`); onClose(); }}
                  className="mt-4 w-full text-xs font-semibold tracking-[0.1em] uppercase text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors py-2.5 border border-[#2E1F14]/10 dark:border-[#3a2c23] rounded-full hover:border-[#2E1F14]/30 dark:hover:border-[#5a4233]"
                >
                  View all results →
                </button>
              )}
            </div>
          )}

          {/* No results */}
          {query.trim() && !loading && results.length === 0 && (
            <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] px-3 py-2">
              No products found for{' '}
              <strong className="text-[#2E1F14] dark:text-[#f5e9dc]">"{query}"</strong>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
