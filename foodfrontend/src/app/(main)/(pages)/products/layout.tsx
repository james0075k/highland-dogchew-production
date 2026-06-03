import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dog Chews & Treats | All Products',
  description:
    'Browse all Highland Yak Chew products – yak milk chews, Himalayan puff treats and highland mix. 100% natural, long-lasting dog chews. Free UK delivery.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/products',
  },
  openGraph: {
    title: 'Dog Chews & Treats | Highland Yak Chew',
    description: 'Browse all our premium highland yak chew products. Natural, long-lasting dog treats. Free UK delivery.',
    url: 'https://highlanddogchew.co.uk/products',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
