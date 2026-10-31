/**
 * customer.controller.js
 * HTTP request and response handler for the Customer Management module.
 * Receives validated data, invokes service layer, and returns standardized JSON.
 */

import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendPaginated, sendSuccess } from '../../utils/ApiResponse.js';
import { CUSTOMER_MESSAGES } from './customer.constants.js';
import {
  createCustomerRecord,
  deactivateCustomerRecord,
  getCustomerDetails,
  getMyCustomerProfile,
  listCustomers,
  updateCustomerRecord,
} from './customer.service.js';

/**
 * GET /api/v1/customers
 * Returns paginated customer directory with search and status filtering.
 */
export const getCustomers = asyncHandler(async (req, res) => {
  const result = await listCustomers(req.user, req.query);

  return sendPaginated(
    res,
    result.customers,
    result.total,
    result.page,
    result.limit,
    CUSTOMER_MESSAGES.LIST_SUCCESS
  );
});

/**
 * GET /api/v1/customers/me
 * Returns the customer profile linked to the authenticated user.
 */
export const getMyCustomer = asyncHandler(async (req, res) => {
  const customer = await getMyCustomerProfile(req.user);

  return sendSuccess(res, { customer }, CUSTOMER_MESSAGES.FETCH_SUCCESS);
});

/**
 * GET /api/v1/customers/:id
 * Returns a specific customer's full profile and history.
 */
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await getCustomerDetails(req.params.id, req.user);

  return sendSuccess(res, { customer }, CUSTOMER_MESSAGES.FETCH_SUCCESS);
});

/**
 * POST /api/v1/customers
 * Creates a new customer record.
 */
export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await createCustomerRecord(req.body, req.user);

  return sendSuccess(res, { customer }, CUSTOMER_MESSAGES.CREATE_SUCCESS, 201);
});

/**
 * PATCH /api/v1/customers/:id
 * Updates an existing customer profile.
 */
export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await updateCustomerRecord(req.params.id, req.body, req.user);

  return sendSuccess(res, { customer }, CUSTOMER_MESSAGES.UPDATE_SUCCESS);
});

/**
 * DELETE /api/v1/customers/:id
 * Deactivates a customer (soft delete).
 */
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await deactivateCustomerRecord(req.params.id, req.user);

  return sendSuccess(res, { customer }, CUSTOMER_MESSAGES.DELETE_SUCCESS);
});
