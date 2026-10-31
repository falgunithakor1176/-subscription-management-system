/**
 * customer.constants.js
 * Constants scoped strictly to the Customer Management module.
 */

export const CUSTOMER_MESSAGES = {
  CREATE_SUCCESS: 'Customer created successfully.',
  UPDATE_SUCCESS: 'Customer updated successfully.',
  DELETE_SUCCESS: 'Customer deactivated successfully.',
  FETCH_SUCCESS: 'Customer retrieved successfully.',
  LIST_SUCCESS: 'Customers retrieved successfully.',
  NOT_FOUND: 'Customer record not found.',
  EMAIL_ALREADY_EXISTS: 'A customer with this email address already exists.',
  FORBIDDEN_ACCESS: 'Access denied: You are not authorized to view or manage this customer record.',
};

export const CUSTOMER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};
