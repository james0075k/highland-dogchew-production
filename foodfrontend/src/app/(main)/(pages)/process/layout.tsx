import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How We Make Our Yak Chews | Our Process',
  description:
    'Discover how Highland Yak Chew crafts premium yak milk dog chews. From Himalayan milk procurement to the final product – a natural, authentic process.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/process',
  },
  openGraph: {
    title: 'How We Make Our Yak Chews | Highland Yak Chew Process',
    description: 'From Himalayan yak milk to premium dog chews – our authentic crafting process.',
    url: 'https://highlanddogchew.co.uk/process',
  },
};

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
