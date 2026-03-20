'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, ArrowLeft } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

const PLACEHOLDER_SRC = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23F4EDE4"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="64" fill="%23C4A882">🐾</text></svg>';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  gallery?: string[];
  description?: string;
  badge?: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(q);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchResults = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.success ? (data.data || []) : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    setInputValue(q);
    fetchResults(q);
  }, [q, fetchResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const getProductImage = (p: Product) => p.image || p.gallery?.[0] || '';

  return (
    <div className="min-h-screen bg-[#FDFAF6] dark:bg-[#0f0a06]">
      {/* Header */}
      <div className="border-b border-[#2E1F14]/8 dark:border-[#3a2c23] bg-white dark:bg-[#1a1209]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] mb-5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 bg-[#FDFAF6] dark:bg-[#241b16] border border-[#2E1F14]/12 dark:border-[#3a2c23] rounded-full px-5 py-3.5 focus-within:border-[#C4A882] dark:focus-within:border-amber-600 transition-colors shadow-sm">
              <Search className="w-4 h-4 text-[#C4A882] dark:text-amber-500 flex-shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search products…"
                autoFocus
                className="flex-1 bg-transparent text-sm text-[#2E1F14] dark:text-[#f5e9dc] placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/40 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#2E1F14] dark:bg-amber-700 text-white text-sm font-semibold tracking-wide hover:bg-[#1a1108] dark:hover:bg-amber-600 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Status line */}
        <div className="mb-6">
          {loading && (
            <div className="flex items-center gap-2 text-[#7A5C4F] dark:text-[#c8b6a6]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Searching…</span>
            </div>
          )}
          {!loading && searched && q && (
            <p className="text-sm text-[#5C4033] dark:text-[#c8b6a6]">
              {results.length > 0
                ? <><strong className="text-[#2E1F14] dark:text-[#f5e9dc]">{results.length}</strong> result{results.length !== 1 ? 's' : ''} for <strong className="text-[#2E1F14] dark:text-[#f5e9dc]">&ldquo;{q}&rdquo;</strong></>
                : <>No results for <strong className="text-[#2E1F14] dark:text-[#f5e9dc]">&ldquo;{q}&rdquo;</strong></>
              }
            </p>
          )}
          {!q && (
            <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">Enter a search term above to find products.</p>
          )}
        </div>

        {/* Product grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map(p => {
              const imgSrc = getProductImage(p);
              return (
                <Link
                  key={p._id}
                  href={`/products/${p.slug}`}
                  className="group bg-white dark:bg-[#1a1209] rounded-2xl overflow-hidden border border-[#2E1F14]/6 dark:border-[#3a2c23] hover:border-[#C4A882]/40 dark:hover:border-amber-700/40 hover:shadow-lg transition-all duration-200"
                >
                  <div className="aspect-square bg-[#F4EDE4] dark:bg-[#2d221c] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc || PLACEHOLDER_SRC}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC; }}
                    />
                  </div>
                  <div className="p-3">
                    {p.badge && (
                      <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded px-1.5 py-0.5 mb-1.5">
                        {p.badge}
                      </span>
                    )}
                    <p className="text-sm font-medium text-[#2E1F14] dark:text-[#f5e9dc] leading-snug line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-sm font-semibold text-[#5C4033] dark:text-[#c8b6a6] mt-1.5">
                      £{Number(p.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* No results state */}
        {!loading && searched && results.length === 0 && q && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🐾</p>
            <p className="text-lg font-semibold text-[#2E1F14] dark:text-[#f5e9dc] mb-2">No products found</p>
            <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] mb-6">
              Try a different search term or browse our categories.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2E1F14] dark:bg-amber-700 text-white text-sm font-semibold hover:bg-[#1a1108] dark:hover:bg-amber-600 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFAF6] dark:bg-[#0f0a06] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#C4A882]" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
