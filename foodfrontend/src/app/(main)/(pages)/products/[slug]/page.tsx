'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Star, ShoppingCart, ChevronLeft, Loader2, Check, Repeat, HelpCircle } from 'lucide-react';
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

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedQtyIdx, setSelectedQtyIdx] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [purchaseOption, setPurchaseOption] = useState<'one-time' | 'repeat'>('one-time');
  const [selectedInterval, setSelectedInterval] = useState('');
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (params.slug) fetchProduct();
  }, [params.slug]);

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
      if (!response.ok) throw new Error('Product not found');
      const result = await response.json();
      if (result.success) {
        const p = result.data;
        setProduct(p);
        if (p.sizes?.length > 0) setSelectedSize(p.sizes[0].value);
        if (p.subscriptionSettings?.intervals?.length > 0) {
          setSelectedInterval(p.subscriptionSettings.intervals[0]);
        }
        if (p.bulkPricing?.length > 0) setSelectedQtyIdx(0);
      } else {
        throw new Error(result.message || 'Failed to load product');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Selected size object
  const selectedSizeObj = useMemo(() => {
    if (!product || !selectedSize) return null;
    return product.sizes?.find((s: any) => s.value === selectedSize) ?? null;
  }, [product, selectedSize]);

  // Effective unit price (from size if set, else product base price)
  const effectiveUnitPrice = useMemo(() => {
    if (selectedSizeObj?.price > 0) return selectedSizeObj.price as number;
    return product?.price ?? 0;
  }, [product, selectedSizeObj]);

  const effectiveOriginalPrice = useMemo(() => {
    if (selectedSizeObj?.originalPrice > 0) return selectedSizeObj.originalPrice as number;
    return product?.originalPrice ?? 0;
  }, [product, selectedSizeObj]);

  // Scale ratio to adjust bulk tier prices when a size has a custom price
  const priceRatio = useMemo(() => {
    if (selectedSizeObj?.price > 0 && product?.price > 0) {
      return effectiveUnitPrice / product.price;
    }
    return 1;
  }, [effectiveUnitPrice, product, selectedSizeObj]);

  // Bulk pricing tiers adjusted for selected size
  const adjustedBulkPricing = useMemo(() => {
    if (!product?.bulkPricing) return [];
    return product.bulkPricing.map((tier: any) => ({
      ...tier,
      price: tier.price * priceRatio,
      originalPrice: tier.originalPrice * priceRatio,
    }));
  }, [product, priceRatio]);

  const currentTier = useMemo(() => {
    if (selectedQtyIdx !== null && adjustedBulkPricing[selectedQtyIdx]) {
      return adjustedBulkPricing[selectedQtyIdx];
    }
    return null;
  }, [adjustedBulkPricing, selectedQtyIdx]);

  const subscriptionAvailable = product?.subscriptionSettings?.isEnabled &&
    product?.subscriptionSettings?.intervals?.length > 0;

  const subDiscountPct = (subscriptionAvailable && purchaseOption === 'repeat')
    ? (product?.subscriptionSettings?.discountPercentage ?? 0)
    : 0;

  // Unit price shown at top (with subscription discount)
  const displayUnitPrice = useMemo(() => {
    const base = currentTier ? currentTier.price : effectiveUnitPrice;
    return base * (1 - subDiscountPct / 100);
  }, [currentTier, effectiveUnitPrice, subDiscountPct]);

  const displayOriginalPrice = useMemo(() => {
    if (currentTier) return currentTier.originalPrice;
    return effectiveOriginalPrice;
  }, [currentTier, effectiveOriginalPrice]);

  const cartQty = currentTier ? (currentTier.quantity || 1) : 1;

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      setToast({ message: 'Please select a size first', type: 'error' });
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.gallery?.[0] || product.image,
      size: selectedSizeObj?.label || selectedSize || 'Default',
      quantity: cartQty,
      unitPrice: +displayUnitPrice.toFixed(2),
      originalPrice: +effectiveOriginalPrice.toFixed(2),
      isSubscription: purchaseOption === 'repeat',
      subscriptionInterval: purchaseOption === 'repeat' ? selectedInterval : undefined,
    });

    setToast({ message: `${product.name} added to cart!`, type: 'success' });
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3ea] dark:bg-[#1a1410] transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-amber-600 dark:text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">Loading product...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ───
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3ea] dark:bg-[#1a1410] transition-colors duration-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-4">
            {error || 'Product not found'}
          </h1>
          <Link href="/products" className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
            <ChevronLeft className="w-5 h-5" />
            All Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.gallery?.length > 0 ? product.gallery : [product.image];
  const hasSizes = product.sizes?.length > 0;
  const hasBulkPricing = product.bulkPricing?.length > 0;

  return (
    <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] pb-24 lg:pb-8 pt-28 py-8 transition-colors duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-28 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-semibold transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' && <Check className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href={categoryBackLinks[product.productType]?.href || '/products'}
          className="inline-flex items-center gap-2 mb-6 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {categoryBackLinks[product.productType]?.label || 'All Products'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ─── Left: Images ─── */}
          <div className="space-y-4">
            {/* Badge */}
            {product.badge && (
              <span className="inline-flex items-center bg-amber-100 dark:bg-[#2d221c] text-amber-700 dark:text-amber-400 text-sm font-semibold px-4 py-1.5 rounded-full border border-amber-200 dark:border-[#3a2c23]">
                {product.badge}
              </span>
            )}

            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-[#2d221c] border-2 border-amber-100 dark:border-[#3a2c23] shadow-md transition-colors">
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
              <div className="grid grid-cols-5 gap-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-200 dark:ring-amber-700'
                        : 'border-amber-100 dark:border-[#3a2c23] hover:border-amber-300 dark:hover:border-[#4a3828]'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${i + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Right: Product Info ─── */}
          <div className="space-y-5">
            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
              {product.name}
            </h1>

            {/* Rating + Category */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-[#3a2c23] dark:text-[#3a2c23]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
                ({product.reviews} reviews)
              </span>
              <span className="inline-block px-2.5 py-0.5 bg-amber-100 dark:bg-[#2d221c] text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-200 dark:border-[#3a2c23]">
                {product.category}
              </span>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold text-amber-700 dark:text-amber-400">
                £{displayUnitPrice.toFixed(2)}
              </span>
              {displayOriginalPrice > displayUnitPrice && (
                <span className="text-2xl text-gray-400 dark:text-[#c8b6a6]/50 line-through">
                  £{displayOriginalPrice.toFixed(2)}
                </span>
              )}
              {subDiscountPct > 0 && (
                <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                  {subDiscountPct}% SUBSCRIPTION SAVINGS
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[#5b4636] dark:text-[#c8b6a6] text-sm leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="p-4 bg-white dark:bg-[#241b16] rounded-xl border border-amber-100 dark:border-[#3a2c23] transition-colors">
                <ul className="space-y-1.5">
                  {product.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#5b4636] dark:text-[#c8b6a6]">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ─── Size Selection ─── */}
            {hasSizes && (
              <div>
                <p className="text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2 uppercase tracking-wide">
                  Size:{' '}
                  <span className="text-amber-600 dark:text-amber-400 normal-case">
                    {selectedSizeObj?.label || selectedSize}
                  </span>
                </p>
                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full appearance-none p-3.5 pr-10 bg-gray-100 dark:bg-[#2d221c] text-[#2f1e14] dark:text-[#f5e9dc] border border-gray-300 dark:border-[#3a2c23] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition-colors"
                  >
                    {product.sizes.map((size: any) => (
                      <option key={size.value} value={size.value}>
                        {size.label}{size.price > 0 ? ` — £${Number(size.price).toFixed(2)}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Bulk Pricing / Mix & Match ─── */}
            {hasBulkPricing && (
              <div>
                <p className="text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-1">
                  Mix & Match products & SAVE!
                </p>
                <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] mb-3">Choose quantity:</p>
                <div className="space-y-2">
                  {adjustedBulkPricing.map((tier: any, idx: number) => {
                    const tierTotal = tier.price * (tier.quantity || 1);
                    const tierOrigTotal = tier.originalPrice * (tier.quantity || 1);
                    const isSelected = selectedQtyIdx === idx;
                    return (
                      <label
                        key={idx}
                        className={`flex items-center justify-between p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-[#2d221c]'
                            : 'border-gray-200 dark:border-[#3a2c23] bg-white dark:bg-[#1e1610] hover:border-amber-300 dark:hover:border-[#4a3828]'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <input
                            type="radio"
                            name="quantity"
                            checked={isSelected}
                            onChange={() => setSelectedQtyIdx(idx)}
                            className="w-4 h-4 accent-amber-600"
                          />
                          <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm">
                            Buy {tier.quantity}:
                          </span>
                          <span className="font-bold text-amber-700 dark:text-amber-400">
                            £{tierTotal.toFixed(2)}
                          </span>
                          <span className="text-gray-400 dark:text-[#c8b6a6]/50 line-through text-sm">
                            £{tierOrigTotal.toFixed(2)}
                          </span>
                        </div>
                        {tier.discount > 0 && (
                          <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-md flex-shrink-0">
                            SAVE {tier.discount}%
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Purchase Options ─── */}
            <div>
              <p className="text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-3">
                Purchase options
              </p>
              <div className="space-y-2">
                {/* One-time */}
                <label className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                  purchaseOption === 'one-time'
                    ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-[#2d221c]'
                    : 'border-gray-200 dark:border-[#3a2c23] bg-white dark:bg-[#1e1610] hover:border-amber-300 dark:hover:border-[#4a3828]'
                }`}>
                  <input
                    type="radio"
                    name="purchase"
                    value="one-time"
                    checked={purchaseOption === 'one-time'}
                    onChange={() => setPurchaseOption('one-time')}
                    className="w-4 h-4 accent-amber-600"
                  />
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm">
                    One-time purchase
                  </span>
                </label>

                {/* Repeat Deliveries */}
                <label className={`flex items-center justify-between p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                  purchaseOption === 'repeat'
                    ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-[#2d221c]'
                    : 'border-gray-200 dark:border-[#3a2c23] bg-white dark:bg-[#1e1610] hover:border-amber-300 dark:hover:border-[#4a3828]'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="purchase"
                      value="repeat"
                      checked={purchaseOption === 'repeat'}
                      onChange={() => setPurchaseOption('repeat')}
                      className="w-4 h-4 accent-amber-600"
                    />
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm">
                        Repeat deliveries
                        {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 && (
                          <span className="ml-1 text-green-600 dark:text-green-400">
                            (SAVE {product.subscriptionSettings.discountPercentage}%)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 && (
                    <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-md flex-shrink-0">
                      SAVE {product.subscriptionSettings.discountPercentage}%
                    </span>
                  )}
                </label>
              </div>

              {/* Deliver every — dropdown */}
              {purchaseOption === 'repeat' && subscriptionAvailable && (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#5b4636] dark:text-[#c8b6a6] whitespace-nowrap">
                    Deliver every
                  </span>
                  <div className="relative flex-1">
                    <select
                      value={selectedInterval}
                      onChange={(e) => setSelectedInterval(e.target.value)}
                      className="w-full appearance-none p-3 pr-8 bg-gray-100 dark:bg-[#2d221c] text-[#2f1e14] dark:text-[#f5e9dc] border border-gray-300 dark:border-[#3a2c23] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition-colors"
                    >
                      {product.subscriptionSettings.intervals.map((interval: string) => (
                        <option key={interval} value={interval}>{interval}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* How Repeat Deliveries Work? */}
              {purchaseOption === 'repeat' && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
                    className="text-amber-600 dark:text-amber-400 text-sm font-medium hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    How Repeat Deliveries Work?
                  </button>

                  {showDeliveryInfo && (
                    <div className="mt-2 p-4 bg-white dark:bg-[#241b16] rounded-xl border border-amber-200 dark:border-[#3a2c23] text-sm text-[#5b4636] dark:text-[#c8b6a6] space-y-2 transition-colors">
                      <p className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">How it works:</p>
                      <ul className="space-y-1.5 list-disc list-inside">
                        <li>Choose your delivery frequency above</li>
                        <li>We automatically send your order on schedule</li>
                        {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 && (
                          <li>
                            Save <strong>{product.subscriptionSettings.discountPercentage}%</strong> on every subscription delivery
                          </li>
                        )}
                        <li>Cancel, skip, or modify anytime before your next delivery</li>
                        <li>No long-term commitment required</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── Desktop Add to Cart ─── */}
            <div className="hidden lg:block">
              <button
                onClick={handleAddToCart}
                disabled={hasSizes && !selectedSize}
                className="w-full bg-amber-700 hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                {hasSizes && !selectedSize ? 'Select a size' : 'ADD TO CART'}
              </button>
            </div>

            {/* Payment badges */}
            <div className="pt-4 border-t border-amber-100 dark:border-[#3a2c23]">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-xs font-medium text-[#7A5C4F]/60 dark:text-[#c8b6a6]/60">
                  Apple Pay · Google Pay · PayPal · Visa · Mastercard
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product._id} />

      {/* ─── Mobile Sticky Add to Cart ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#241b16] border-t border-amber-200 dark:border-[#3a2c23] p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-50 lg:hidden transition-colors duration-300">
        <button
          onClick={handleAddToCart}
          disabled={hasSizes && !selectedSize}
          className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-base shadow-lg"
        >
          <ShoppingCart className="w-5 h-5" />
          {hasSizes && !selectedSize ? 'Select a size' : 'ADD TO CART'}
        </button>
      </div>
    </div>
  );
}
