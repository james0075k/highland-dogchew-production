import { Suspense } from "react";
import ProductDashboard from "../products/ProductDashboard";

export default function PuffTreatDashboard() {
  return (
    <Suspense fallback={null}>
      <ProductDashboard defaultProductType="puff-treat" />
    </Suspense>
  );
}
