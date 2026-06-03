import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Highland Yak Chew',
  description:
    'Get in touch with the Highland Yak Chew team. Questions about our highland yak chew products, orders or delivery? We\'d love to hear from you.',
  alternates: {
    canonical: 'https://highlanddogchew.co.uk/contact',
  },
  openGraph: {
    title: 'Contact Us | Highland Yak Chew',
    description: 'Contact Highland Yak Chew for product enquiries, orders and delivery questions.',
    url: 'https://highlanddogchew.co.uk/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
