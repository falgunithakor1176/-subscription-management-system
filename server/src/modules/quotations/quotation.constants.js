// ============================================================
// QUOTATION CONSTANTS
// ============================================================

export const QUOTATION_STATUSES = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

export const QUOTATION_MESSAGES = {
  CREATED: 'Quotation created successfully',
  UPDATED: 'Quotation updated successfully',
  STATUS_UPDATED: 'Quotation status updated successfully',
  FETCHED: 'Quotation retrieved successfully',
  LIST_FETCHED: 'Quotations retrieved successfully',
  NOT_FOUND: 'Quotation record not found',
  CUSTOMER_NOT_FOUND: 'Customer not found or inactive',
  PRODUCT_NOT_FOUND: 'One or more selected products not found',
  CANNOT_EDIT_NON_DRAFT: 'Only quotations in DRAFT status can be modified',
  UNAUTHORIZED_CUSTOMER_ACTION: 'Customers can only accept or reject quotations sent to them',
  FORBIDDEN_ACCESS: 'Access denied: You do not have permission to access this quotation',
  CONVERTED_TO_SUBSCRIPTION: 'Quotation successfully converted to active subscription',
};
