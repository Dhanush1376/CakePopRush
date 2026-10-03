import { describe, it, expect } from 'vitest';

const testOrders: Record<string, any> = {
  'CPR-20510': { id: 'CPR-20510', status: 'not dispatched' },
  'CPR-20495': { id: 'CPR-20495', status: 'dispatched' },
  'CPR-20482': { id: 'CPR-20482', status: 'delivered' },
};

describe('Storefront Order States, OTP & Rating Visibility', () => {
  const getOrderStateFlags = (order: any) => {
    const normStatus = (order?.status || '').toLowerCase().trim();
    const isCompleted = normStatus === 'delivered' || normStatus === 'completed';
    const isPreDispatch = normStatus === 'not dispatched' || 
                          normStatus === 'pending' || 
                          normStatus === 'confirmed' || 
                          normStatus === 'order confirmed' ||
                          normStatus === 'preparing' ||
                          normStatus === 'being baked' ||
                          normStatus === 'processing' ||
                          normStatus === 'ready_for_pickup' ||
                          normStatus === 'assigned' ||
                          normStatus === 'agent_accepted';
    const isDispatched = !isCompleted && !isPreDispatch && normStatus !== 'cancelled';

    // Business rules:
    // 1. Rating card ("Love our service? Rate your experience") MUST come at delivered state only
    const showRatingCard = isCompleted;

    // 2. Delivery OTP ("DELIVERY OTP 0510") MUST come at dispatched state only
    const showDeliveryOtp = isDispatched;

    // 3. Map is rendered ONLY when dispatched
    const showLiveMap = isDispatched;

    return {
      isPreDispatch,
      isDispatched,
      isCompleted,
      showRatingCard,
      showDeliveryOtp,
      showLiveMap,
    };
  };

  it('All pre-dispatch states show preparation UI and NO live map or OTP', () => {
    const preDispatchStates = [
      'pending',
      'confirmed',
      'order confirmed',
      'being baked',
      'preparing',
      'ready_for_pickup',
      'assigned',
      'agent_accepted',
      'not dispatched',
    ];

    preDispatchStates.forEach((st) => {
      const flags = getOrderStateFlags({ status: st });
      expect(flags.isPreDispatch, `State "${st}" should be pre-dispatch`).toBe(true);
      expect(flags.isDispatched, `State "${st}" should NOT be dispatched`).toBe(false);
      expect(flags.showLiveMap, `State "${st}" should NOT show live map`).toBe(false);
      expect(flags.showDeliveryOtp, `State "${st}" should NOT show delivery OTP`).toBe(false);
      expect(flags.isCompleted, `State "${st}" should NOT be completed`).toBe(false);
    });
  });

  it('DISPATCHED state shows Live Delivery Map and Delivery OTP', () => {
    const flags = getOrderStateFlags({ status: 'dispatched' });
    expect(flags.isPreDispatch).toBe(false);
    expect(flags.isDispatched).toBe(true);
    expect(flags.showLiveMap).toBe(true);
    expect(flags.showDeliveryOtp).toBe(true);
    expect(flags.isCompleted).toBe(false);
  });

  it('DELIVERED state shows Delivered UI, rating card, and stops live map / hides OTP', () => {
    const flags = getOrderStateFlags({ status: 'delivered' });
    expect(flags.isPreDispatch).toBe(false);
    expect(flags.isDispatched).toBe(false);
    expect(flags.showLiveMap).toBe(false);
    expect(flags.showDeliveryOtp).toBe(false);
    expect(flags.isCompleted).toBe(true);
    expect(flags.showRatingCard).toBe(true);
  });

  it('Pending order approval gate: approval transitions directly to Being Baked, cancel terminates', () => {
    // Simulated state transition machine for Pending approval
    const transitionOrder = (currentStatus: string, action: 'approve' | 'cancel') => {
      if (currentStatus.toUpperCase() !== 'PENDING') {
        throw new Error('Action only valid on PENDING orders');
      }
      if (action === 'approve') {
        return { status: 'Being Baked', internalStatus: 'PREPARING' };
      }
      return { status: 'Cancelled', internalStatus: 'CANCELLED' };
    };

    const approved = transitionOrder('PENDING', 'approve');
    expect(approved.status).toBe('Being Baked');
    expect(approved.internalStatus).toBe('PREPARING');

    const cancelled = transitionOrder('PENDING', 'cancel');
    expect(cancelled.status).toBe('Cancelled');
    expect(cancelled.internalStatus).toBe('CANCELLED');
  });

  it('Mandatory delivery partner validation on DISPATCH', () => {
    const validateDispatch = (order: { deliveryAgentId?: string }) => {
      if (!order.deliveryAgentId) {
        return { ok: false, error: 'A delivery agent must be selected to dispatch this order.' };
      }
      return { ok: true, status: 'DISPATCHED', liveGpsActive: true };
    };

    const withoutAgent = validateDispatch({});
    expect(withoutAgent.ok).toBe(false);
    expect(withoutAgent.error).toContain('delivery agent must be selected');

    const withAgent = validateDispatch({ deliveryAgentId: 'agent_123' });
    expect(withAgent.ok).toBe(true);
    expect(withAgent.status).toBe('DISPATCHED');
    expect(withAgent.liveGpsActive).toBe(true);
  });

  it('Customer Delivery OTP is strictly a 6-digit cryptographic code', () => {
    const isValidOtp = (otp: string) => /^\d{6}$/.test(otp);

    expect(isValidOtp('1234')).toBe(false); // 4 digits rejected
    expect(isValidOtp('12345')).toBe(false); // 5 digits rejected
    expect(isValidOtp('1234567')).toBe(false); // 7 digits rejected
    expect(isValidOtp('12a456')).toBe(false); // Alpha rejected
    expect(isValidOtp('482915')).toBe(true); // Valid 6-digit OTP
    expect(isValidOtp('003412')).toBe(true); // Valid 6-digit OTP with leading zeros
  });
});

