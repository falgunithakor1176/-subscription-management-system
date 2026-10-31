import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { QUOTATION_MESSAGES } from './quotation.constants.js';
import * as quotationService from './quotation.service.js';

// ============================================================
// QUOTATION CONTROLLER
// ============================================================

/**
 * GET /api/v1/quotations
 * List quotations with pagination, search, and filters
 */
export const getQuotations = asyncHandler(async (req, res) => {
  const { quotations, pagination } = await quotationService.getQuotations(
    req.query,
    req.user
  );

  sendPaginated(res, quotations, pagination, QUOTATION_MESSAGES.LIST_FETCHED);
});

/**
 * GET /api/v1/quotations/:id
 * Get single quotation by ID
 */
export const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await quotationService.getQuotationById(
    req.params.id,
    req.user
  );

  sendSuccess(res, quotation, QUOTATION_MESSAGES.FETCHED);
});

/**
 * POST /api/v1/quotations
 * Create a new quotation (ADMIN & STAFF only)
 */
export const createQuotation = asyncHandler(async (req, res) => {
  const quotation = await quotationService.createQuotation(req.body, req.user);

  sendSuccess(res, quotation, QUOTATION_MESSAGES.CREATED, 201);
});

/**
 * PATCH /api/v1/quotations/:id
 * Update quotation line items or terms (ADMIN & STAFF only)
 */
export const updateQuotation = asyncHandler(async (req, res) => {
  const quotation = await quotationService.updateQuotation(
    req.params.id,
    req.body,
    req.user
  );

  sendSuccess(res, quotation, QUOTATION_MESSAGES.UPDATED);
});

/**
 * PATCH /api/v1/quotations/:id/status
 * Update quotation status (SENT, ACCEPTED, REJECTED, CANCELLED)
 */
export const updateQuotationStatus = asyncHandler(async (req, res) => {
  const quotation = await quotationService.updateQuotationStatus(
    req.params.id,
    req.body,
    req.user
  );

  sendSuccess(res, quotation, QUOTATION_MESSAGES.STATUS_UPDATED);
});
