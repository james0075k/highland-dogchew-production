'use client';
import React, { useEffect, useState } from 'react';
import { Play, Instagram, Image, Film } from 'lucide-react';

interface InstagramPost {
  _id: string;
  image: string;
  caption: string;
  instagramLink: string;
  type: 'photo' | 'reel' | 'video';
}

// Fallback posts shown while loading or if API is empty
const FALLBACK: InstagramPost[] = [
  { _id: 'p1', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', caption: 'Happy dog enjoying a Highland Yak Chew! 🐾', instagramLink: 'https://instagram.com/highlanddogchew', type: 'reel' },
  { _id: 'p2', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80', caption: 'Long-lasting yak milk chews — your dog will love them!', instagramLink: 'https://instagram.com/highlanddogchew', type: 'reel' },
  { _id: 'p3', image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&q=80', caption: 'Natural & grain-free. Made from authentic mountain recipes.', instagramLink: 'https://instagram.com/highlanddogchew', type: 'reel' },
  { _id: 'p4', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80', caption: 'Your dog deserves the best — try Highland Dogchew! 🦴', instagramLink: 'https://instagram.com/highlanddogchew', type: 'photo' },
  { _id: 'p5', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80', caption: 'Unboxing day! Himalayan Puff Treats have arrived 🎁', instagramLink: 'https://instagram.com/highlanddogchew', type: 'reel' },
  { _id: 'p6', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&q=80', caption: 'Dental health + happy dog = Highland Dogchew ✅', instagramLink: 'https://instagram.com/highlanddogchew', type: 'photo' },
  { _id: 'p7', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80', caption: 'Puppy approved 🐕 Yak Milk Chews for every breed!', instagramLink: 'https://instagram.com/highlanddogchew', type: 'reel' },
  { _id: 'p8', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&q=80', caption: '100% natural. No grain. No gluten. Just goodness.', instagramLink: 'https://instagram.com/highlanddogchew', type: 'photo' },
];

function TypeIcon({ type }: { type: InstagramPost['type'] }) {
  if (type === 'reel' || type === 'video') {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Play className="w-8 h-8 text-gray-800 fill-gray-800" />
        </div>
      </div>
    );
  }
  return null;
}

const InstagramFeedSection = () => {
  const [posts, setPosts] = useState<InstagramPost[]>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
    fetch(`${API}/instagram-posts`)
      .then((r) => r.json())
      .then((data) => {
        const arr: InstagramPost[] = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];
        if (arr.length > 0) setPosts(arr);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const INSTAGRAM_HANDLE = 'highlanddogchew';
  const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

  return (
    <section className="w-full py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-antique text-4xl md:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4 tracking-[-0.01em]">
            Follow Us On Instagram
          </h2>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            <Instagram className="w-6 h-6" />
            @{INSTAGRAM_HANDLE}
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <a
              key={post._id}
              href={post.instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg bg-[#e8dfd1] dark:bg-[#241b16] hover:shadow-2xl transition-all duration-300"
            >
              {/* Thumbnail */}
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Play icon for reels/videos */}
              <TypeIcon type={post.type} />

              {/* Reel badge */}
              {(post.type === 'reel' || post.type === 'video') && (
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Film className="w-2.5 h-2.5" />
                  {post.type === 'reel' ? 'REEL' : 'VIDEO'}
                </div>
              )}
              {post.type === 'photo' && (
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Image className="w-2.5 h-2.5" />
                  PHOTO
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {post.caption}
                  </p>
                </div>
              </div>

              {/* Instagram Icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </a>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Instagram className="w-6 h-6" />
            View More on Instagram
          </a>
        </div>

        {/* Scroll Up Button */}
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
};

export default InstagramFeedSection;
