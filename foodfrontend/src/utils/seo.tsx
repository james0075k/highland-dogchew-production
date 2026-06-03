// Shared SEO / structured-data helpers for product detail pages.
// Used by the server components at products/[slug], mixchew/[id], variety/[id].

import React from 'react';
import type { FAQItem } from '@/app/(main)/(pages)/products/[slug]/faqData';

export const BRAND = 'Highland Yak Chew';
export const BASE_URL = 'https://highlanddogchew.co.uk';

/** Renders a JSON-LD <script> server-side so crawlers see it without running JS. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Trim a description to a clean ~155-char meta description. */
export function metaDescription(text: string | undefined, fallback: string): string {
  const src = (text || '').replace(/\s+/g, ' ').trim();
  if (!src) return fallback;
  if (src.length <= 160) return src;
  return src.slice(0, 157).trimEnd() + '…';
}

/** Resolve the lowest available price (Google requires a non-zero number). */
export function resolveProductPrice(product: any): number | null {
  if (product?.sizes?.length > 0) {
    const firstSizePrice = product.sizes.find((s: any) => s.price > 0)?.price;
    if (firstSizePrice) return +Number(firstSizePrice).toFixed(2);
  }
  if (product?.price > 0) return +Number(product.price).toFixed(2);
  if (product?.bulkPricing?.length > 0) {
    const minBulk = Math.min(...product.bulkPricing.map((b: any) => b.price));
    if (minBulk > 0) return +Number(minBulk).toFixed(2);
  }
  return null;
}

/** Build Product schema.org JSON-LD from a product + its canonical URL. */
export function buildProductJsonLd(product: any, url: string): Record<string, unknown> | null {
  const price = resolveProductPrice(product);
  if (!product || price == null) return null;

  const inStock = !(product.trackStock && (product.stockQuantity ?? 0) <= 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.gallery?.length > 0 ? product.gallery : [product.image].filter(Boolean),
    description: product.description || product.name,
    brand: { '@type': 'Brand', name: BRAND },
    ...(product.sku ? { sku: product.sku } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'GBP',
      price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'GB',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '1.99', currency: 'GBP' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'GB' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
        },
      },
      seller: { '@type': 'Organization', name: BRAND },
    },
    ...(product.reviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

/** Build BreadcrumbList JSON-LD from an ordered list of {name, url}. */
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Build FAQPage JSON-LD from FAQ items. MUST match the visible FAQ content. */
export function buildFaqJsonLd(faqs: FAQItem[]): Record<string, unknown> | null {
  if (!faqs?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
