import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { PLAN_MESSAGES } from './plan.constants.js';
import * as planService from './plan.service.js';

// ============================================================
// SUBSCRIPTION PLAN CONTROLLER
// ============================================================

/**
 * GET /api/v1/plans
 * List plans with pagination, search, and filters
 */
export const getPlans = asyncHandler(async (req, res) => {
  const { plans, pagination } = await planService.getPlans(req.query, req.user);

  sendPaginated(res, plans, pagination, PLAN_MESSAGES.LIST_FETCHED);
});

/**
 * GET /api/v1/plans/:id
 * Get a single plan by ID
 */
export const getPlanById = asyncHandler(async (req, res) => {
  const plan = await planService.getPlanById(req.params.id, req.user);

  sendSuccess(res, plan, PLAN_MESSAGES.FETCHED);
});

/**
 * POST /api/v1/plans
 * Create a new subscription plan (ADMIN only)
 */
export const createPlan = asyncHandler(async (req, res) => {
  const plan = await planService.createPlan(req.body, req.user);

  sendSuccess(res, plan, PLAN_MESSAGES.CREATED, 201);
});

/**
 * PATCH /api/v1/plans/:id
 * Update a subscription plan (ADMIN only)
 */
export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await planService.updatePlan(req.params.id, req.body, req.user);

  sendSuccess(res, plan, PLAN_MESSAGES.UPDATED);
});

/**
 * DELETE /api/v1/plans/:id
 * Deactivate a subscription plan (ADMIN only)
 */
export const deactivatePlan = asyncHandler(async (req, res) => {
  const plan = await planService.deactivatePlan(req.params.id, req.user);

  sendSuccess(res, plan, PLAN_MESSAGES.DEACTIVATED);
});
