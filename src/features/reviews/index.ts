import { mockReviewDataProvider } from './api/mockReviewDataProvider';
export type { ReviewDataProvider } from './api/reviewDataProvider';

// Provide a stable domain data-access object backed by the current active provider
export const reviewData = mockReviewDataProvider;

// Domain components
export { ReviewsSection } from './components/ReviewsSection';
