import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Himalayan Puff Treats | Yak Cheese Puffs for Dogs UK',
  description:
    'Light, crunchy Himalayan puff treats made from yak milk. Microwave yak chew end pieces into delicious puffed snacks your dog will love. Free UK delivery.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/products/puff-treats',
  },
  openGraph: {
    title: 'Himalayan Puff Treats | Yak Cheese Puffs for Dogs UK',
    description: 'Crunchy yak cheese puff treats for dogs – natural, grain-free. Free UK delivery.',
    url: 'https://highlanddogchew.co.uk/products/puff-treats',
  },
};

export default function PuffTreatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
