'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Play, Instagram, Image as ImageIcon, Film, Grid3X3 } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */
interface Post {
  id?: string;
  permalink?: string;
  mediaType?: string;
  isVideo?: boolean;
  isCarousel?: boolean;
  timestamp?: string;
  _id?: string;
  instagramLink?: string;
  type?: 'photo' | 'reel' | 'video';
  image: string;
  caption: string;
}

/* ─── Fallback (static) posts ───────────────────────────────────────── */
const FALLBACK: Post[] = [
  { id: 'f1', image: '/images/dog-28.jpeg', caption: 'Happy dog enjoying a Highland Yak Chew!', permalink: 'https://instagram.com/highlanddogchew', isVideo: true },
  { id: 'f2', image: '/images/dog-13.jpeg', caption: 'Long-lasting yak milk chews — your dog will love them!', permalink: 'https://instagram.com/highlanddogchew', isVideo: true },
  { id: 'f3', image: '/images/dog-17.jpeg', caption: 'Natural & grain-free. Made from authentic mountain recipes.', permalink: 'https://instagram.com/highlanddogchew', isVideo: false },
  { id: 'f4', image: '/images/dog-25.jpeg', caption: 'Your dog deserves the best — try Highland Yakchew!', permalink: 'https://instagram.com/highlanddogchew', isVideo: false },
  { id: 'f5', image: '/images/dog-23.jpeg', caption: 'Unboxing day! Himalayan Puff Treats have arrived', permalink: 'https://instagram.com/highlanddogchew', isVideo: true },
  { id: 'f6', image: '/images/dog-21.jpeg', caption: 'Dental health + happy dog = Highland Yakchew', permalink: 'https://instagram.com/highlanddogchew', isVideo: false },
  { id: 'f7', image: '/images/dog-16.jpeg', caption: 'Puppy approved! Yak Milk Chews for every breed', permalink: 'https://instagram.com/highlanddogchew', isVideo: true },
  { id: 'f8', image: '/images/dog-33.jpeg', caption: '100% natural. No grain. No gluten. Just goodness.', permalink: 'https://instagram.com/highlanddogchew', isVideo: false },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */
const API = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

function extractHandle(url: string): string {
  if (!url) return '';
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts[0] ?? '';
  } catch {
    return url.startsWith('@') ? url.slice(1) : url;
  }
}

function normalisePost(raw: any): Post {
  return {
    id:         raw.id || raw._id,
    image:      raw.image || '',
    caption:    raw.caption || '',
    permalink:  raw.permalink || raw.instagramLink || '',
    isVideo:    raw.isVideo ?? (raw.type === 'reel' || raw.type === 'video' || raw.mediaType === 'VIDEO'),
    isCarousel: raw.isCarousel ?? (raw.mediaType === 'CAROUSEL_ALBUM'),
    mediaType:  raw.mediaType || raw.type || 'photo',
  };
}

