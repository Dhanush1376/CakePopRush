import { describe, it, expect } from 'vitest';
import {
  DeliveryAgentPortalSkeleton,
  DeliveryOrderDetailSkeleton,
} from '@/pages/delivery/components';

describe('Delivery Skeletons Module Suite', () => {
  it('exports DeliveryAgentPortalSkeleton as a valid React component function', () => {
    expect(typeof DeliveryAgentPortalSkeleton).toBe('function');
  });

  it('exports DeliveryOrderDetailSkeleton as a valid React component function', () => {
    expect(typeof DeliveryOrderDetailSkeleton).toBe('function');
  });

  it('renders elements with correct displayName or function name', () => {
    expect(DeliveryAgentPortalSkeleton.name).toBe('DeliveryAgentPortalSkeleton');
    expect(DeliveryOrderDetailSkeleton.name).toBe('DeliveryOrderDetailSkeleton');
  });

  it('has LiveTrackingPage skeleton CSS rules defined in module', async () => {
    const liveTrackingCss = await import('@/pages/storefront/orders/LiveTrackingPage.module.css');
    expect(liveTrackingCss.default.skeletonShimmer).toBeDefined();
    expect(liveTrackingCss.default.headerSkeletonNumber).toBeDefined();
    expect(liveTrackingCss.default.driverAvatarSkeleton).toBeDefined();
    expect(liveTrackingCss.default.driverNameSkeleton).toBeDefined();
    expect(liveTrackingCss.default.driverStatsSkeleton).toBeDefined();
    expect(liveTrackingCss.default.addressSkeletonLine).toBeDefined();
    expect(liveTrackingCss.default.timelineSkeletonBar).toBeDefined();
    expect(liveTrackingCss.default.badgeSkeleton).toBeDefined();
    expect(liveTrackingCss.default.itemSkeletonImg).toBeDefined();
  });
});
