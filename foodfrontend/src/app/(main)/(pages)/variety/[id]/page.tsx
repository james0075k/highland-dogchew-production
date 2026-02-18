'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, ShoppingCart } from 'lucide-react';

type Product = {
  _id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  description: string;
  badge?: string;
  slug: string;
};

type Variety = {
  _id: string;
  name: string;
  category: string;
  description: string;
  image: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const VarietyDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const varietyId = params?.id as string;

  const [variety, setVariety] = useState<Variety | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (varietyId) {
      fetchVarietyWithProducts();
    }
  }, [varietyId]);

  const fetchVarietyWithProducts = async () => {
    try {
      setLoading(true);
      // Fetch variety with its products
      const response = await fetch(`${API_BASE}/variety/${varietyId}/products`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setVariety({
          _id: data._id,
          name: data.name,
          category: data.category,
          description: data.description,
          image: data.image,
        });
        setProducts(data.products || []);
      } else {
        setError('Failed to load variety');
      }
    } catch (err) {
      console.error('Error fetching variety:', err);
      setError('An error occurred while loading');
    } finally {
      setLoading(false);
    }
  };

  const getColorScheme = (category: string) => {
    const colors: Record<string, { from: string; to: string; accent: string }> = {
      Blueberry: { from: 'from-blue-600', to: 'to-blue-800', accent: 'bg-blue-500' },
      Strawberry: { from: 'from-red-600', to: 'to-red-800', accent: 'bg-red-500' },
      Pumpkin: { from: 'from-orange-600', to: 'to-orange-800', accent: 'bg-orange-500' },
      Honey: { from: 'from-yellow-600', to: 'to-yellow-800', accent: 'bg-yellow-500' },
    };
    return colors[category] || { from: 'from-gray-600', to: 'to-gray-800', accent: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading variety...</p>
        </div>
      </div>
    );
  }

  if (error || !variety) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Variety not found'}</p>
          <button
            onClick={() => router.push('/variety')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to Varieties
          </button>
        </div>
      </div>
    );
  }

  const colors = getColorScheme(variety.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-br ${colors.from} ${colors.to} text-white py-16 md:py-24`}>
        <div className="absolute inset-0 opacity-10">
          <img
            src={variety.image}
            alt={variety.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {variety.name}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6">
                {variety.description}
              </p>
              <div className="flex items-center gap-4">
                <span className={`${colors.accent} px-4 py-2 rounded-full text-sm font-semibold`}>
                  {variety.category}
                </span>
                <span className="text-white/80">
                  {products.length} {products.length === 1 ? 'Product' : 'Products'}
                </span>
              </div>
            </div>

            <div className="hidden md:block">
              <img
                src={variety.image}
                alt={variety.name}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Available Products
          </h2>
          <p className="text-gray-600">
            Explore our {variety.category.toLowerCase()} flavored yak milk chews
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Products Yet
            </h3>
            <p className="text-gray-600">
              Products for this variety are coming soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => router.push(`/products/${product.slug}`)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
              >
                <div className="relative">
                  {product.badge && (
                    <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {product.badge}
                    </div>
                  )}

                  <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm md:text-base text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-lg md:text-xl font-bold text-blue-600">
                      £{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      £{product.originalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VarietyDetailPage;