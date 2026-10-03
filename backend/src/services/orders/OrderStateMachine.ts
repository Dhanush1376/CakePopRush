import ApiError from '../../utils/ApiError';
import logger from '../../config/logger';

/**
 * Customer-Facing Order Lifecycle - EXACTLY 4 Primary Statuses
 * 1. CONFIRMED
 * 2. BEING BAKED
 * 3. DISPATCHED
 * 4. DELIVERED
 * (plus CANCELLED if order is cancelled)
 */
export type CustomerOrderStatus = 'CONFIRMED' | 'BEING BAKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

/**
 * Internal Operational Substates for Admin & Delivery Partner Systems
 */
export type InternalOperationalStatus =
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'AGENT_ACCEPTED'
  | 'PICKED_UP'
  | 'DISPATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'ARRIVED'
  | 'OTP_VERIFIED'
  | 'DELIVERED'
  | 'CANCELLED';

// Backwards-compatibility alias for legacy code
export type CanonicalOrderStatus = 'PENDING' | 'CONFIRMED' | 'BEING BAKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export class OrderStateMachine {
  /**
   * Authoritative mapping: maps any operational substate to exactly one of the 4 customer-facing statuses.
   */
  static toCustomerStatus(internalState: string): CustomerOrderStatus {
    const s = (internalState || '').trim().toUpperCase();

    if (s === 'CONFIRMED' || s === 'PENDING' || s === 'PLACED') {
      return 'CONFIRMED';
    }
    if (
      s === 'PREPARING' ||
      s === 'READY_FOR_PICKUP' ||
      s === 'READY' ||
      s === 'ASSIGNED' ||
      s === 'AGENT_ACCEPTED' ||
      s === 'ACCEPTED' ||
      s === 'BEING_BAKED' ||
      s === 'BEING BAKED' ||
      s === 'PROCESSING'
    ) {
      return 'BEING BAKED';
    }
    if (
      s === 'PICKED_UP' ||
      s === 'PICKED UP' ||
      s === 'DISPATCHED' ||
      s === 'OUT_FOR_DELIVERY' ||
      s === 'OUT FOR DELIVERY' ||
      s === 'ARRIVED' ||
      s === 'SHIPPED'
    ) {
      return 'DISPATCHED';
    }
    if (s === 'OTP_VERIFIED' || s === 'DELIVERED' || s === 'COMPLETED') {
      return 'DELIVERED';
    }
    if (s === 'CANCELLED' || s === 'CANCELED') {
      return 'CANCELLED';
    }

    return 'CONFIRMED';
  }

  /**
   * Internal operational state transition graph.
   * Enforces strict, legal SaaS-grade progression.
   */
  private static readonly internalTransitions: Record<InternalOperationalStatus, InternalOperationalStatus[]> = {
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
    READY_FOR_PICKUP: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['AGENT_ACCEPTED', 'READY_FOR_PICKUP', 'ASSIGNED', 'CANCELLED'], // can reassign
    AGENT_ACCEPTED: ['PICKED_UP', 'ASSIGNED', 'CANCELLED'],
    PICKED_UP: ['DISPATCHED'],
    DISPATCHED: ['OUT_FOR_DELIVERY', 'ARRIVED', 'OTP_VERIFIED', 'DELIVERED'],
    OUT_FOR_DELIVERY: ['ARRIVED', 'OTP_VERIFIED', 'DELIVERED'],
    ARRIVED: ['OTP_VERIFIED', 'DELIVERED'],
    OTP_VERIFIED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  /**
   * Normalizes any input status string to the authoritative legacy or canonical uppercase format.
   */
  static normalizeState(status: string): CanonicalOrderStatus {
    const s = (status || '').trim().toUpperCase();
    if (s === 'PLACED' || s === 'PAYMENT_PENDING' || s === 'PENDING') return 'PENDING';
    if (s === 'CONFIRMED' || s === 'ORDER CONFIRMED') return 'CONFIRMED';
    if (
      s === 'PROCESSING' ||
      s === 'PREPARING' ||
      s === 'PACKED' ||
      s === 'READY' ||
      s === 'READY_FOR_PICKUP' ||
      s === 'ASSIGNED' ||
      s === 'AGENT_ACCEPTED' ||
      s === 'BEING BAKED' ||
      s === 'BEING_BAKED'
    ) {
      return 'BEING BAKED';
    }
    if (
      s === 'DISPATCHED' ||
      s === 'SHIPPED' ||
      s === 'PICKED_UP' ||
      s === 'OUT_FOR_DELIVERY' ||
      s === 'OUT FOR DELIVERY'
    ) {
      return 'DISPATCHED';
    }
    if (s === 'DELIVERED' || s === 'COMPLETED' || s === 'OTP_VERIFIED') return 'DELIVERED';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'CANCELLED';
    return 'PENDING';
  }

  /**
   * Validates internal operational state transitions.
   * Throws ApiError if transition is illegal.
   */
  static validateInternalTransition(
    orderId: string,
    currentState: InternalOperationalStatus | string,
    nextState: InternalOperationalStatus | string
  ): void {
    const from = (currentState || 'CONFIRMED').trim().toUpperCase() as InternalOperationalStatus;
    const to = (nextState || '').trim().toUpperCase() as InternalOperationalStatus;

    if (from === to) return; // Idempotent

    const allowed = this.internalTransitions[from] || [];
    if (!allowed.includes(to)) {
      logger.warn(`[ORDER STATE MACHINE] Illegal internal transition rejected for order ${orderId}: ${from} -> ${to}`);
      throw new ApiError(
        400,
        `Invalid operational order transition from ${from} to ${to}. Allowed transitions: ${allowed.join(', ') || 'none'}`
      );
    }
  }

  /**
   * Legacy 4-step canonical transition validator (for backwards compatibility).
   */
  static validateTransition(
    orderId: string,
    currentState: string,
    nextState: string,
    isPrivileged: boolean = false
  ): void {
    const from = this.normalizeState(currentState);
    const to = this.normalizeState(nextState);

    // Terminal states are IRREVERSIBLE — no one can modify or move out of DELIVERED or CANCELLED
    if (from === 'DELIVERED') {
      throw new ApiError(400, 'Order has been delivered and cannot be modified. Delivery is a terminal state.');
    }
    if (from === 'CANCELLED') {
      throw new ApiError(400, 'Order has been cancelled and cannot be reactivated. Cancellation is a terminal state.');
    }

    // Idempotent transition is allowed for non-terminal states
    if (from === to) return;

    // Privileged admin bypass for operational correction, but only to non-terminal canonical states
    // DELIVERED is excluded — only OTP verification can trigger delivery completion
    if (isPrivileged) {
      const allowedTargets: CanonicalOrderStatus[] = ['PENDING', 'CONFIRMED', 'BEING BAKED', 'DISPATCHED', 'CANCELLED'];
      if (allowedTargets.includes(to)) {
        return;
      }
    }

    const validTransitions: Record<CanonicalOrderStatus, CanonicalOrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['BEING BAKED', 'CANCELLED'],
      'BEING BAKED': ['DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[from] || [];
    if (!allowed.includes(to)) {
      logger.warn(`[ORDER STATE MACHINE] Invalid transition rejected for order ${orderId}: ${from} -> ${to}`);
      throw new ApiError(
        400,
        `Invalid order status transition from ${from} to ${to}. Valid progression: PENDING → CONFIRMED → BEING BAKED → DISPATCHED → DELIVERED.`
      );
    }
  }

  static canTransition(currentState: string, nextState: string, isPrivileged: boolean = false): boolean {
    try {
      this.validateTransition('check', currentState, nextState, isPrivileged);
      return true;
    } catch {
      return false;
    }
  }
}

export default OrderStateMachine;

