import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { getProductFaqs } from './faqData';
import {
  BRAND,
  BASE_URL,
  JsonLd,
  metaDescription,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from '@/utils/seo';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const categoryCrumb: Record<string, { href: string; label: string }> = {
  'yak-milk': { href: '/products/yak-chews', label: 'Yak Milk Chews' },
  'puff-treat': { href: '/products/puff-treats', label: 'Puff Treats' },
  'highland-mix': { href: '/products/highland-mix', label: 'Highland Mix Chews' },
};

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: `Product Not Found | ${BRAND}` };
  }

  const url = `${BASE_URL}/products/${product.slug}`;
  const title = `${product.name} | ${BRAND}`;
  const description = metaDescription(
    product.description,
    `Buy ${product.name} from ${BRAND} — natural, single-ingredient yak milk dog chews. Free UK delivery over £30.`
  );
  const image = product.gallery?.[0] || product.image;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: BRAND,
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const url = `${BASE_URL}/products/${product.slug}`;
  const productJsonLd = buildProductJsonLd(product, url);
  const faqs = getProductFaqs(product);
  const faqJsonLd = buildFaqJsonLd(faqs);
  const crumb = categoryCrumb[product.productType];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: `${BASE_URL}/` },
    ...(crumb ? [{ name: crumb.label, url: `${BASE_URL}${crumb.href}` }] : []),
    { name: product.name, url },
  ]);

  return (
    <>
      {productJsonLd && <JsonLd data={productJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