/* ─── Paw SVG ────────────────────────────────────────────────────────── */
function PawIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="7.5" cy="7" rx="2.5" ry="3" />
      <ellipse cx="16.5" cy="7" rx="2.5" ry="3" />
      <ellipse cx="4" cy="13" rx="2" ry="2.5" />
      <ellipse cx="20" cy="13" rx="2" ry="2.5" />
      <path d="M12 22c-4 0-7-3.5-7-6 0-2.5 3-5 7-5s7 2.5 7 5c0 2.5-3 6-7 6z" />
    </svg>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-2xl animate-pulse"
          style={{
            background: 'linear-gradient(135deg, var(--color-parchment) 0%, var(--color-sand) 100%)',
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Post card ──────────────────────────────────────────────────────── */
function PostCard({ post, index }: { post: Post; index: number }) {
  const link = post.permalink || '#';
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      ref={cardRef}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square overflow-hidden rounded-2xl transition-all duration-500"
      style={{
        background: 'var(--surface-image-bg)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
        transitionDelay: `${index * 70}ms`,
        boxShadow: '0 2px 12px rgba(46, 31, 20, 0.08)',
      }}
    >
      {/* Thumbnail */}
      <img
        src={post.image}
        alt={post.caption}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
      />

      {/* Warm vignette overlay (always visible, subtle) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(46, 31, 20, 0.25) 100%)',
        }}
      />

      {/* Type badge */}
      {post.isVideo && (
        <div className="absolute top-3 left-3 backdrop-blur-md bg-[#2E1F14]/60 text-[#F4EDE4] text-[10px] font-bold tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 uppercase">
          <Film className="w-3 h-3" />
          Reel
        </div>
      )}
      {post.isCarousel && !post.isVideo && (
        <div className="absolute top-3 left-3 backdrop-blur-md bg-[#2E1F14]/60 text-[#F4EDE4] text-[10px] font-bold tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 uppercase">
          <Grid3X3 className="w-3 h-3" />
          Album
        </div>
      )}

      {/* Play button for video */}
      {post.isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-[#F4EDE4]/90 backdrop-blur-sm p-3 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300">
            <Play className="w-6 h-6 text-[#2E1F14] fill-[#2E1F14]" />
          </div>
        </div>
      )}

      {/* Hover overlay with caption */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2E1F14]/90 via-[#2E1F14]/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-4">
        <p className="text-[#F4EDE4] text-sm leading-relaxed line-clamp-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          {post.caption}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-[#D4BC8E]">
          <Instagram className="w-3.5 h-3.5" />
          <span className="text-xs font-medium tracking-wide">View on Instagram</span>
        </div>
      </div>

      {/* Corner Instagram icon on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
        <div className="bg-[#F4EDE4]/90 backdrop-blur-sm p-1.5 rounded-lg">
          <Instagram className="w-4 h-4 text-[#2E1F14]" />
        </div>
      </div>
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════ */
export default function InstagramFeedSection() {
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [igUrl, setIgUrl]           = useState('https://www.instagram.com/highlanddogchew/');
  const [handle, setHandle]         = useState('highlanddogchew');
  const [sectionEnabled, setEnabled] = useState<boolean | null>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const base = API();

    const run = async () => {
      const [settingsRes, contactRes] = await Promise.allSettled([
        fetch(`${base}/instagram/settings`).then(r => r.json()).catch(() => null),
        fetch(`${base}/info`).then(r => r.json()).catch(() => null),
      ]);

      if (cancelled) return;

      const settings = settingsRes.status === 'fulfilled' ? settingsRes.value?.data : null;
      const contact  = contactRes.status  === 'fulfilled' ? contactRes.value?.data  : null;

      const enabled = settings?.isEnabled !== false;
      setEnabled(enabled);

      const savedIgUrl: string = contact?.socialLinks?.instagram || '';
      if (savedIgUrl) {
        const h = extractHandle(savedIgUrl);
        if (h) {
          setHandle(h);
          setIgUrl(`https://www.instagram.com/${h}/`);
        }
      }

      if (!enabled) { setLoading(false); return; }

      try {
        const liveRes = await fetch(`${base}/instagram/feed`);
        const liveJson = await liveRes.json();
        if (cancelled) return;
        const livePosts: any[] = Array.isArray(liveJson.data) ? liveJson.data : [];
        if (livePosts.length > 0) { setPosts(livePosts.map(normalisePost)); setLoading(false); return; }
      } catch { /* fall through */ }

      try {
        const manualRes = await fetch(`${base}/instagram-posts`);
        const manualJson = await manualRes.json();
        if (cancelled) return;
        const manualPosts: any[] = Array.isArray(manualJson.data) ? manualJson.data : Array.isArray(manualJson) ? manualJson : [];
        if (manualPosts.length > 0) { setPosts(manualPosts.map(normalisePost)); setLoading(false); return; }
      } catch { /* fall through */ }

      if (!cancelled) { setPosts(FALLBACK); setLoading(false); }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  if (sectionEnabled === false) return null;

  return (
    <section
      className="w-full relative overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--surface-page)' }}
    >
      {/* Subtle decorative bone/paw background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232E1F14' fill-rule='evenodd'%3E%3Cellipse cx='20' cy='20' rx='4' ry='5'/%3E%3Cellipse cx='32' cy='20' rx='4' ry='5'/%3E%3Cellipse cx='16' cy='28' rx='3' ry='4'/%3E%3Cellipse cx='36' cy='28' rx='3' ry='4'/%3E%3Cpath d='M26 38c-6 0-10-5-10-8s4-7 10-7 10 4 10 7-4 8-10 8z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Top decorative border */}
      <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-gold-light) 30%, var(--color-gold) 50%, var(--color-gold-light) 70%, transparent 100%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">

        {/* ── Header ── */}
        <div
          ref={headerRef}
          className="text-center mb-12 md:mb-14"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Decorative top element */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 md:w-16" style={{ background: 'var(--color-gold-light)' }} />
            <PawIcon className="w-5 h-5 text-[#B8976A] dark:text-[#D4BC8E]" />
            <div className="h-px w-12 md:w-16" style={{ background: 'var(--color-gold-light)' }} />
          </div>

          {/* Subtitle */}
          <p
            className="text-xs md:text-sm tracking-[0.25em] uppercase mb-3"
            style={{
              color: 'var(--color-gold)',
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 500,
            }}
          >
            Join the Pack
          </p>

          {/* Main title */}
          <h2
            className="font-antique text-3xl sm:text-4xl md:text-5xl mb-5"
            style={{
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            Follow Us On Instagram
          </h2>

          {/* Handle link */}
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 group/handle transition-all duration-300"
          >
            {/* Instagram gradient icon */}
            <span
              className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-transform duration-300 group-hover/handle:scale-110"
              style={{
                background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
            >
              <Instagram className="w-5 h-5 text-white" />
            </span>
            <span
              className="text-base md:text-lg font-medium transition-colors duration-300"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              @{handle}
            </span>
          </a>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {posts.map((post, i) => (
              <PostCard key={post.id || post._id} post={post} index={i} />
            ))}
          </div>
        )}

        {/* ── View More Button ── */}
        {!loading && (
          <div
            className="text-center mt-12 md:mt-14"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            }}
          >
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn inline-flex items-center gap-3 font-medium text-sm md:text-base px-8 py-3.5 rounded-full transition-all duration-400 hover:shadow-lg"
              style={{
                background: 'var(--color-dark-brown)',
                color: 'var(--color-parchment)',
                fontFamily: 'var(--font-dm-sans)',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 8px rgba(46, 31, 20, 0.15)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-warm-brown)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(46, 31, 20, 0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-dark-brown)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(46, 31, 20, 0.15)';
              }}
            >
              <Instagram className="w-5 h-5 transition-transform duration-300 group-hover/btn:rotate-6" />
              View More on Instagram
              <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Bottom decorative border */}
      <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-gold-light) 30%, var(--color-gold) 50%, var(--color-gold-light) 70%, transparent 100%)' }} />
    </section>
  );
}
