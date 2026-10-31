// ============================================================
// SUBSCRIPTION PLAN CONSTANTS
// ============================================================

export const BILLING_FREQUENCIES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
};

export const PLAN_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const PLAN_MESSAGES = {
  CREATED: 'Subscription plan created successfully',
  UPDATED: 'Subscription plan updated successfully',
  DEACTIVATED: 'Subscription plan deactivated successfully',
  FETCHED: 'Subscription plan fetched successfully',
  LIST_FETCHED: 'Subscription plans fetched successfully',
  NOT_FOUND: 'Subscription plan not found',
  PRODUCT_NOT_FOUND: 'Associated product not found',
  PRODUCT_INACTIVE: 'Cannot create plan for an archived product',
  FORBIDDEN_CREATE: 'Only administrators can create subscription plans',
  FORBIDDEN_UPDATE: 'Only administrators can update subscription plans',
  FORBIDDEN_DELETE: 'Only administrators can deactivate subscription plans',
  INVALID_DATES: 'End date must be after start date',
  HAS_ACTIVE_SUBSCRIPTIONS: 'Cannot deactivate plan with active subscriptions',
};
