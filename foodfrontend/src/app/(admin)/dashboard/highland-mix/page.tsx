import { Suspense } from "react";
import ProductDashboard from "../products/ProductDashboard";

export default function HighlandMixDashboard() {
  return (
    <Suspense fallback={null}>
      <ProductDashboard defaultProductType="highland-mix" />
    </Suspense>
  );
}
