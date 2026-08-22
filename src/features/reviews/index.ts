import { mockReviewDataProvider } from './api/mockReviewDataProvider';
import { apiReviewDataProvider } from './api/apiReviewDataProvider';
import { getProviderMode } from '@/lib/providerConfig';

export type { ReviewDataProvider } from './api/reviewDataProvider';

// Provide a stable domain data-access object backed by the current active provider
export const reviewData = getProviderMode() === 'api' ? apiReviewDataProvider : mockReviewDataProvider;

// Domain components
export { ReviewsSection } from './components/ReviewsSection';
