'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Check, ChevronDown, Minus, Plus, ChevronRight, Truck, RefreshCcw, Leaf, Shield } from 'lucide-react';
import ProductReviews from '@/components/organisms/ProductReviews/ProductReviews';
import SizeGuideSection from '@/components/organisms/SizeGuideSection/SizeGuideSection';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';
import FancySelect, { type FancyOption } from '@/components/molecules/FancySelect/FancySelect';
import { getProductFaqs } from './faqData';

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
      <span className="inline-flex items-center justify-center bg-white dark:bg-[#2d221c] border border-gray-200 dark:border-[#3a2c23] text-gray-800 dark:text-[#c8b6a6] text-[11px] font-semibold px-3 py-1.5 rounded-md">
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
      <span className="inline-flex items-center justify-center bg-white dark:bg-[#2d221c] border border-gray-200 dark:border-[#3a2c23] px-2 py-1.5 rounded-md">
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
      <span className="inline-flex items-center justify-center bg-white dark:bg-[#2d221c] border border-gray-200 dark:border-[#3a2c23] px-2 py-1.5 rounded-md">
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

export default function ProductDetailClient({ initialProduct }: { initialProduct: any }) {
  const { addToCart } = useCart();

  // Product data is fetched server-side and passed in as a prop (enables
  // per-product metadata + server-rendered JSON-LD). No client fetch needed.
  const [product] = useState<any>(initialProduct);

  const [selectedSize, setSelectedSize] = useState(initialProduct?.sizes?.[0]?.value || '');
  const [selectedQtyIdx, setSelectedQtyIdx] = useState<number | null>(
    initialProduct?.bulkPricing?.length > 0 ||
    initialProduct?.sizes?.some((s: any) => s.bulkTiers?.length > 0)
      ? 0
      : null
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [purchaseOption, setPurchaseOption] = useState<'one-time' | 'repeat'>('one-time');
  const [selectedInterval, setSelectedInterval] = useState(
    initialProduct?.subscriptionSettings?.intervals?.[0] || ''
  );
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const addToCartBtnRef = useRef<HTMLButtonElement>(null);

  const faqs = useMemo(() => getProductFaqs(initialProduct || {}), [initialProduct]);

  // Fetch related products (same productType) on the client — non-critical for SEO.
  useEffect(() => {
    if (!product?.productType) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?type=${product.productType}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRelatedProducts(
            (d.data || []).filter((r: any) => r.slug !== product.slug).slice(0, 4)
          );
        }
      })
      .catch(() => {});
  }, [product?.productType, product?.slug]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!addToCartBtnRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(addToCartBtnRef.current);
    return () => observer.disconnect();
  }, [product]);

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

  const adjustedBulkPricing = useMemo(() => {
    // Size selected → use only that size's own saved bulk tiers
    if (selectedSizeObj) {
      if (!selectedSizeObj.bulkTiers?.length) return []; // size has no bulk tiers
      return selectedSizeObj.bulkTiers.map((tier: any) => ({
        quantity: tier.minQty,
        price: tier.salePrice,
        originalPrice: tier.originalPrice,
        discount: tier.discountPercent,
      }));
    }
    // No sizes on product → use product-level bulk pricing as-is (no scaling)
    return product?.bulkPricing ?? [];
  }, [product, selectedSizeObj]);

  // Reset bulk tier selection when size changes
  useEffect(() => {
    if (adjustedBulkPricing.length > 0) {
      setSelectedQtyIdx(0);
    } else {
      setSelectedQtyIdx(null);
    }
  }, [selectedSize]);

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

  const savingsAmt = displayOriginalPrice > displayUnitPrice
    ? Math.round(((displayOriginalPrice - displayUnitPrice) / displayOriginalPrice) * 100)
    : 0;

  // Stock tracking
  const effectiveStock = useMemo(() => {
    if (!product?.trackStock) return null;
    if (selectedSizeObj?.stockQuantity != null) return selectedSizeObj.stockQuantity as number;
    return product.stockQuantity ?? 0;
  }, [product, selectedSizeObj]);

  const isOutOfStock = product?.trackStock && effectiveStock !== null && effectiveStock <= 0;
  const isLowStock = product?.trackStock && effectiveStock !== null && effectiveStock > 0 && effectiveStock <= 10;

  const handleAddToCart = () => {
    if (!product) return;
    if (isOutOfStock) {
      setToast({ message: 'This product is out of stock', type: 'error' });
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      setToast({ message: 'Please select a size first', type: 'error' });
      return;
    }
    const cartUnitPrice = currentTier
      ? +(displayUnitPrice / (currentTier.quantity || 1)).toFixed(2)
      : +displayUnitPrice.toFixed(2);
    addToCart({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.gallery?.[0] || product.image,
      size: selectedSizeObj?.label || selectedSize || 'Default',
      quantity: cartQty,
      unitPrice: cartUnitPrice,
      originalPrice: +effectiveOriginalPrice.toFixed(2),
      isSubscription: purchaseOption === 'repeat',
      subscriptionInterval: purchaseOption === 'repeat' ? selectedInterval : undefined,
      ...(currentTier ? { tierMinQty: currentTier.quantity } : {}),
      ...(product.trackStock && effectiveStock !== null ? { maxStock: effectiveStock } : {}),
    });
    setToast({ message: `${product.name} added to cart!`, type: 'success' });
  };

  // Defensive guard — product is always provided by the server, but if a stale
  // client navigation ever passes null we render a graceful fallback.
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)]">
        <div className="text-center">
          <h1 className="text-xl font-bold font-heading text-[#2E1F14] dark:text-[#f5e9dc] mb-3">Product not found</h1>
          <Link href="/products" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
            ← All Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.gallery?.length > 0 ? product.gallery : [product.image];
  const hasSizes = product.sizes?.length > 0;
  const hasBulkPricing = adjustedBulkPricing.length > 0;
  const hasNutritionFacts = product.nutritionFacts?.items?.length > 0;
  const usePillSizes = hasSizes && product.sizes.length <= 6;

  return (
    <div className="min-h-screen bg-[var(--surface-page)] transition-colors duration-300">
      {/* Product / FAQ / Breadcrumb JSON-LD is rendered server-side in page.tsx */}

      {/* Toast — top-40 (160px) keeps it below the fixed navbar (~144px on desktop) */}
      {toast && (
        <div className={`fixed top-40 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all duration-300 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
        }`}>
          {toast.type === 'success' && <Check className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-24 lg:pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[12px] text-gray-400 dark:text-gray-500 mb-8 font-medium flex-wrap">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href={categoryBackLinks[product.productType]?.href || '/products'} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            {categoryBackLinks[product.productType]?.label || 'Products'}
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-[#2E1F14] dark:text-[#c8b6a6] truncate">{product.name}</span>
        </nav>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] gap-8 lg:gap-14">

          {/* ── LEFT: Images ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F0EAE1] dark:bg-[#1e1510] border border-gray-100 dark:border-[#2a2018]">
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 bg-[#2E1F14] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow">
                  {product.badge}
                </span>
              )}
              {savingsAmt > 0 && !product.badge && (
                <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow">
                  -{savingsAmt}%
                </span>
              )}
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                      selectedImage === i
                        ? 'border-[#2E1F14] dark:border-amber-500'
                        : 'border-gray-200 dark:border-[#2a2018] hover:border-gray-400 dark:hover:border-[#4a3828]'
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="flex flex-col gap-0">

            {/* Category tag */}
            {categoryBackLinks[product.productType] && (
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-amber-600 dark:text-amber-500 mb-2">
                {categoryBackLinks[product.productType].label}
              </span>
            )}

            {/* Product name */}
            <h1 className="text-3xl lg:text-4xl font-bold font-heading text-[#2E1F14] dark:text-[#f5e9dc] leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : i < product.rating
                      ? 'fill-amber-200 text-amber-200'
                      : 'fill-gray-200 text-gray-200 dark:fill-[#2a2018] dark:text-[#2a2018]'
                  }`} />
                ))}
              </div>
              {product.reviews > 0 ? (
                <a href="#reviews" className="text-sm text-amber-600 dark:text-amber-400 font-semibold hover:underline underline-offset-2">
                  {product.reviews} review{product.reviews !== 1 ? 's' : ''}
                </a>
              ) : (
                <a href="#reviews" className="text-sm text-gray-400 dark:text-gray-500 hover:underline underline-offset-2">
                  Be the first to review
                </a>
              )}
            </div>

            {/* Price block */}
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span className="text-4xl font-bold text-[#2E1F14] dark:text-[#f5e9dc]">
                £{displayUnitPrice.toFixed(2)}
              </span>
              {displayOriginalPrice > displayUnitPrice && (
                <span className="text-xl text-gray-400 dark:text-[#7A5C4F] line-through font-normal">
                  £{displayOriginalPrice.toFixed(2)}
                </span>
              )}
              {savingsAmt > 0 && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold px-2.5 py-1 rounded-full">
                  Save {savingsAmt}%
                </span>
              )}
              {subDiscountPct > 0 && (
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full">
                  Sub {subDiscountPct}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Incl. VAT · Free UK delivery over £30</p>

            <div className="h-px bg-gray-100 dark:bg-[#2a2018] mb-5" />

            {/* ── Size selection — pills (≤6) or animated FancySelect (more) ── */}
            {hasSizes && (
              <div className="mb-5">
                {usePillSizes ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-[#2E1F14] dark:text-[#f5e9dc]">
                        Size:{' '}
                        <span
                          key={selectedSize /* re-mount triggers fade-in on change */}
                          className="text-amber-600 dark:text-amber-400 inline-block animate-[hyc-fade-in_0.25s_ease-out]"
                        >
                          {selectedSizeObj?.label || selectedSize}
                        </span>
                      </p>
                      <a
                        href="#size-guide"
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline underline-offset-2 font-medium"
                      >
                        Size guide
                      </a>
                    </div>

                    {/* Refined pill grid — responsive, animated press, amber halo on selection */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                      {product.sizes.map((size: any) => {
                        const isSelected = selectedSize === size.value;
                        return (
                          <button
                            key={size.value}
                            type="button"
                            onClick={() => setSelectedSize(size.value)}
                            aria-pressed={isSelected}
                            className={`group/pill relative overflow-hidden ` +
                              `flex flex-col items-start justify-center text-left ` +
                              `min-h-[56px] px-4 py-2.5 rounded-xl ` +
                              `border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ` +
                              `active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ` +
                              (isSelected
                                ? 'border-[#2E1F14] dark:border-amber-500 bg-[#2E1F14] dark:bg-amber-600 text-white shadow-[0_8px_22px_-10px_rgba(46,31,20,0.45)] dark:shadow-[0_8px_22px_-10px_rgba(217,119,6,0.5)] -translate-y-[1px]'
                                : 'border-[#e2d8c8] dark:border-[#3a2c23] text-[#3a2820] dark:text-[#e8d8c5] hover:border-amber-400/70 hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] bg-white dark:bg-[#1e1510]')
                            }
                          >
                            {/* Soft amber wash on hover for unselected */}
                            {!isSelected && (
                              <span
                                aria-hidden="true"
                                className="absolute inset-0 bg-gradient-to-br from-amber-50/0 via-amber-50/0 to-amber-100/0 group-hover/pill:from-amber-50/60 group-hover/pill:via-amber-50/30 group-hover/pill:to-amber-100/40 dark:group-hover/pill:from-amber-900/15 dark:group-hover/pill:to-amber-900/5 transition-opacity duration-300"
                              />
                            )}

                            {/* Selected check pip */}
                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/95 text-[#2E1F14] dark:text-amber-700 flex items-center justify-center animate-[hyc-pop_0.35s_cubic-bezier(0.16,1,0.3,1)]">
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              </span>
                            )}

                            <span className="relative text-sm font-bold leading-tight truncate w-full">
                              {size.label}
                            </span>
                            {size.price > 0 && (
                              <span
                                className={`relative mt-0.5 text-[11px] font-semibold tracking-wide ${
                                  isSelected ? 'text-white/85' : 'text-amber-700 dark:text-amber-400'
                                }`}
                              >
                                £{Number(size.price).toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <FancySelect
                    label="Size"
                    labelAside={
                      <a
                        href="#size-guide"
                        className="text-amber-600 dark:text-amber-400 hover:underline underline-offset-2 font-medium"
                      >
                        Size guide
                      </a>
                    }
                    value={selectedSize}
                    onChange={(v) => setSelectedSize(v)}
                    options={product.sizes.map((size: any): FancyOption => ({
                      value: size.value,
                      label: size.label,
                      hint: size.price > 0 ? `£${Number(size.price).toFixed(2)}` : undefined,
                    }))}
                  />
                )}
              </div>
            )}

            <style jsx global>{`
              @keyframes hyc-fade-in {
                from { opacity: 0; transform: translateY(-2px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              @keyframes hyc-pop {
                0%   { opacity: 0; transform: scale(0.4); }
                70%  { opacity: 1; transform: scale(1.15); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>

            {/* ── Mix & Match / Bulk Pricing ── */}
            {hasBulkPricing && (
              <div className="mb-5">
                <p className="text-sm font-bold font-heading text-[#2E1F14] dark:text-[#f5e9dc] mb-1">Mix &amp; Match — Save more</p>
                <p className="text-xs text-gray-400 dark:text-[#7A5C4F] mb-3">The more you buy, the more you save</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {adjustedBulkPricing.map((tier: any, idx: number) => {
                    const tierTotal = tier.price;
                    const tierOrigTotal = tier.originalPrice;
                    const isSelected = selectedQtyIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedQtyIdx(idx)}
                        className={`relative flex flex-col items-start p-3.5 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-[#2E1F14] dark:border-amber-500 bg-[#2E1F14]/5 dark:bg-amber-500/10'
                            : 'border-gray-200 dark:border-[#2a2018] bg-white dark:bg-[#1e1510] hover:border-gray-300 dark:hover:border-[#3a2c23]'
                        }`}
                      >
                        {tier.discount > 0 && (
                          <span className="mb-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                            SAVE {tier.discount}%
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 dark:text-[#7A5C4F] mb-0.5">Buy {tier.quantity}</span>
                        <span className="font-bold text-[#2E1F14] dark:text-[#f5e9dc] text-base">
                          £{tierTotal.toFixed(2)}
                        </span>
                        {tierOrigTotal > tierTotal && (
                          <span className="text-gray-400 dark:text-[#7A5C4F] line-through text-xs">
                            £{tierOrigTotal.toFixed(2)}
                          </span>
                        )}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-[#2E1F14] dark:bg-amber-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Purchase Options ── */}
            <div className="mb-5">
              <p className="text-sm font-bold font-heading text-[#2E1F14] dark:text-[#f5e9dc] mb-3">Purchase options</p>
              <div className="space-y-2">
                {/* One-time */}
                <button
                  type="button"
                  onClick={() => setPurchaseOption('one-time')}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    purchaseOption === 'one-time'
                      ? 'border-[#2E1F14] dark:border-amber-500 bg-[#2E1F14]/5 dark:bg-amber-500/10'
                      : 'border-gray-200 dark:border-[#2a2018] bg-white dark:bg-[#1e1510] hover:border-gray-300 dark:hover:border-[#3a2c23]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    purchaseOption === 'one-time'
                      ? 'border-[#2E1F14] dark:border-amber-500'
                      : 'border-gray-300 dark:border-[#3a2c23]'
                  }`}>
                    {purchaseOption === 'one-time' && (
                      <div className="w-2 h-2 rounded-full bg-[#2E1F14] dark:bg-amber-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#2E1F14] dark:text-[#f5e9dc]">One-time purchase</span>
                    <p className="text-xs text-gray-400 dark:text-[#7A5C4F]">Pay once, no commitment</p>
                  </div>
                </button>

                {/* Subscribe & Save */}
                <button
                  type="button"
                  onClick={() => setPurchaseOption('repeat')}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    purchaseOption === 'repeat'
                      ? 'border-[#2E1F14] dark:border-amber-500 bg-[#2E1F14]/5 dark:bg-amber-500/10'
                      : 'border-gray-200 dark:border-[#2a2018] bg-white dark:bg-[#1e1510] hover:border-gray-300 dark:hover:border-[#3a2c23]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    purchaseOption === 'repeat'
                      ? 'border-[#2E1F14] dark:border-amber-500'
                      : 'border-gray-300 dark:border-[#3a2c23]'
                  }`}>
                    {purchaseOption === 'repeat' && (
                      <div className="w-2 h-2 rounded-full bg-[#2E1F14] dark:bg-amber-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#2E1F14] dark:text-[#f5e9dc]">Subscribe &amp; Save</span>
                      {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 && (
                        <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                          SAVE {product.subscriptionSettings.discountPercentage}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-[#7A5C4F]">Cancel or pause anytime</p>
                  </div>
                </button>
              </div>

              {/* Deliver every */}
              {purchaseOption === 'repeat' && subscriptionAvailable && (
                <div className="mt-3 flex items-center gap-3 pl-1">
                  <span className="text-sm text-gray-600 dark:text-[#c8b6a6] whitespace-nowrap">Deliver every</span>
                  <div className="relative flex-1 max-w-[200px]">
                    <select
                      value={selectedInterval}
                      onChange={(e) => setSelectedInterval(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-[#1e1510] border-2 border-gray-200 dark:border-[#3a2c23] rounded-xl px-3 py-2 pr-8 text-sm text-[#2E1F14] dark:text-[#f5e9dc] focus:outline-none focus:border-[#2E1F14] dark:focus:border-amber-500 cursor-pointer"
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
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* How Subscribe & Save Works — rich expandable panel */}
              {purchaseOption === 'repeat' && (
                <div className="mt-3 rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800">
                  <button
                    type="button"
                    onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-left"
                  >
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <RefreshCcw className="w-3 h-3" />
                      How does Subscribe &amp; Save work?
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 ${showDeliveryInfo ? 'rotate-180' : ''}`} />
                  </button>

                  {showDeliveryInfo && (
                    <div className="bg-white dark:bg-[#1a1510] px-4 py-4 space-y-3">
                      {/* Step 1 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">1</div>
                        <div>
                          <p className="text-xs font-semibold text-[#2E1F14] dark:text-[#f5e9dc]">Choose your frequency</p>
                          <p className="text-xs text-gray-500 dark:text-[#c8b6a6] mt-0.5">Pick how often you'd like to receive your order — weekly, fortnightly, or monthly.</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">2</div>
                        <div>
                          <p className="text-xs font-semibold text-[#2E1F14] dark:text-[#f5e9dc]">Pay once — we handle the rest</p>
                          <p className="text-xs text-gray-500 dark:text-[#c8b6a6] mt-0.5">Your card is charged automatically on your chosen schedule. No action needed from you.</p>
                        </div>
                      </div>

                      {/* Step 3 — savings */}
                      {subscriptionAvailable && product.subscriptionSettings.discountPercentage > 0 && (
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">3</div>
                          <div>
                            <p className="text-xs font-semibold text-[#2E1F14] dark:text-[#f5e9dc]">
                              Save {product.subscriptionSettings.discountPercentage}% on every delivery
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[#c8b6a6] mt-0.5">
                              You save{' '}
                              <strong className="text-emerald-600 dark:text-emerald-400">
                                £{(effectiveUnitPrice * (product.subscriptionSettings.discountPercentage / 100)).toFixed(2)}
                              </strong>{' '}
                              per delivery compared to one-time price.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Step 4 — control */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">{product.subscriptionSettings.discountPercentage > 0 ? '4' : '3'}</div>
                        <div>
                          <p className="text-xs font-semibold text-[#2E1F14] dark:text-[#f5e9dc]">Pause, skip or cancel anytime</p>
                          <p className="text-xs text-gray-500 dark:text-[#c8b6a6] mt-0.5">No lock-in. Manage your subscription from your account — before each delivery.</p>
                        </div>
                      </div>

                      {/* Manage link */}
                      <div className="pt-2 border-t border-gray-100 dark:border-[#2a2018]">
                        <Link
                          href="/track-order?tab=subscriptions"
                          className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline underline-offset-2 font-medium"
                        >
                          Manage your subscriptions
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* "How it works" toggle for one-time (collapsed version) */}
              {purchaseOption === 'one-time' && (
                <button
                  type="button"
                  onClick={() => { setPurchaseOption('repeat'); setShowDeliveryInfo(true); }}
                  className="mt-2 text-xs text-gray-400 dark:text-[#7A5C4F] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline-offset-2 hover:underline flex items-center gap-1"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Learn about Subscribe &amp; Save
                </button>
              )}
            </div>

            {/* Stock warnings */}
            {isOutOfStock && (
              <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold text-center">
                Out of Stock
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <div className="mb-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold text-center">
                Only {effectiveStock} left in stock!
              </div>
            )}

            {/* ── ADD TO CART — Desktop ── */}
            <button
              ref={addToCartBtnRef}
              onClick={handleAddToCart}
              disabled={(hasSizes && !selectedSize) || !!isOutOfStock}
              className="hidden lg:flex w-full bg-[#2E1F14] hover:bg-[#432d1f] active:bg-[#1a1209] disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-amber-700 dark:hover:bg-amber-600 dark:disabled:bg-[#2a2018] text-white font-bold py-4 px-8 rounded-xl items-center justify-center gap-3 text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-200 mb-4"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {isOutOfStock ? 'OUT OF STOCK' : hasSizes && !selectedSize ? 'Select a size' : 'ADD TO CART'}
            </button>

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {[
                { icon: Truck, text: 'Free UK delivery over £30' },
                { icon: RefreshCcw, text: '14-day hassle-free returns' },
                { icon: Leaf, text: '100% natural ingredients' },
                { icon: Shield, text: 'Secure checkout' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-[#1e1510] border border-gray-100 dark:border-[#2a2018]">
                  <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                  <span className="text-[11px] text-gray-500 dark:text-[#c8b6a6] leading-tight">{text}</span>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#2a2018]">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-2 font-medium tracking-wide uppercase">Secure payment via</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {PAYMENT_METHODS.map((method) => (
                  <PaymentIcon key={method} method={method} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Accordion: Description + Nutrition ── */}
        <div className="mt-14 border-t border-gray-200 dark:border-[#2a2018]">

          {/* Description */}
          <div className="border-b border-gray-200 dark:border-[#2a2018]">
            <button
              onClick={() => setDescriptionOpen(!descriptionOpen)}
              className="w-full flex items-center justify-between py-5 text-left group"
            >
              <span className="text-sm font-bold font-heading uppercase tracking-[0.2em] text-[#2E1F14] dark:text-[#c8b6a6] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Description
              </span>
              {descriptionOpen
                ? <Minus className="w-4 h-4 text-gray-400 dark:text-[#c8b6a6] flex-shrink-0" />
                : <Plus className="w-4 h-4 text-gray-400 dark:text-[#c8b6a6] flex-shrink-0" />}
            </button>

            {descriptionOpen && (
              <div className="pb-8 text-sm text-gray-600 dark:text-[#c8b6a6] leading-relaxed space-y-4 max-w-3xl">
                {product.description && <p>{product.description}</p>}
                {product.features?.length > 0 && (
                  <div>
                    <p className="font-semibold text-[#2E1F14] dark:text-[#f5e9dc] mb-2">The many benefits include:</p>
                    <ul className="space-y-1.5">
                      {product.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nutrition Facts */}
          {hasNutritionFacts && (
            <div className="border-b border-gray-200 dark:border-[#2a2018]">
              <button
                onClick={() => setNutritionOpen(!nutritionOpen)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span className="text-sm font-bold font-heading uppercase tracking-[0.2em] text-[#2E1F14] dark:text-[#c8b6a6] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Nutrition Facts
                </span>
                {nutritionOpen
                  ? <Minus className="w-4 h-4 text-gray-400 dark:text-[#c8b6a6] flex-shrink-0" />
                  : <Plus className="w-4 h-4 text-gray-400 dark:text-[#c8b6a6] flex-shrink-0" />}
              </button>

              {nutritionOpen && (
                <div className="pb-8">
                  <div className="max-w-xs border-2 border-gray-900 font-sans text-gray-900 bg-white">
                    <div className="px-2 pt-2 pb-1">
                      <h3 className="text-4xl font-black leading-none tracking-tight">Nutrition Facts</h3>
                      {product.nutritionFacts.servingSize && (
                        <p className="text-xs mt-1 border-b border-gray-900 pb-1">
                          Serving size <strong>{product.nutritionFacts.servingSize}</strong>
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
                          <p className="text-5xl font-black leading-none">{product.nutritionFacts.calories}</p>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-right border-b border-gray-400 py-0.5 mb-0.5">% Daily Value*</p>
                      {product.nutritionFacts.items?.map((item: any, i: number) => (
                        <div key={i} className={`flex justify-between items-center text-xs border-b border-gray-300 py-0.5 ${item.bold ? 'font-bold' : 'font-normal'}`}>
                          <span className={item.indent ? 'pl-4' : ''}>
                            {item.label}
                            {item.value && <span className="font-normal ml-1 text-gray-600">{item.value}</span>}
                          </span>
                          {item.dailyValue && <span className="font-bold">{item.dailyValue}</span>}
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

      {/* ── Frequently Asked Questions (visible content matches FAQPage JSON-LD) ── */}
      {faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#D8CCBA] dark:border-[#2a2018]">
          <div className="mb-6">
            <span className="inline-block text-amber-600 dark:text-amber-500 text-xs font-bold tracking-[0.22em] uppercase mb-2">Good to Know</span>
            <h2 className="text-2xl lg:text-3xl font-bold font-heading text-[#2E1F14] dark:text-[#f5e9dc]">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-[#2a2018] border-t border-gray-200 dark:border-[#2a2018]">
            {faqs.map((faq, i) => {
              const open = faqOpenIdx === i;
              return (
                <div key={i}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setFaqOpenIdx(open ? null : i)}
                      aria-expanded={open}
                      className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                    >
                      <span className="text-base font-semibold text-[#2E1F14] dark:text-[#f5e9dc] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {faq.question}
                      </span>
                      {open
                        ? <Minus className="w-4 h-4 text-gray-400 dark:text-[#c8b6a6] flex-shrink-0" />
                        : <Plus className="w-4 h-4 text-gray-400 dark:text-[#c8b6a6] flex-shrink-0" />}
                    </button>
                  </h3>
                  {open && (
                    <div className="pb-6 -mt-1 text-sm text-gray-600 dark:text-[#c8b6a6] leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Size Guide */}
      <div id="size-guide">
        <SizeGuideSection />
      </div>

      {/* Reviews */}
      <div id="reviews">
        <ProductReviews productId={product._id} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#D8CCBA] dark:border-[#2a2018]">
          <div className="mb-8">
            <span className="inline-block text-amber-600 dark:text-amber-500 text-xs font-bold tracking-[0.22em] uppercase mb-2">You May Also Like</span>
            <h2 className="text-2xl lg:text-3xl font-bold font-heading text-[#2E1F14] dark:text-[#f5e9dc]">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rp, i) => (
              <ProductCard key={rp._id} product={rp} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Sticky bar ── */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white dark:bg-[#1e1510] border-t border-gray-200 dark:border-[#2a2018] px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
          <div className="max-w-6xl mx-auto flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F0EAE1] dark:bg-[#2d221c] flex-shrink-0 border border-gray-100 dark:border-[#2a2018]">
              <Image src={images[0]} alt={product.name} width={44} height={44} className="w-full h-full object-cover" />
            </div>

            <div className="hidden lg:block flex-shrink-0 min-w-0 max-w-[180px]">
              <p className="font-bold font-heading text-[#2E1F14] dark:text-[#f5e9dc] text-sm line-clamp-1">{product.name}</p>
              <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm">£{displayUnitPrice.toFixed(2)}</p>
            </div>

            {hasSizes && (
              <div className="flex-1 max-w-[160px] lg:max-w-[200px]">
                <FancySelect
                  variant="pill"
                  placement="top"
                  value={selectedSize}
                  onChange={(v) => setSelectedSize(v)}
                  options={product.sizes.map((size: any): FancyOption => ({
                    value: size.value,
                    label: size.label,
                    hint: size.price > 0 ? `£${Number(size.price).toFixed(2)}` : undefined,
                  }))}
                />
              </div>
            )}

            <span className="lg:hidden font-bold text-[#2E1F14] dark:text-[#f5e9dc] text-sm flex-shrink-0">
              £{displayUnitPrice.toFixed(2)}
            </span>

            <button
              onClick={handleAddToCart}
              disabled={(hasSizes && !selectedSize) || !!isOutOfStock}
              className="flex-1 lg:flex-none lg:min-w-[180px] bg-[#2E1F14] hover:bg-[#432d1f] dark:bg-amber-700 dark:hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
