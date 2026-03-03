'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Star, ShoppingCart, Loader2, Check, ChevronDown, Minus, Plus } from 'lucide-react';
import ProductReviews from '@/components/organisms/ProductReviews/ProductReviews';
import SizeGuideSection from '@/components/organisms/SizeGuideSection/SizeGuideSection';
import { useCart } from '@/context/CartContext';

const categoryBackLinks: Record<string, { href: string; label: string }> = {
  'yak-milk': { href: '/products/yak-chews', label: 'Yak Milk Chews' },
  'puff-treat': { href: '/products/puff-treats', label: 'Puff Treats' },
  'highland-mix': { href: '/products/highland-mix', label: 'Highland Mix Chews' },
};

function PaymentIcon({ method }: { method: string }) {
  if (method === 'Apple Pay') {
    return (
      <span className="inline-flex items-center justify-center bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded-md tracking-tight">
         Pay
      </span>
    );
  }
  if (method === 'Google Pay') {
    return (
      <span className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-800 text-[11px] font-semibold px-3 py-1.5 rounded-md">
        G Pay
      </span>
    );
  }
  if (method === 'Visa') {
    return (
      <span className="inline-flex items-center justify-center bg-[#1a1f71] text-white text-[11px] font-bold italic px-3 py-1.5 rounded-md tracking-widest">
        VISA
      </span>
    );
  }
  if (method === 'Mastercard') {
    return (
      <span className="inline-flex items-center justify-center bg-white border border-gray-200 px-2 py-1.5 rounded-md">
        <svg viewBox="0 0 38 24" width="38" height="18">
          <circle cx="15" cy="12" r="9" fill="#eb001b" />
          <circle cx="23" cy="12" r="9" fill="#f79e1b" />
          <path d="M19 5.8a9 9 0 0 1 0 12.4A9 9 0 0 1 19 5.8z" fill="#ff5f00" />
        </svg>
      </span>
    );
  }
  if (method === 'Amex') {
    return (
      <span className="inline-flex items-center justify-center bg-[#007bc1] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md tracking-tight leading-tight text-center">
        AMERICAN<br />EXPRESS
      </span>
    );
  }
  if (method === 'Discover') {
    return (
      <span className="inline-flex items-center justify-center bg-white border border-gray-200 px-2 py-1.5 rounded-md">
        <svg viewBox="0 0 60 24" width="52" height="18">
          <rect width="60" height="24" rx="3" fill="#fff" />
          <text x="4" y="16" fontSize="10" fontWeight="700" fill="#231f20" fontFamily="Arial">DISCOVER</text>
          <circle cx="52" cy="12" r="8" fill="#f76f20" />
        </svg>
      </span>
    );
  }
  if (method === 'Link') {
    return (
      <span className="inline-flex items-center justify-center bg-[#00d66b] text-white text-[11px] font-bold px-3 py-1.5 rounded-md tracking-tight">
        Link
      </span>
    );
  }
  return null;
}

