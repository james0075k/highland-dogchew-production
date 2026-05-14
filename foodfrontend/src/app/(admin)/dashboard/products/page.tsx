import { Suspense } from "react";
import ProductDashboard from "./ProductDashboard";

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductDashboard />
    </Suspense>
  );
}
