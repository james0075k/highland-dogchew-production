import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Highland Mix Dog Chews | Variety Pack UK',
  description:
    'Try our Highland Mix – a variety pack of premium natural dog chews. Yak milk chews in different flavours. Perfect for dogs who love variety. Delivered across the UK.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/products/highland-mix',
  },
  openGraph: {
    title: 'Highland Mix Dog Chews | Variety Pack UK',
    description: 'Premium highland mix variety dog chews – natural yak milk, multiple flavours. Delivered across the UK.',
    url: 'https://highlanddogchew.co.uk/products/highland-mix',
  },
};

export default function HighlandMixLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
