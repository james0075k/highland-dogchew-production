import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Highland Yak Milk Chews | Yak Chews for Dogs UK',
  description:
    'Shop our premium highland yak milk chews for dogs. 100% natural, high-protein, long-lasting hard cheese dog chews. Grain-free. Free UK delivery.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/products/yak-chews',
  },
  openGraph: {
    title: 'Highland Yak Milk Chews | Yak Chews for Dogs UK',
    description: 'Premium highland yak milk chews for dogs – natural, long-lasting, high-protein. Free UK delivery.',
    url: 'https://highlanddogchew.co.uk/products/yak-chews',
  },
};

export default function YakChewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
