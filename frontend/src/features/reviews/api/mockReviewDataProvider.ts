import { mockReviews } from '@/mocks/reviews';
import { ReviewDataProvider } from './reviewDataProvider';

import { simulateAsync } from '@/lib/simulateAsync';

export const mockReviewDataProvider: ReviewDataProvider = {
  getAllReviews: () => simulateAsync(mockReviews),
  getReviewsByProductId: (productId: string) => simulateAsync(mockReviews.filter(review => review.productId === productId)),
};
