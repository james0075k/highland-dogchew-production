'use client'
import React from 'react';
import { Play, Instagram } from 'lucide-react';

const InstagramFeedSection = () => {
  const posts = [
    {
      id: 1,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      caption: 'Happy dog enjoying Himalayan chew!',
      link: 'https://instagram.com/p/example1'
    },
    {
      id: 2,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
      caption: 'Mum bought me a Himalayan yak chew. I love it.',
      link: 'https://instagram.com/p/example2'
    },
    {
      id: 3,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&q=80',
      caption: 'Black lab loving his new chew',
      link: 'https://instagram.com/p/example3'
    },
    {
      id: 4,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
      caption: 'Dog playing with chew on grass',
      link: 'https://instagram.com/p/example4'
    },
    {
      id: 5,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80',
      caption: 'Unboxing Highland Churpi products',
      link: 'https://instagram.com/p/example5'
    },
    {
      id: 6,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&q=80',
      caption: 'This isn\'t a delivery mistake!',
      link: 'https://instagram.com/p/example6'
    },
    {
      id: 7,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
      caption: 'Cute puppy with Himalayan chew',
      link: 'https://instagram.com/p/example7'
    },
    {
      id: 8,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&q=80',
      caption: 'Natural dog chew products',
      link: 'https://instagram.com/p/example8'
    },
    {
      id: 9,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
      caption: 'Dog enjoying his treat',
      link: 'https://instagram.com/p/example9'
    },
    {
      id: 10,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800&q=80',
      caption: 'French Bulldog with Highland Churpi',
      link: 'https://instagram.com/p/example10'
    },
    {
      id: 11,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&q=80',
      caption: 'Happy customer review',
      link: 'https://instagram.com/p/example11'
    },
    {
      id: 12,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
      caption: 'Highland Churpi natural chews',
      link: 'https://instagram.com/p/example12'
    }
  ];

  return (
    <section className="w-full  py-4">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-antique text-4xl md:text-5xl font-bold text-[#2E1F14] mb-4 tracking-[-0.01em]">
            Follow Us On Instagram
          </h2>
          <a
            href="https://instagram.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg text-gray-600 hover:text-pink-600 transition-colors"
          >
            <Instagram className="w-6 h-6" />
            @highlandchurpi
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              {/* Thumbnail */}
              <img
                src={post.thumbnail}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-gray-800 fill-gray-800" />
                </div>
              </div>

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
            href="https://instagram.com/yourhandle"
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
            className="inline-flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 text-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
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