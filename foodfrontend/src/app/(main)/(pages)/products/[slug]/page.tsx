'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Star, ShoppingCart, ChevronLeft, Loader2, Check, Repeat, Tag } from 'lucide-react';
import ProductReviews from '@/components/organisms/ProductReviews/ProductReviews';
import { useCart } from '@/context/CartContext';

const categoryBackLinks: Record<string, { href: string; label: string }> = {
  'yak-milk': { href: '/products/yak-chews', label: 'Yak Milk Chews' },
  'puff-treat': { href: '/products/puff-treats', label: 'Puff Treats' },
  'highland-mix': { href: '/products/highland-mix', label: 'Highland Mix Chews' },
};

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [purchaseOption, setPurchaseOption] = useState('one-time');
  const [selectedInterval, setSelectedInterval] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/slug/${params.slug}`);

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const result = await response.json();

      if (result.success) {
        setProduct(result.data);
        // Set initial values
        if (result.data.sizes && result.data.sizes.length > 0) {
          setSelectedSize(result.data.sizes[0].value);
        }
        // Set default subscription interval if available
        const intervals = result.data.subscriptionSettings?.intervals;
        if (intervals && intervals.length > 0) {
          setSelectedInterval(intervals[0]);
        }
      } else {
        throw new Error(result.message || 'Failed to load product');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Price calculation
  const priceBreakdown = useMemo(() => {
    if (!product) return null;

    const selectedPricing = product.bulkPricing?.[selectedQuantity] || {
      price: product.price,
      originalPrice: product.originalPrice,
      discount: 0,
      quantity: 1,
    };

    const qty = selectedPricing.quantity || 1;
    const baseTotal = selectedPricing.price * qty;

    // Bundle discount (already baked into bulkPricing.price vs originalPrice)
    const bundleDiscount = selectedQuantity > 0 && product.bulkPricing?.[selectedQuantity]
      ? (selectedPricing.originalPrice * qty) - baseTotal
      : 0;

    // Subscription discount from backend
    const subSettings = product.subscriptionSettings;
    const subEnabled = subSettings?.isEnabled && purchaseOption === 'repeat';
    const subDiscountPct = subEnabled ? (subSettings.discountPercentage || 0) : 0;
    const subscriptionDiscount = baseTotal * subDiscountPct / 100;

    const afterDiscounts = baseTotal - subscriptionDiscount;

    // Tax and delivery from backend pricingSettings
    const taxPct = product.pricingSettings?.taxPercentage || 0;
    const deliveryCharge = product.pricingSettings?.deliveryCharge || 0;
    const taxAmount = afterDiscounts * taxPct / 100;

    const finalTotal = afterDiscounts + taxAmount + deliveryCharge;

    return {
      baseTotal,
      qty,
      bundleDiscount,
      subscriptionDiscount,
      subDiscountPct,
      taxPct,
      taxAmount,
      deliveryCharge,
      finalTotal,
      unitPrice: selectedPricing.price,
      originalPrice: selectedPricing.originalPrice,
      bulkDiscount: selectedPricing.discount || 0,
    };
  }, [product, selectedQuantity, purchaseOption]);

  const handleAddToCart = () => {
    if (!product || !priceBreakdown) return;

    // Validate size selection
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setToast({ message: 'Please select a size first', type: 'error' });
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.gallery?.[0] || product.image,
      size: selectedSize || 'Default',
      quantity: priceBreakdown.qty,
      unitPrice: priceBreakdown.unitPrice,
      originalPrice: priceBreakdown.originalPrice,
    });

    setToast({ message: `${product.name} added to cart!`, type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product not found'}
          </h1>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            All Products
          </Link>
        </div>
      </div>
    );
  }

  // Use gallery images if available, otherwise use main image
  const images = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image];

  const subscriptionAvailable = product.subscriptionSettings?.isEnabled &&
    product.subscriptionSettings?.intervals?.length > 0;

  const hasSizes = product.sizes && product.sizes.length > 0;
  const canAddToCart = !hasSizes || !!selectedSize;

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8 pt-28 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-28 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-semibold transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' && <Check className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Link
          href={categoryBackLinks[product.productType]?.href || '/products'}
          className="inline-flex items-center gap-2 mb-6 text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {categoryBackLinks[product.productType]?.label || 'All Products'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Badge */}
            {product.badge && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-semibold px-4 py-2 rounded-full border border-orange-200">
                  {product.badge}
                </span>
              </div>
            )}

            {/* Description Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-semibold px-4 py-2 rounded-full border border-orange-200">
                {product.description}
              </span>
            </div>

            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4 border-2 border-gray-100">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-3 transition-all ${
                      selectedImage === index
                        ? 'border-orange-500 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Category */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
                {product.category}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-900 font-bold">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-orange-500">
                  £{priceBreakdown ? priceBreakdown.finalTotal.toFixed(2) : product.price.toFixed(2)}
                </span>
                {priceBreakdown && priceBreakdown.originalPrice > priceBreakdown.unitPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    £{(priceBreakdown.originalPrice * priceBreakdown.qty).toFixed(2)}
                  </span>
                )}
              </div>
              {purchaseOption === 'repeat' && priceBreakdown && priceBreakdown.subDiscountPct > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  <Tag className="w-3.5 h-3.5" />
                  {priceBreakdown.subDiscountPct}% subscription discount applied
                </div>
              )}
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-orange-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size Selection */}
            {hasSizes && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Choose Size: <span className="text-orange-500">{selectedSize}</span>
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full p-4 text-base border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                >
                  {product.sizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Bulk Pricing */}
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-3">
                  Mix & Match products & SAVE!
                </p>
                <p className="text-sm text-gray-600 mb-3">Choose quantity:</p>
                <div className="space-y-3">
                  {product.bulkPricing.map((pricing, index) => (
                    <label
                      key={index}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedQuantity === index
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="quantity"
                          checked={selectedQuantity === index}
                          onChange={() => setSelectedQuantity(index)}
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                        />
                        <div>
                          <span className="font-bold text-gray-900 text-lg">
                            Buy {pricing.quantity}: £{pricing.price.toFixed(2)}
                          </span>
                          <span className="text-gray-400 line-through ml-3 text-base">
                            £{pricing.originalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {pricing.discount > 0 && (
                        <span className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                          SAVE {pricing.discount}%
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Options */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-900 mb-3">Purchase options</p>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  purchaseOption === 'one-time' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="purchase"
                    value="one-time"
                    checked={purchaseOption === 'one-time'}
                    onChange={(e) => setPurchaseOption(e.target.value)}
                    className="w-5 h-5 text-orange-500"
                  />
                  <span className="font-semibold text-gray-900">One-time purchase</span>
                </label>

                {subscriptionAvailable && (
                  <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    purchaseOption === 'repeat' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="purchase"
                        value="repeat"
                        checked={purchaseOption === 'repeat'}
                        onChange={(e) => setPurchaseOption(e.target.value)}
                        className="w-5 h-5 text-orange-500"
                      />
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-gray-900">
                          Repeat deliveries
                        </span>
                      </div>
                    </div>
                    {product.subscriptionSettings.discountPercentage > 0 && (
                      <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        SAVE {product.subscriptionSettings.discountPercentage}%
                      </span>
                    )}
                  </label>
                )}

                {!subscriptionAvailable && (
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    purchaseOption === 'repeat' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="purchase"
                      value="repeat"
                      checked={purchaseOption === 'repeat'}
                      onChange={(e) => setPurchaseOption(e.target.value)}
                      className="w-5 h-5 text-orange-500"
                    />
                    <span className="font-semibold text-gray-900">Repeat deliveries</span>
                  </label>
                )}
              </div>

              {/* Subscription Interval Selector */}
              {purchaseOption === 'repeat' && subscriptionAvailable && (
                <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Delivery frequency:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.subscriptionSettings.intervals.map((interval) => (
                      <button
                        key={interval}
                        type="button"
                        onClick={() => setSelectedInterval(interval)}
                        className={`py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all ${
                          selectedInterval === interval
                            ? 'border-orange-500 bg-white text-orange-600'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {purchaseOption === 'repeat' && !subscriptionAvailable && (
                <p className="mt-3 text-sm text-gray-600">
                  <button className="text-orange-500 hover:text-orange-600 font-medium underline">
                    How Repeat Deliveries Work?
                  </button>
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            {priceBreakdown && (
              <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({priceBreakdown.qty} x £{priceBreakdown.unitPrice.toFixed(2)})</span>
                    <span>£{priceBreakdown.baseTotal.toFixed(2)}</span>
                  </div>

                  {priceBreakdown.bundleDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Bundle discount ({priceBreakdown.bulkDiscount}%)</span>
                      <span>-£{priceBreakdown.bundleDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.subscriptionDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Subscription discount ({priceBreakdown.subDiscountPct}%)</span>
                      <span>-£{priceBreakdown.subscriptionDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.taxPct > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tax ({priceBreakdown.taxPct}%)</span>
                      <span>£{priceBreakdown.taxAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.deliveryCharge > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery</span>
                      <span>£{priceBreakdown.deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-300">
                    <span>Total</span>
                    <span>£{priceBreakdown.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Add to Cart Button */}
            <div className="hidden lg:block">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ShoppingCart className="w-6 h-6" />
                {canAddToCart
                  ? `Add to Cart – £${priceBreakdown?.finalTotal.toFixed(2) || product.price.toFixed(2)}`
                  : 'Select a size'
                }
              </button>
            </div>

            {/* Payment Methods */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-center gap-4 grayscale opacity-60">
                <span className="font-semibold text-gray-600">Visa | Mastercard | Amex | Apple Pay | Google Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProductReviews productId={product._id} />

      {/* Sticky Mobile Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50 lg:hidden">
        <button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-5 h-5" />
          {canAddToCart
            ? `Add to Cart – £${priceBreakdown?.finalTotal.toFixed(2) || product.price.toFixed(2)}`
            : 'Select a size'
          }
        </button>
      </div>
    </div>
  );
}
