'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category: string;
  description: string;
}

const GalleryPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  const categories: string[] = [
    'ALL',
    'GALLERY',
    'FLAXSEED',
    'COCONUT',
    'PEANUT',
    'HONEY',
    'PUMPKIN',
    'STRAWBERRY',
    'BLUEBERRY',
    'MINT',
    'TURMERIC'
  ];

  const galleryItems: GalleryItem[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
      title: 'Himshree Dog Chew',
      category: 'GALLERY',
      description: 'All Natural'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784794?w=800&q=80',
      title: 'Honey Flavored Chew',
      category: 'HONEY',
      description: 'Sweet & Natural'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&q=80',
      title: 'Natural Dog Chews',
      category: 'GALLERY',
      description: 'Premium Quality'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800&q=80',
      title: 'Pumpkin Chew Sticks',
      category: 'PUMPKIN',
      description: 'Healthy & Tasty'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80',
      title: 'Strawberry Treats',
      category: 'STRAWBERRY',
      description: 'Fruity Delight'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80',
      title: 'Blueberry Chews',
      category: 'BLUEBERRY',
      description: 'Antioxidant Rich'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1599909533730-f9d7c80f97f7?w=800&q=80',
      title: 'Coconut Treats',
      category: 'COCONUT',
      description: 'Tropical Flavor'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1582900329477-0c471cd93669?w=800&q=80',
      title: 'Peanut Butter Chews',
      category: 'PEANUT',
      description: 'Classic Favorite'
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&q=80',
      title: 'Mint Fresh Treats',
      category: 'MINT',
      description: 'Breath Freshener'
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80',
      title: 'Turmeric Wellness',
      category: 'TURMERIC',
      description: 'Anti-inflammatory'
    },
    {
      id: 11,
      image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&q=80',
      title: 'Flaxseed Crunch',
      category: 'FLAXSEED',
      description: 'Omega-3 Rich'
    },
    {
      id: 12,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
      title: 'Mixed Variety Pack',
      category: 'GALLERY',
      description: 'All Flavors'
    }
  ];

  const filteredItems = galleryItems.filter((item) => {
    const matchesFilter = activeFilter === 'ALL' || item.category === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] bg-black overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&q=80"
            alt="Dog with Churpi"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            GALLERY
          </h1>
          <p className="text-xl md:text-2xl text-white/90 italic">
            Home / <span className="text-orange-400">GALLERY</span>
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-orange-400 mb-4">Ingredients:</h3>
            <ul className="text-white/90 text-lg md:text-xl space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full" />
                Milk
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full" />
                Salt & Lime Juice
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6 max-w-md mx-auto md:mx-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-2.5 font-semibold text-sm tracking-wide rounded-lg transition-all duration-300 ${
                  activeFilter === category
                    ? 'bg-cyan-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item: GalleryItem, index: number) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => setLightboxImage(item)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="inline-block px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full mb-3">
                      {item.category}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">No items found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search term</p>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-cyan-400 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-10 h-10" />
          </button>

          <div className="max-w-5xl w-full">
            <img
              src={lightboxImage.image}
              alt={lightboxImage.title}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <div className="text-center mt-6">
              <h3 className="text-3xl font-bold text-white mb-2">{lightboxImage.title}</h3>
              <p className="text-white/70 text-lg">{lightboxImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
