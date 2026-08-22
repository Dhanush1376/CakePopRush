import { Review } from '@/types/review';

export interface ReviewDataProvider {
  getAllReviews(): Promise<Review[]>;
  getReviewsByProductId(productId: string): Promise<Review[]>;
}
