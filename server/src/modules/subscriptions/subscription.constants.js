// ============================================================
// SUBSCRIPTION CONSTANTS
// ============================================================

export const SUBSCRIPTION_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  EXPIRED: 'EXPIRED',
  CLOSED: 'CLOSED',
};

export const SUBSCRIPTION_MESSAGES = {
  CREATED: 'Subscription created successfully',
  UPDATED: 'Subscription updated successfully',
  STATUS_UPDATED: 'Subscription status updated successfully',
  FETCHED: 'Subscription retrieved successfully',
  LIST_FETCHED: 'Subscriptions retrieved successfully',
  NOT_FOUND: 'Subscription record not found',
  CUSTOMER_NOT_FOUND: 'Customer not found or inactive',
  PLAN_NOT_FOUND: 'Subscription plan not found or inactive',
  FORBIDDEN_ACCESS: 'Access denied: You do not have permission to access this subscription',
  FORBIDDEN_ACTION: 'Only administrators and staff can perform this subscription lifecycle action',
};
