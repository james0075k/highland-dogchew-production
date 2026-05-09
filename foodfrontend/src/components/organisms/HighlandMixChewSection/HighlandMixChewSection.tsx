import ProductSection from '@/components/organisms/ProductSection/ProductSection';

export default function HighlandMixChewSection({ initialProducts }: { initialProducts?: unknown[] }) {
  return (
    <ProductSection
      apiPath="products?type=highland-mix"
      label="Premium Blend"
      title="Highland Mix Chews"
      subtitle="The ultimate mix — every bite packed with natural goodness"
      variant="subtle"
      viewAllHref="/products"
      initialProducts={initialProducts as never}
    />
  );
}
