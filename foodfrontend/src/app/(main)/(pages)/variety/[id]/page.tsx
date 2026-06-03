import type { Metadata } from 'next';
import VarietyDetailClient from './VarietyDetailClient';
import { BRAND, BASE_URL, JsonLd, metaDescription, buildBreadcrumbJsonLd } from '@/utils/seo';

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

async function getVariety(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/variety/${id}/products`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const variety = await getVariety(id);
  if (!variety) return { title: `Flavours | ${BRAND}` };

  const url = `${BASE_URL}/variety/${id}`;
  const title = `${variety.name} Yak Chews | ${BRAND}`;
  const description = metaDescription(
    variety.description,
    `Explore ${variety.name} flavour natural yak milk dog chews from ${BRAND}. ${variety.productCount || ''} products. Free UK delivery over £30.`
  );
  const image = variety.image;

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
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: variety.name }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const variety = await getVariety(id);

  const url = `${BASE_URL}/variety/${id}`;
  const breadcrumbJsonLd = variety
    ? buildBreadcrumbJsonLd([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Products', url: `${BASE_URL}/products` },
        { name: variety.name, url },
      ])
    : null;

  const collectionJsonLd =
    variety && Array.isArray(variety.products) && variety.products.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${variety.name} Yak Chews`,
          description: variety.description || `${variety.name} flavour yak milk dog chews from ${BRAND}.`,
          url,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: variety.products.length,
            itemListElement: variety.products.slice(0, 20).map((p: any, i: number) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: p.name,
              url: p.slug ? `${BASE_URL}/products/${p.slug}` : url,
            })),
          },
        }
      : null;

  return (
    <>
      {breadcrumbJsonLd && <JsonLd data={breadcrumbJsonLd} />}
      {collectionJsonLd && <JsonLd data={collectionJsonLd} />}
      <VarietyDetailClient />
    </>
  );
}
