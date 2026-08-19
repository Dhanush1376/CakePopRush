import { mockReviews } from '@/mocks/reviews';
import { ReviewDataProvider } from './reviewDataProvider';

export const mockReviewDataProvider: ReviewDataProvider = {
  getAllReviews: () => mockReviews,
  getReviewsByProductId: (productId: string) => mockReviews.filter(review => review.productId === productId),
};