const PAYMENT_METHODS = ['Apple Pay', 'Google Pay', 'Visa', 'Mastercard', 'Amex', 'Discover', 'Link'];

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
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const addToCartBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (params.slug) fetchProduct();
  }, [params.slug]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Show sticky bar when the main Add to Cart button scrolls out of view
  // On mobile the button is display:none → always not intersecting → sticky bar always shows
  useEffect(() => {
    if (!addToCartBtnRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(addToCartBtnRef.current);
    return () => observer.disconnect();
  }, [product]);

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

  const selectedSizeObj = useMemo(() => {
    if (!product || !selectedSize) return null;
    return product.sizes?.find((s: any) => s.value === selectedSize) ?? null;
  }, [product, selectedSize]);

  const effectiveUnitPrice = useMemo(() => {
    if (selectedSizeObj?.price > 0) return selectedSizeObj.price as number;
    return product?.price ?? 0;
  }, [product, selectedSizeObj]);

  const effectiveOriginalPrice = useMemo(() => {
    if (selectedSizeObj?.originalPrice > 0) return selectedSizeObj.originalPrice as number;
    return product?.originalPrice ?? 0;
  }, [product, selectedSizeObj]);

  const priceRatio = useMemo(() => {
    if (selectedSizeObj?.price > 0 && product?.price > 0) {
      return effectiveUnitPrice / product.price;
    }
    return 1;
  }, [effectiveUnitPrice, product, selectedSizeObj]);

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

  const subscriptionAvailable =
    product?.subscriptionSettings?.isEnabled &&
    (product?.subscriptionSettings?.weeklyOptions?.length > 0 ||
     product?.subscriptionSettings?.monthlyOptions?.length > 0 ||
     product?.subscriptionSettings?.intervals?.length > 0);

  const subDiscountPct =
    subscriptionAvailable && purchaseOption === 'repeat'
      ? (product?.subscriptionSettings?.discountPercentage ?? 0)
      : 0;

  const displayUnitPrice = useMemo(() => {
    const base = currentTier ? currentTier.price : effectiveUnitPrice;
    return base * (1 - subDiscountPct / 100);
  }, [currentTier, effectiveUnitPrice, subDiscountPct]);

  const displayOriginalPrice = useMemo(() => {
    if (currentTier) return currentTier.originalPrice;
    return effectiveOriginalPrice;
  }, [currentTier, effectiveOriginalPrice]);

  const cartQty = currentTier ? currentTier.quantity || 1 : 1;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1a1410] transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-[#c8b6a6]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1a1410] transition-colors duration-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f5e9dc] mb-4">{error || 'Product not found'}</h1>
          <Link href="/products" className="text-amber-600 hover:text-amber-700 font-medium">
            ← All Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.gallery?.length > 0 ? product.gallery : [product.image];
  const hasSizes = product.sizes?.length > 0;
  const hasBulkPricing = product.bulkPricing?.length > 0;
  const hasNutritionFacts = product.nutritionFacts?.items?.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1410] pt-36 pb-24 lg:pb-12 transition-colors duration-300">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-28 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-xl text-white font-semibold transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'
          }`}
        >
          {toast.type === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 dark:text-[#7A5C4F] flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
          <span>/</span>
          <Link
            href={categoryBackLinks[product.productType]?.href || '/products'}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            {categoryBackLinks[product.productType]?.label || 'Products'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-[#f5e9dc] font-medium truncate">{product.name}</span>
        </nav>

        {/* ─── Main Two-Column Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-12">

          {/* ── Left: Images ── */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-[#241b16] border border-gray-100 dark:border-[#3a2c23]">
              {product.badge && (
                <span className="absolute top-3 left-3 z-10 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow">
                  {product.badge}
                </span>
              )}
              <Image
                src={images[selectedImage]}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-[88px] h-[88px] rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                      selectedImage === i
                        ? 'border-amber-500 shadow-sm'
                        : 'border-gray-200 dark:border-[#3a2c23] hover:border-gray-400 dark:hover:border-[#6a4c38]'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${i + 1}`}
                      width={88}
                      height={88}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col gap-5">
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-[#f5e9dc] leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : i < product.rating
                        ? 'fill-amber-200 text-amber-200'
                        : 'fill-gray-200 text-gray-200 dark:fill-[#3a2c23] dark:text-[#3a2c23]'
                    }`}
                  />
                ))}
              </div>
              {product.reviews > 0 && (
                <>
                  <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">({product.reviews})</span>
                  <span className="text-gray-300 dark:text-[#3a2c23] select-none">|</span>
                  <a href="#reviews" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                    Answered questions
                  </a>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold text-gray-900 dark:text-[#f5e9dc]">
                £{displayUnitPrice.toFixed(2)}
              </span>
              {displayOriginalPrice > displayUnitPrice && (
                <span className="text-2xl text-gray-400 dark:text-[#7A5C4F] line-through">
                  £{displayOriginalPrice.toFixed(2)}
                </span>
              )}
              {subDiscountPct > 0 && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-2.5 py-1 rounded-full">
                  {subDiscountPct}% OFF
                </span>
              )}
            </div>

            {/* ── Size Selection ── */}
            {hasSizes && (
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-[#f5e9dc] mb-2 uppercase tracking-wide">
                  Size:{' '}
                  <span className="text-amber-700 dark:text-amber-400 normal-case font-bold">
                    {selectedSizeObj?.label || selectedSize}
                  </span>
                </p>
                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full appearance-none px-4 py-3.5 pr-10 bg-gray-100 dark:bg-[#2d221c] text-gray-900 dark:text-[#f5e9dc] border border-gray-300 dark:border-[#4a3828] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition-colors"
                  >
                    {product.sizes.map((size: any) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                        {size.price > 0 ? ` — £${Number(size.price).toFixed(2)}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#c8b6a6] pointer-events-none" />
                </div>
              </div>
            )}

            {/* ── Mix & Match / Bulk Pricing ── */}
            {hasBulkPricing && (
              <div>
                <p className="font-bold text-gray-900 dark:text-[#f5e9dc]">Mix & Match products & SAVE!</p>
                <p className="text-sm text-gray-500 dark:text-[#c8b6a6] mt-0.5 mb-3">Choose quantity:</p>
                <div className="grid grid-cols-2 gap-2">
                  {adjustedBulkPricing.map((tier: any, idx: number) => {
                    const tierTotal = tier.price * (tier.quantity || 1);
                    const tierOrigTotal = tier.originalPrice * (tier.quantity || 1);
                    const isSelected = selectedQtyIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedQtyIdx(idx)}
                        className={`relative flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-[#3a2c23] hover:border-amber-300 dark:hover:border-amber-700'
                        }`}
                      >
                        <span className="text-xs text-gray-500 dark:text-[#c8b6a6]">Buy {tier.quantity}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 text-base">
                          £{tierTotal.toFixed(2)}
                        </span>
                        {tierOrigTotal > tierTotal && (
                          <span className="text-gray-400 dark:text-[#7A5C4F] line-through text-xs">
                            £{tierOrigTotal.toFixed(2)}
                          </span>
                        )}
                        {tier.discount > 0 && (
                          <span className="mt-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            SAVE {tier.discount}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Purchase Options ── */}
            <div>
              <p className="font-bold text-gray-900 dark:text-[#f5e9dc] mb-3">Purchase options</p>
              <div className="grid grid-cols-2 gap-2">
                {/* One-time */}
                <button
                  type="button"
                  onClick={() => setPurchaseOption('one-time')}
                  className={`flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                    purchaseOption === 'one-time'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-[#3a2c23] hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-[#f5e9dc]">One-time</span>
                  <span className="text-xs text-gray-500 dark:text-[#c8b6a6]">purchase</span>
                </button>

                {/* Subscribe & Save */}
                <button
                  type="button"
                  onClick={() => setPurchaseOption('repeat')}
                  className={`flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                    purchaseOption === 'repeat'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-[#3a2c23] hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-[#f5e9dc]">Subscribe &amp; Save</span>
                  {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      SAVE {product.subscriptionSettings.discountPercentage}%
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-[#c8b6a6]">recurring order</span>
                  )}
                </button>
              </div>

              {/* Deliver every */}
              {purchaseOption === 'repeat' && subscriptionAvailable && (
                <div className="mt-4 ml-7 flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-[#c8b6a6] whitespace-nowrap">Deliver every</span>
                  <div className="relative flex-1 max-w-[220px]">
                    <select
                      value={selectedInterval}
                      onChange={(e) => setSelectedInterval(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-[#2d221c] border border-gray-300 dark:border-[#4a3828] rounded-lg px-3 py-2.5 pr-8 text-sm text-gray-700 dark:text-[#f5e9dc] focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      {product.subscriptionSettings.weeklyOptions?.map((n: number) => (
                        <option key={`w${n}`} value={`Every ${n} ${n === 1 ? 'week' : 'weeks'}`}>
                          Every {n} {n === 1 ? 'week' : 'weeks'}
                        </option>
                      ))}
                      {product.subscriptionSettings.monthlyOptions?.map((n: number) => (
                        <option key={`m${n}`} value={`Every ${n} ${n === 1 ? 'month' : 'months'}`}>
                          Every {n} {n === 1 ? 'month' : 'months'}
                        </option>
                      ))}
                      {!product.subscriptionSettings.weeklyOptions?.length &&
                       !product.subscriptionSettings.monthlyOptions?.length &&
                       product.subscriptionSettings.intervals?.map((interval: string) => (
                        <option key={interval} value={interval}>{interval}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#c8b6a6] pointer-events-none" />
                  </div>
                </div>
              )}

              {/* How Subscribe & Save Works? */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
                  className="text-sm text-gray-700 dark:text-[#c8b6a6] font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline-offset-2 hover:underline"
                >
                  How Subscribe &amp; Save Works?
                </button>
                {showDeliveryInfo && (
                  <div className="mt-2 p-4 bg-amber-50 dark:bg-[#241b16] rounded-lg border border-amber-100 dark:border-[#3a2c23] text-sm text-gray-600 dark:text-[#c8b6a6] space-y-1.5">
                    <p>• Choose your delivery frequency above</p>
                    <p>• We automatically send your order on schedule</p>
                    {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 && (
                      <p>
                        • Save{' '}
                        <strong className="text-green-700 dark:text-green-400">
                          {product.subscriptionSettings.discountPercentage}%
                        </strong>{' '}
                        on every subscription delivery
                      </p>
                    )}
                    <p>• Cancel, skip or modify anytime before your next delivery</p>
                    <p>• No long-term commitment required</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── ADD TO CART — Desktop (observed for sticky bar trigger) ── */}
            <button
              ref={addToCartBtnRef}
              onClick={handleAddToCart}
              disabled={hasSizes && !selectedSize}
              className="hidden lg:flex w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-200 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl items-center justify-center gap-3 text-base shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {hasSizes && !selectedSize ? 'Select a size' : 'ADD TO CART'}
            </button>

            {/* Payment Method Icons */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#3a2c23]">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <PaymentIcon key={method} method={method} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Accordion Sections ─── */}
        <div className="mt-12 border-t border-gray-200 dark:border-[#3a2c23]">

          {/* DESCRIPTION */}
          <div className="border-b border-gray-200 dark:border-[#3a2c23]">
            <button
              onClick={() => setDescriptionOpen(!descriptionOpen)}
              className="w-full flex items-center justify-between py-4 text-left group"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-[#c8b6a6] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Description
              </span>
              {descriptionOpen
                ? <Minus className="w-4 h-4 text-gray-500 dark:text-[#c8b6a6] flex-shrink-0" />
                : <Plus className="w-4 h-4 text-gray-500 dark:text-[#c8b6a6] flex-shrink-0" />}
            </button>

            {descriptionOpen && (
              <div className="pb-8 text-sm text-gray-600 dark:text-[#c8b6a6] leading-relaxed space-y-4 max-w-3xl">
                {product.description && <p>{product.description}</p>}
                {product.features?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-[#f5e9dc] mb-2">The many benefits include:</p>
                    <ul className="space-y-1.5 list-none">
                      {product.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5 flex-shrink-0 font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NUTRITION FACTS */}
          {hasNutritionFacts && (
            <div className="border-b border-gray-200 dark:border-[#3a2c23]">
              <button
                onClick={() => setNutritionOpen(!nutritionOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
              >
                <span className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-[#c8b6a6] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Nutrition Facts
                </span>
                {nutritionOpen
                  ? <Minus className="w-4 h-4 text-gray-500 dark:text-[#c8b6a6] flex-shrink-0" />
                  : <Plus className="w-4 h-4 text-gray-500 dark:text-[#c8b6a6] flex-shrink-0" />}
              </button>

              {nutritionOpen && (
                <div className="pb-8">
                  {/* Nutrition label keeps its own white styling by design */}
                  <div className="max-w-xs border-2 border-gray-900 font-sans text-gray-900 bg-white">
                    <div className="px-2 pt-2 pb-1">
                      <h3 className="text-4xl font-black leading-none tracking-tight">Nutrition Facts</h3>
                      {product.nutritionFacts.servingSize && (
                        <p className="text-xs mt-1 border-b border-gray-900 pb-1">
                          Serving size{' '}
                          <strong>{product.nutritionFacts.servingSize}</strong>
                        </p>
                      )}
                    </div>
                    <div className="px-2 border-t-8 border-gray-900">
                      <div className="flex justify-between items-end border-b-4 border-gray-900 py-1.5">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-600">Amount Per Serving</p>
                          <p className="text-2xl font-black">Calories</p>
                        </div>
                        {product.nutritionFacts.calories && (
                          <p className="text-5xl font-black leading-none">
                            {product.nutritionFacts.calories}
                          </p>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-right border-b border-gray-400 py-0.5 mb-0.5">
                        % Daily Value*
                      </p>
                      {product.nutritionFacts.items?.map((item: any, i: number) => (
                        <div
                          key={i}
                          className={`flex justify-between items-center text-xs border-b border-gray-300 py-0.5 ${
                            item.bold ? 'font-bold' : 'font-normal'
                          }`}
                        >
                          <span className={item.indent ? 'pl-4' : ''}>
                            {item.label}
                            {item.value && (
                              <span className="font-normal ml-1 text-gray-600">{item.value}</span>
                            )}
                          </span>
                          {item.dailyValue && (
                            <span className="font-bold">{item.dailyValue}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="px-2 py-1.5 text-[9px] text-gray-500 leading-tight border-t border-gray-300">
                      * Percent Daily Values are based on a 2,000 calorie diet.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Size Guide — below description */}
      <SizeGuideSection />

      {/* Reviews */}
      <div id="reviews">
        <ProductReviews productId={product._id} />
      </div>

      {/* ─── Universal Sticky Bar ───
          • Mobile: always visible (desktop button is display:none → IntersectionObserver fires immediately)
          • Desktop: slides up from bottom when main CTA button scrolls out of view
      ─── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white dark:bg-[#241b16] border-t border-gray-200 dark:border-[#3a2c23] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
          <div className="max-w-6xl mx-auto flex items-center gap-3">

            {/* Product thumbnail — all screen sizes */}
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#2d221c] flex-shrink-0 border border-gray-200 dark:border-[#3a2c23]">
              <Image
                src={images[0]}
                alt={product.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name + price — desktop only */}
            <div className="hidden lg:block flex-shrink-0 min-w-0 max-w-[200px]">
              <p className="font-bold text-gray-900 dark:text-[#f5e9dc] text-sm line-clamp-1 leading-tight">{product.name}</p>
              <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm">£{displayUnitPrice.toFixed(2)}</p>
            </div>

            {/* Size selector */}
            {hasSizes && (
              <div className="relative flex-1 max-w-[160px] lg:max-w-[200px]">
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full appearance-none bg-gray-100 dark:bg-[#2d221c] border border-gray-300 dark:border-[#4a3828] rounded-lg pl-3 pr-7 py-2.5 text-sm font-medium text-gray-900 dark:text-[#f5e9dc] focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition-colors"
                >
                  {product.sizes.map((size: any) => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-[#c8b6a6] pointer-events-none" />
              </div>
            )}

            {/* Price — mobile only */}
            <span className="lg:hidden font-bold text-gray-900 dark:text-[#f5e9dc] text-sm flex-shrink-0">
              £{displayUnitPrice.toFixed(2)}
            </span>

            {/* ADD TO CART button */}
            <button
              onClick={handleAddToCart}
              disabled={hasSizes && !selectedSize}
              className="flex-1 lg:flex-none lg:min-w-[180px] bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-200 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden lg:inline">ADD TO CART</span>
              <span className="lg:hidden">ADD</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
