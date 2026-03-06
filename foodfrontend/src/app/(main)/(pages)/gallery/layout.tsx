import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Highland Yak Chew',
  description:
    'Browse our gallery of natural Himalayan yak milk dog chews — honey, strawberry, blueberry, coconut, pumpkin, mint, turmeric, flaxseed and more.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/gallery',
  },
  openGraph: {
    title: 'Gallery | Highland Yak Chew',
    description: 'Explore our full range of natural Himalayan dog chews in every flavour.',
    url: 'https://highlanddogchew.co.uk/gallery',
    siteName: 'Highland Yak Chew',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
