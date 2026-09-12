import { Suspense } from "react";
import ReviewsDashboard from "./ReviewsDashboard";

export default function ReviewsPage() {
  return (
    <Suspense fallback={null}>
      <ReviewsDashboard />
    </Suspense>
  );
}
