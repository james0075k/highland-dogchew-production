import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story | About Highland Yakchew',
  description:
    'Learn about Highland Yakchew – how we source authentic yak milk from Himalayan farmers to create premium, natural dog chews for healthy, happy dogs.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/about',
  },
  openGraph: {
    title: 'Our Story | About Highland Yakchew',
    description: 'The story behind Highland Yakchew – authentic yak milk dog chews from the Himalayas.',
    url: 'https://highlanddogchew.co.uk/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
