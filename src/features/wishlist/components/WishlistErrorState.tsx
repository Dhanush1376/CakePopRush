import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { BrokenCakePopIcon } from '@/assets/illustrations/BrokenCakePopIcon';
import { RefreshCw } from 'lucide-react';

interface WishlistErrorStateProps {
  onRetry: () => void;
}

export const WishlistErrorState = ({ onRetry }: WishlistErrorStateProps) => {
  return (
    <EmptyState
      icon={<BrokenCakePopIcon width={64} height={64} />}
      title="We couldn't load your wishlist"
      description="Something went wrong while fetching your saved treats."
      action={
        <Button variant="outline" onClick={onRetry} leftIcon={<RefreshCw size={16} />}>
          Try Again
        </Button>
      }
    />
  );
};
