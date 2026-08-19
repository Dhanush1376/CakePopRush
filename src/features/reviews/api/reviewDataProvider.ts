import { Review } from '@/types/review';

export interface ReviewDataProvider {
  getAllReviews(): Review[];
  getReviewsByProductId(productId: string): Review[];
}
