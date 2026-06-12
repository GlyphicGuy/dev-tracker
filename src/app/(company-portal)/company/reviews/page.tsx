import { getPendingReviews } from "@/actions/reviews";
import { ReviewsClient } from "./reviews-client";

export default async function PendingReviewsPage() {
  const pendingReviews = await getPendingReviews();

  return <ReviewsClient reviews={pendingReviews} />;
}
