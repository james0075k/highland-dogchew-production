'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { blogPosts } from './data';

const categoryColors: Record<string, string> = {
  'Dog Health':    'bg-[#e8f5e9] text-[#2e7d32] dark:bg-emerald-900/40 dark:text-emerald-300',
  'Our Story':     'bg-[#fff3e0] text-[#e65100] dark:bg-amber-900/40  dark:text-amber-300',
  'Buying Guide':  'bg-[#e3f2fd] text-[#1565c0] dark:bg-sky-900/40    dark:text-sky-300',
  'Product Guide': 'bg-[#f3e5f5] text-[#7b1fa2] dark:bg-purple-900/40 dark:text-purple-300',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ── Scroll-reveal hook ───────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ── Paw divider ─────────────────────────────────────────────────── */
function PawDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div className="h-px w-10 md:w-14" style={{ background: 'var(--color-gold-light)' }} />
      <svg className="w-4 h-4 text-[#B8976A] dark:text-[#D4BC8E]" viewBox="0 0 24 24" fill="currentColor">
        <ellipse cx="7.5" cy="7" rx="2.5" ry="3" />
        <ellipse cx="16.5" cy="7" rx="2.5" ry="3" />
        <ellipse cx="4" cy="13" rx="2" ry="2.5" />
        <ellipse cx="20" cy="13" rx="2" ry="2.5" />
        <path d="M12 22c-4 0-7-3.5-7-6 0-2.5 3-5 7-5s7 2.5 7 5c0 2.5-3 6-7 6z" />
      </svg>
      <div className="h-px w-10 md:w-14" style={{ background: 'var(--color-gold-light)' }} />
    </div>
  );
}

/* ── Featured card ───────────────────────────────────────────────── */
function FeaturedCard({ post }: { post: typeof blogPosts[0] }) {
  const { ref, visible } = useReveal(0.1);
  const [imgHover, setImgHover] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-[#2E1F14]/8 dark:border-[#3a2c23] bg-white dark:bg-[#1f1812]"
          style={{ boxShadow: '0 4px 24px rgba(46, 31, 20, 0.08)' }}
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}
        >
          <div className="relative h-72 md:h-auto min-h-[300px] overflow-hidden" style={{ background: 'var(--surface-image-bg)' }}>
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-all duration-700 ease-out"
              style={{
                transform: imgHover ? 'scale(1.06)' : 'scale(1)',
                filter: imgHover ? 'brightness(1.05)' : 'brightness(1)',
              }}
            />
            {/* Warm gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E1F14]/20 to-transparent opacity-60 pointer-events-none" />
            <span
              className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {post.category}
            </span>
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-gold)' }} />
              <span>{post.readTime}</span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-4 leading-snug transition-colors duration-300"
              style={{
                fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                color: imgHover ? '#8B5E3C' : 'var(--text-primary)',
              }}
            >
              {post.title}
            </h2>
            <p className="leading-relaxed mb-6 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
              {post.excerpt}
            </p>
            <span
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300"
              style={{ color: 'var(--color-gold-hover)' }}
            >
              Read Full Article
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── Blog card ───────────────────────────────────────────────────── */
function BlogCard({ post, index }: { post: typeof blogPosts[0]; index: number }) {
  const { ref, visible } = useReveal(0.1);
  const [imgHover, setImgHover] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms`,
      }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article
          className="rounded-2xl overflow-hidden border border-[#2E1F14]/8 dark:border-[#3a2c23] bg-white dark:bg-[#1f1812] h-full flex flex-col transition-shadow duration-400"
          style={{ boxShadow: imgHover ? '0 12px 40px rgba(46, 31, 20, 0.12)' : '0 2px 12px rgba(46, 31, 20, 0.06)' }}
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}
        >
          <div className="relative h-56 overflow-hidden" style={{ background: 'var(--surface-image-bg)' }}>
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-all duration-700 ease-out"
              style={{
                transform: imgHover ? 'scale(1.08)' : 'scale(1)',
              }}
            />
            {/* Warm vignette */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(46, 31, 20, 0.15) 100%)',
                opacity: imgHover ? 0 : 0.6,
              }}
            />
            <span
              className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {post.category}
            </span>

            {/* Read time pill on hover */}
            <div
              className="absolute bottom-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-md transition-all duration-300"
              style={{
                background: 'rgba(253, 250, 246, 0.9)',
                color: 'var(--color-warm-brown)',
                opacity: imgHover ? 1 : 0,
                transform: imgHover ? 'translateY(0)' : 'translateY(6px)',
              }}
            >
              {post.readTime}
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-gold)' }} />
              <span>{post.readTime}</span>
            </div>
            <h2
              className="text-lg font-bold mb-3 leading-snug flex-1 transition-colors duration-300"
              style={{
                fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                color: imgHover ? '#8B5E3C' : 'var(--text-primary)',
              }}
            >
              {post.title}
            </h2>
            <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
              {post.excerpt}
            </p>
            <span
              className="inline-flex items-center gap-2 text-sm font-semibold mt-auto transition-all duration-300"
              style={{ color: 'var(--color-gold-hover)' }}
            >
              Read More
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </article>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Blog Page
═══════════════════════════════════════════════════════════════════ */
export default function BlogPage() {
  const [featured, ...rest] = blogPosts;
  const heroReveal = useReveal(0.1);

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
      {/* Hero */}
      <section
        className="border-b"
        style={{
          background: 'linear-gradient(180deg, var(--surface-secondary) 0%, var(--surface-page) 100%)',
          borderColor: 'var(--border-base)',
        }}
      >
        <div
          ref={heroReveal.ref}
          className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center"
          style={{
            opacity: heroReveal.visible ? 1 : 0,
            transform: heroReveal.visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <PawDivider />
          <p
            className="text-xs font-medium tracking-[0.25em] uppercase mt-4 mb-3"
            style={{ color: 'var(--color-gold)' }}
          >
            Highland Yak Chew Blog
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
            style={{
              fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Dog Chew Guides & Tips
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Expert articles on yak milk chews, dog nutrition, and everything you need to give your
            dog the best natural treats from the Himalayas.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        {/* Featured post */}
        <div className="mb-14 md:mb-16">
          <p
            className="text-xs font-medium tracking-[0.2em] uppercase mb-5"
            style={{ color: 'var(--color-gold)' }}
          >
            Latest Article
          </p>
          <FeaturedCard post={featured} />
        </div>

        {/* Divider */}
        <div className="mb-12 md:mb-14">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border-base)' }} />
            <p
              className="text-xs font-medium tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              More Articles
            </p>
            <div className="flex-1 h-px" style={{ background: 'var(--border-base)' }} />
          </div>
        </div>

        {/* Grid of remaining posts */}
        <div className="grid sm:grid-cols-2 gap-8">
          {rest.map((post, i) => (
            <BlogCard key={post.slug} post={post} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom gold border */}
      <div
        className="w-full h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-gold-light) 30%, var(--color-gold) 50%, var(--color-gold-light) 70%, transparent 100%)' }}
      />
    </main>
  );
}
