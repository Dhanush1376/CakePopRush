import { ReviewDataProvider } from './reviewDataProvider';
import { Review } from '@/types/review';
import { apiClient } from '@/lib/api/client';

export const apiReviewDataProvider: ReviewDataProvider = {
  getAllReviews: async () => {
    const response = await apiClient.get<{ success: boolean; data: Review[] }>('/api/v1/reviews');
    return response.data || (response as unknown as Review[]);
  },
  
  getReviewsByProductId: async (productId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Review[] }>(`/api/v1/products/${productId}/reviews`);
    return response.data || (response as unknown as Review[]);
  }
};
