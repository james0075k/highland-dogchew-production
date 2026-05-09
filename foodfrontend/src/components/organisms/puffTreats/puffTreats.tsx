import ProductSection from '@/components/organisms/ProductSection/ProductSection';

export default function PuffTreatsSection({ initialProducts }: { initialProducts?: unknown[] }) {
  return (
    <ProductSection
      apiPath="products?type=puff-treat"
      label="Light & Crunchy"
      title="Puff Treats"
      subtitle="Airy, natural snacks your dog will go wild for"
      variant="light"
      viewAllHref="/products"
      initialProducts={initialProducts as never}
    />
  );
}
