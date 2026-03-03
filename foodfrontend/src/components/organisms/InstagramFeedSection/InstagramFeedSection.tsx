'use client';
import React, { useEffect, useState } from 'react';
import { Play, Instagram, Image as ImageIcon, Film, Grid3X3 } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */
interface Post {
  // Live Graph API fields
  id?: string;
  permalink?: string;
  mediaType?: string;
  isVideo?: boolean;
  isCarousel?: boolean;
  timestamp?: string;

  // Manual-post fields (existing system)
  _id?: string;
  instagramLink?: string;
  type?: 'photo' | 'reel' | 'video';

  // Shared
  image: string;
  caption: string;
}

/* ─── Fallback (static) posts ───────────────────────────────────────── */
const FALLBACK: Post[] = [
  { id: 'f1', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', caption: 'Happy dog enjoying a Highland Yak Chew! 🐾', permalink: 'https://instagram.com/highlanddogchew', isVideo: true },
  { id: 'f2', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80', caption: 'Long-lasting yak milk chews — your dog will love them!', permalink: 'https://instagram.com/highlanddogchew', isVideo: true },
  { id: 'f3', image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&q=80', caption: 'Natural & grain-free. Made from authentic mountain recipes.', permalink: 'https://instagram.com/highlanddogchew', isVideo: false },
  { id: 'f4', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80', caption: 'Your dog deserves the best — try Highland Yakchew! 🦴', permalink: 'https://instagram.com/highlanddogchew', isVideo: false },
  { id: 'f5', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80', caption: 'Unboxing day! Himalayan Puff Treats have arrived 🎁', permalink: 'https://instagram.com/highlanddogchew', isVideo: true },
  { id: 'f6', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&q=80', caption: 'Dental health + happy dog = Highland Yakchew ✅', permalink: 'https://instagram.com/highlanddogchew', isVideo: false },
  { id: 'f7', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80', caption: 'Puppy approved 🐕 Yak Milk Chews for every breed!', permalink: 'https://instagram.com/highlanddogchew', isVideo: true },
  { id: 'f8', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&q=80', caption: '100% natural. No grain. No gluten. Just goodness.', permalink: 'https://instagram.com/highlanddogchew', isVideo: false },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */
const API = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

/** Extract @handle from a full Instagram URL */
function extractHandle(url: string): string {
  if (!url) return '';
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts[0] ?? '';
  } catch {
    return url.startsWith('@') ? url.slice(1) : url;
  }
}

/** Normalise a post coming from either the Graph API or the manual-post system. */
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

/* ─── Skeleton ───────────────────────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-lg bg-[#e2d9cc] dark:bg-[#2a1f18] animate-pulse"
        />
      ))}
    </div>
  );
}

/* ─── Post card ──────────────────────────────────────────────────────── */
function PostCard({ post }: { post: Post }) {
  const link = post.permalink || '#';

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square overflow-hidden rounded-lg bg-[#e8dfd1] dark:bg-[#241b16] hover:shadow-2xl transition-all duration-300"
    >
      {/* Thumbnail */}
      <img
        src={post.image}
        alt={post.caption}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Play overlay for videos/reels */}
      {post.isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Play className="w-8 h-8 text-gray-800 fill-gray-800" />
          </div>
        </div>
      )}

      {/* Type badge */}
      {post.isVideo && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
          <Film className="w-2.5 h-2.5" />
          REEL
        </div>
      )}
      {post.isCarousel && !post.isVideo && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
          <Grid3X3 className="w-2.5 h-2.5" />
          ALBUM
        </div>
      )}
      {!post.isVideo && !post.isCarousel && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ImageIcon className="w-2.5 h-2.5" />
          PHOTO
        </div>
      )}

      {/* Caption overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium line-clamp-3">{post.caption}</p>
        </div>
      </div>

      {/* Instagram icon on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Instagram className="w-6 h-6 text-white drop-shadow-lg" />
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
  const [sectionEnabled, setEnabled] = useState<boolean | null>(null); // null = still checking

  useEffect(() => {
    let cancelled = false;
    const base = API();

    const run = async () => {
      // ── 1. Fetch settings (isEnabled + handle from contact info) ──
      const [settingsRes, contactRes] = await Promise.allSettled([
        fetch(`${base}/instagram/settings`).then(r => r.json()).catch(() => null),
        fetch(`${base}/info`).then(r => r.json()).catch(() => null),
      ]);

      if (cancelled) return;

      const settings = settingsRes.status === 'fulfilled' ? settingsRes.value?.data : null;
      const contact  = contactRes.status  === 'fulfilled' ? contactRes.value?.data  : null;

      // Resolve isEnabled (default true if API unavailable)
      const enabled = settings?.isEnabled !== false;
      setEnabled(enabled);

      // Resolve handle from saved Instagram URL in contact info
      const savedIgUrl: string = contact?.socialLinks?.instagram || '';
      if (savedIgUrl) {
        const h = extractHandle(savedIgUrl);
        if (h) {
          setHandle(h);
          setIgUrl(`https://www.instagram.com/${h}/`);
        }
      }

      if (!enabled) {
        setLoading(false);
        return;
      }

      // ── 2. Try live Graph API feed ──
      try {
        const liveRes = await fetch(`${base}/instagram/feed`);
        const liveJson = await liveRes.json();
        if (cancelled) return;

        const livePosts: any[] = Array.isArray(liveJson.data) ? liveJson.data : [];
        if (livePosts.length > 0) {
          setPosts(livePosts.map(normalisePost));
          setLoading(false);
          return;
        }
      } catch {
        // Graph API failed — fall through to manual posts
      }

      // ── 3. Fall back to manually-uploaded posts ──
      try {
        const manualRes = await fetch(`${base}/instagram-posts`);
        const manualJson = await manualRes.json();
        if (cancelled) return;

        const manualPosts: any[] = Array.isArray(manualJson.data)
          ? manualJson.data
          : Array.isArray(manualJson) ? manualJson : [];

        if (manualPosts.length > 0) {
          setPosts(manualPosts.map(normalisePost));
          setLoading(false);
          return;
        }
      } catch {
        // fall through to static fallback
      }

      // ── 4. Static fallback ──
      if (!cancelled) {
        setPosts(FALLBACK);
        setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  // Section is explicitly disabled by admin
  if (sectionEnabled === false) return null;

  return (
    <section className="w-full py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-antique text-4xl md:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4 tracking-[-0.01em]">
            Follow Us On Instagram
          </h2>
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            <Instagram className="w-6 h-6" />
            @{handle}
          </a>
        </div>

        {/* Grid — skeleton while loading, posts after */}
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id || post._id} post={post} />
            ))}
          </div>
        )}

        {/* View More button */}
        {!loading && (
          <div className="text-center mt-12">
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Instagram className="w-6 h-6" />
              View More on Instagram
            </a>
          </div>
        )}

        {/* Scroll up */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center justify-center w-12 h-12 bg-white dark:bg-[#241b16] hover:bg-[#f8f3ea] dark:hover:bg-[#2a1f18] text-[#2E1F14] dark:text-[#f5e9dc] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            aria-label="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
