import ProductSection from '@/components/organisms/ProductSection/ProductSection';

export default function YakMilkSection({ initialProducts }: { initialProducts?: unknown[] }) {
  return (
    <ProductSection
      apiPath="products?type=yak-milk"
      label="Best Sellers"
      title="Yak Milk Chews"
      subtitle="100% Natural, Full of Protein & Calcium"
      variant="none"
      viewAllHref="/products"
      initialProducts={initialProducts as never}
    />
  );
}
