import type { Metadata } from 'next';
import MixChewDetailClient from './MixChewDetailClient';
import {
  BRAND,
  BASE_URL,
  JsonLd,
  metaDescription,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
} from '@/utils/seo';

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

async function getProduct(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
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
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: `Highland Mix Chews | ${BRAND}` };

  // Canonical points to the full product page — /mixchew/[id] is an alternate
  // view of the same product, so we consolidate ranking signals there.
  const url = product.slug ? `${BASE_URL}/products/${product.slug}` : `${BASE_URL}/mixchew/${id}`;
  const title = `${product.name} | Highland Mix | ${BRAND}`;
  const description = metaDescription(
    product.description,
    `${product.name} — part of the ${BRAND} Highland Mix range of natural yak milk dog chews. Free UK delivery over £30.`
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
  const { id } = await params;
  const product = await getProduct(id);

  const url = product?.slug ? `${BASE_URL}/products/${product.slug}` : `${BASE_URL}/mixchew/${id}`;
  const productJsonLd = product ? buildProductJsonLd(product, url) : null;
  const breadcrumbJsonLd = product
    ? buildBreadcrumbJsonLd([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Highland Mix Chews', url: `${BASE_URL}/products/highland-mix` },
        { name: product.name, url },
      ])
    : null;

  return (
    <>
      {productJsonLd && <JsonLd data={productJsonLd} />}
      {breadcrumbJsonLd && <JsonLd data={breadcrumbJsonLd} />}
      <MixChewDetailClient />
    </>
  );
}
