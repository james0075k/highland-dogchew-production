import { Metadata } from 'next';
const BASE_URL = 'https://highlanddogchew.co.uk';
export const metadata: Metadata = {
  title: 'FAQs | Highland Yakchew',
  description: 'Frequently asked questions about Highland Yakchew yak milk chews, delivery, returns, and more.',
  alternates: { canonical: `${BASE_URL}/faq` },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
