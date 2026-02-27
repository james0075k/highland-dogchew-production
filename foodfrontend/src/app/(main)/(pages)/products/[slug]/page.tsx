'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Star, ShoppingCart, Loader2, Check, ChevronDown, Minus, Plus } from 'lucide-react';
import ProductReviews from '@/components/organisms/ProductReviews/ProductReviews';
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
  if (method === 'PayPal') {
    return (
      <span className="inline-flex items-center justify-center bg-[#003087] text-white text-[11px] font-bold px-3 py-1.5 rounded-md">
        Pay<span className="text-[#009cde]">Pal</span>
      </span>
    );
  }
  if (method === 'ShoPay') {
    return (
      <span className="inline-flex items-center justify-center bg-[#5a31f4] text-white text-[11px] font-bold px-3 py-1.5 rounded-md">
        Shop Pay
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
  return null;
}

const PAYMENT_METHODS = ['Apple Pay', 'Google Pay', 'PayPal', 'ShoPay', 'Visa', 'Mastercard'];

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h1>
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
    <div className="min-h-screen bg-white pt-32 pb-28 lg:pb-12">
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
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span>/</span>
          <Link
            href={categoryBackLinks[product.productType]?.href || '/products'}
            className="hover:text-amber-600 transition-colors"
          >
            {categoryBackLinks[product.productType]?.label || 'Products'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* ─── Main Two-Column Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-12">

          {/* ── Left: Images ── */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
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
                        : 'border-gray-200 hover:border-gray-400'
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
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
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
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              {product.reviews > 0 && (
                <>
                  <span className="text-sm text-amber-600 font-semibold">({product.reviews})</span>
                  <span className="text-gray-300 select-none">|</span>
                  <a href="#reviews" className="text-sm text-amber-600 hover:underline">
                    Answered questions
                  </a>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold text-gray-900">
                £{displayUnitPrice.toFixed(2)}
              </span>
              {displayOriginalPrice > displayUnitPrice && (
                <span className="text-2xl text-gray-400 line-through">
                  £{displayOriginalPrice.toFixed(2)}
                </span>
              )}
              {subDiscountPct > 0 && (
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
                  {subDiscountPct}% OFF
                </span>
              )}
            </div>

            {/* ── Size Selection ── */}
            {hasSizes && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  Size:{' '}
                  <span className="text-amber-700 normal-case font-bold">
                    {selectedSizeObj?.label || selectedSize}
                  </span>
                </p>
                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full appearance-none px-4 py-3.5 pr-10 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition-colors"
                  >
                    {product.sizes.map((size: any) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                        {size.price > 0 ? ` — £${Number(size.price).toFixed(2)}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            )}

            {/* ── Mix & Match / Bulk Pricing ── */}
            {hasBulkPricing && (
              <div>
                <p className="font-bold text-gray-900">Mix & Match products & SAVE!</p>
                <p className="text-sm text-gray-500 mt-0.5 mb-3">Choose quantity:</p>
                <div className="space-y-2">
                  {adjustedBulkPricing.map((tier: any, idx: number) => {
                    const tierTotal = tier.price * (tier.quantity || 1);
                    const tierOrigTotal = tier.originalPrice * (tier.quantity || 1);
                    const isSelected = selectedQtyIdx === idx;
                    return (
                      <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="quantity"
                          checked={isSelected}
                          onChange={() => setSelectedQtyIdx(idx)}
                          className="w-4 h-4 accent-amber-600 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1.5 flex-wrap">
                          <span>Buy {tier.quantity}:</span>
                          <span className="font-bold text-amber-600">
                            £{tierTotal.toFixed(2)}
                          </span>
                          {tierOrigTotal > tierTotal && (
                            <span className="text-gray-400 line-through text-xs">
                              £{tierOrigTotal.toFixed(2)}
                            </span>
                          )}
                        </span>
                        {tier.discount > 0 && (
                          <span className="bg-gray-900 text-white text-[11px] font-bold px-2 py-0.5 rounded flex-shrink-0">
                            SAVE {tier.discount}%
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Purchase Options ── */}
            <div>
              <p className="font-bold text-gray-900 mb-3">Purchase options</p>
              <div className="space-y-2.5">
                {/* One-time */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="purchase"
                    value="one-time"
                    checked={purchaseOption === 'one-time'}
                    onChange={() => setPurchaseOption('one-time')}
                    className="w-4 h-4 accent-amber-600 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">One-time purchase</span>
                </label>

                {/* Subscribe & Save */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="purchase"
                    value="repeat"
                    checked={purchaseOption === 'repeat'}
                    onChange={() => setPurchaseOption('repeat')}
                    className="w-4 h-4 accent-amber-600 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    Subscribe &amp; Save
                    {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 && (
                      <span className="text-green-600 font-semibold ml-1">
                        (SAVE {product.subscriptionSettings.discountPercentage}%)
                      </span>
                    )}
                  </span>
                </label>
              </div>

              {/* Deliver every — only when subscribe selected */}
              {purchaseOption === 'repeat' && subscriptionAvailable && (
                <div className="mt-4 ml-7 flex items-center gap-3">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Deliver every</span>
                  <div className="relative flex-1 max-w-[220px]">
                    <select
                      value={selectedInterval}
                      onChange={(e) => setSelectedInterval(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      {/* Weekly options */}
                      {product.subscriptionSettings.weeklyOptions?.map((n: number) => (
                        <option key={`w${n}`} value={`Every ${n} ${n === 1 ? 'week' : 'weeks'}`}>
                          Every {n} {n === 1 ? 'week' : 'weeks'}
                        </option>
                      ))}
                      {/* Monthly options */}
                      {product.subscriptionSettings.monthlyOptions?.map((n: number) => (
                        <option key={`m${n}`} value={`Every ${n} ${n === 1 ? 'month' : 'months'}`}>
                          Every {n} {n === 1 ? 'month' : 'months'}
                        </option>
                      ))}
                      {/* Backward-compat: old free-text intervals */}
                      {!product.subscriptionSettings.weeklyOptions?.length &&
                       !product.subscriptionSettings.monthlyOptions?.length &&
                       product.subscriptionSettings.intervals?.map((interval: string) => (
                        <option key={interval} value={interval}>{interval}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* How Subscribe & Save Works? */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
                  className="text-sm text-gray-700 font-medium hover:text-amber-600 transition-colors underline-offset-2 hover:underline"
                >
                  How Subscribe &amp; Save Works?
                </button>
                {showDeliveryInfo && (
                  <div className="mt-2 p-4 bg-amber-50 rounded-lg border border-amber-100 text-sm text-gray-600 space-y-1.5">
                    <p>• Choose your delivery frequency above</p>
                    <p>• We automatically send your order on schedule</p>
                    {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 && (
                      <p>
                        • Save{' '}
                        <strong className="text-green-700">
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

            {/* ── ADD TO CART — Desktop ── */}
            <button
              onClick={handleAddToCart}
              disabled={hasSizes && !selectedSize}
              className="hidden lg:flex w-full bg-[#b5621e] hover:bg-[#9a4f15] active:bg-[#7d3f10] disabled:bg-amber-200 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl items-center justify-center gap-3 text-base shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {hasSizes && !selectedSize ? 'Select a size' : 'ADD TO CART'}
            </button>

            {/* Payment Method Icons */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <PaymentIcon key={method} method={method} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Accordion Sections ─── */}
        <div className="mt-12 border-t border-gray-200">

          {/* DESCRIPTION */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setDescriptionOpen(!descriptionOpen)}
              className="w-full flex items-center justify-between py-4 text-left group"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-gray-700 group-hover:text-amber-700 transition-colors">
                Description
              </span>
              {descriptionOpen
                ? <Minus className="w-4 h-4 text-gray-500 flex-shrink-0" />
                : <Plus className="w-4 h-4 text-gray-500 flex-shrink-0" />}
            </button>

            {descriptionOpen && (
              <div className="pb-8 text-sm text-gray-600 leading-relaxed space-y-4 max-w-3xl">
                {product.description && <p>{product.description}</p>}
                {product.features?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">The many benefits include:</p>
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
            <div className="border-b border-gray-200">
              <button
                onClick={() => setNutritionOpen(!nutritionOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
              >
                <span className="text-sm font-bold uppercase tracking-widest text-gray-700 group-hover:text-amber-700 transition-colors">
                  Nutrition Facts
                </span>
                {nutritionOpen
                  ? <Minus className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  : <Plus className="w-4 h-4 text-gray-500 flex-shrink-0" />}
              </button>

              {nutritionOpen && (
                <div className="pb-8">
                  <div className="max-w-xs border-2 border-gray-900 font-sans text-gray-900">
                    {/* Header */}
                    <div className="px-2 pt-2 pb-1">
                      <h3 className="text-4xl font-black leading-none tracking-tight">Nutrition Facts</h3>
                      {product.nutritionFacts.servingSize && (
                        <p className="text-xs mt-1 border-b border-gray-900 pb-1">
                          Serving size{' '}
                          <strong>{product.nutritionFacts.servingSize}</strong>
                        </p>
                      )}
                    </div>
                    {/* Calories row */}
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
                      {/* % Daily Value header */}
                      <p className="text-[10px] font-bold text-right border-b border-gray-400 py-0.5 mb-0.5">
                        % Daily Value*
                      </p>
                      {/* Items */}
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
                    {/* Footer note */}
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

      {/* Reviews */}
      <div id="reviews">
        <ProductReviews productId={product._id} />
      </div>

      {/* ─── Mobile Sticky Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-50 lg:hidden">
        <div className="flex gap-2 max-w-lg mx-auto">
          {hasSizes && (
            <div className="relative flex-shrink-0">
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-lg pl-3 pr-7 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer min-w-[120px]"
              >
                {product.sizes.map((size: any) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={hasSizes && !selectedSize}
            className="flex-1 bg-[#b5621e] hover:bg-[#9a4f15] active:bg-[#7d3f10] disabled:bg-amber-200 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
