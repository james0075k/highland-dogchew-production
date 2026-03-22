'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

interface Variety {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  products?: any[];
  productCount?: number;
}

/* ── SVG decorations ── */
function PawSvg({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="currentColor">
      <ellipse cx="24" cy="32" rx="10" ry="9" />
      <ellipse cx="13" cy="20" rx="5" ry="6" transform="rotate(-10 13 20)" />
      <ellipse cx="23" cy="14" rx="4.5" ry="6" />
      <ellipse cx="33" cy="17" rx="5" ry="6" transform="rotate(12 33 17)" />
      <ellipse cx="39" cy="26" rx="4" ry="5.5" transform="rotate(25 39 26)" />
    </svg>
  );
}

function StitchLine({ className = '' }: { className?: string }) {
  return (
    <svg className={`mx-auto ${className}`} width="120" height="4" viewBox="0 0 120 4" fill="none">
      <path d="M0 2 L120 2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 5" strokeLinecap="round" className="animate-stitch-var" />
    </svg>
  );
}

export default function VarietyDetailPage() {
  const params = useParams();
  const varietyId = params?.id as string;
  const [variety, setVariety] = useState<Variety | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── scroll-linked parallax (window-based, no ref dependency) ── */
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.08]);
  const overlayFade = useTransform(scrollY, [0, 350], [0.3, 0.65]);

  useEffect(() => {
    if (!varietyId) return;
    const fetchVariety = async () => {
      try {
        const res = await fetch(`${API_BASE}/variety/${varietyId}/products`);
        if (!res.ok) throw new Error('Variety not found');
        const data = await res.json();
        setVariety(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load variety');
      } finally {
        setLoading(false);
      }
    };
    fetchVariety();
  }, [varietyId]);

  const products = variety?.products ?? [];
  const productCount = variety?.productCount ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] pt-40 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-14 h-14 border-[3px] border-[#B8976A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: 'italic' }}>Loading variety...</p>
        </div>
      </div>
    );
  }

  if (error || !variety) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] pt-40 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <PawSvg className="w-14 h-14 mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
          <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Variety not found'}</p>
          <Link href="/" className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#B8976A] to-[#9A7B52] text-white rounded-full hover:from-[#9A7B52] hover:to-[#7A5C4F] transition-all text-sm font-semibold tracking-wide" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)] transition-colors duration-300">

      {/* ═══════ HERO ═══════ */}
      <div className="relative h-[380px] md:h-[480px] overflow-hidden">
        {variety.image ? (
          <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
            <img src={variety.image} alt={variety.name} className="w-full h-full object-cover" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#B8976A] to-[#7A5C4F]" />
        )}

        <motion.div className="absolute inset-0 bg-gradient-to-t from-[#1a1410] via-[#1a1410]/30 to-transparent" style={{ opacity: overlayFade }} />

        {/* paw silhouettes */}
        {[
          { left: '10%', top: '20%', size: 'w-8 h-8', rot: '-15deg', op: '0.06' },
          { left: '85%', top: '25%', size: 'w-10 h-10', rot: '22deg', op: '0.05' },
        ].map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: Number(p.op), scale: 1 }} transition={{ duration: 1.2, delay: 0.4 + i * 0.3 }} className={`absolute ${p.size} text-white pointer-events-none`} style={{ left: p.left, top: p.top, transform: `rotate(${p.rot})` }}>
            <PawSvg className="w-full h-full" />
          </motion.div>
        ))}

        {/* stitch */}
        <div className="absolute bottom-20 right-8 md:right-14 opacity-25">
          <StitchLine className="text-white/50" />
        </div>

        {/* hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 px-4 text-center">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="inline-flex items-center gap-2 text-[#D4BC8E] text-[12px] font-semibold tracking-[0.22em] uppercase mb-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            <PawSvg className="w-3.5 h-3.5" />
            Special Variety
            <PawSvg className="w-3.5 h-3.5 scale-x-[-1]" />
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="text-[40px] md:text-[52px] text-white drop-shadow-lg tracking-[0.04em]" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            {variety.name}
          </motion.h1>

          {variety.description && (
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="text-white/75 max-w-xl text-[15px] md:text-[17px] leading-relaxed mt-3" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
              {variety.description}
            </motion.p>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--surface-page)] to-transparent" />
      </div>

      {/* ═══════ BACK LINK ═══════ */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <Link href="/variety" className="inline-flex items-center gap-2 text-[#B8976A] dark:text-[#D4BC8E] hover:text-[#9A7B52] font-medium transition-colors text-sm" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          <ChevronLeft className="w-4 h-4" />
          All Varieties
        </Link>
      </div>

      {/* ═══════ PRODUCTS ═══════ */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8">
          <h2 className="text-[24px] md:text-[30px] text-[var(--text-primary)] mb-1 transition-colors duration-300" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            Products in {variety.name}
          </h2>
          <p className="text-[var(--text-muted)] text-sm transition-colors duration-300" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
            {productCount} product{productCount !== 1 ? 's' : ''} available
          </p>
        </motion.div>

        {products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <PawSvg className="w-16 h-16 text-[var(--text-muted)] opacity-20 mb-4" />
            <p className="text-[var(--text-secondary)] text-lg font-medium mb-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
              No products yet
            </p>
            <p className="text-[var(--text-muted)] text-sm mb-6" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: 'italic' }}>
              Products for this variety will appear here once added.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/products" className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#B8976A] to-[#9A7B52] text-white rounded-full text-sm font-semibold tracking-wide transition-all" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Browse All Products
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any, index: number) => (
              <motion.div key={product._id || index} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}>
                <ProductCard product={product} priority={index === 0} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════ STYLES ═══════ */}
      <style>{`
        @keyframes stitch-dash-var {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 22; }
        }
        .animate-stitch-var {
          animation: stitch-dash-var 1.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
