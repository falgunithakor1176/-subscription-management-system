import { ROLES } from '../auth/auth.constants.js';
import { PLAN_MESSAGES, PLAN_STATUSES } from './plan.constants.js';
import * as planRepository from './plan.repository.js';
import { ApiError } from '../../utils/ApiError.js';

// ============================================================
// SUBSCRIPTION PLAN SERVICE
// ============================================================

/**
 * Get paginated list of plans
 * - ADMIN & STAFF: See all plans
 * - CUSTOMER: See only ACTIVE plans
 */
export const getPlans = async (query, user) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    billingFrequency,
    productId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  // Customers can only see active plans
  const effectiveStatus = user.role === ROLES.CUSTOMER ? PLAN_STATUSES.ACTIVE : status;

  const skip = (page - 1) * limit;
  const [plans, total] = await Promise.all([
    planRepository.findPlans({
      skip,
      take: limit,
      search,
      status: effectiveStatus,
      billingFrequency,
      productId,
      sortBy,
      sortOrder,
    }),
    planRepository.countPlans({
      search,
      status: effectiveStatus,
      billingFrequency,
      productId,
    }),
  ]);

  return {
    plans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single plan by ID
 * - CUSTOMER: Can only view ACTIVE plans
 */
export const getPlanById = async (id, user) => {
  const plan = await planRepository.findPlanById(id);

  if (!plan) {
    throw ApiError.notFound(PLAN_MESSAGES.NOT_FOUND);
  }

  // Customers can only see active plans
  if (user.role === ROLES.CUSTOMER && plan.status !== PLAN_STATUSES.ACTIVE) {
    throw ApiError.notFound(PLAN_MESSAGES.NOT_FOUND);
  }

  return plan;
};

/**
 * Create a new subscription plan
 * - Only ADMIN can create
 */
export const createPlan = async (data, user) => {
  if (user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PLAN_MESSAGES.FORBIDDEN_CREATE);
  }

  // Verify the product exists and is active
  const product = await planRepository.findProductById(data.productId);
  if (!product) {
    throw ApiError.notFound(PLAN_MESSAGES.PRODUCT_NOT_FOUND);
  }
  if (product.status === 'ARCHIVED') {
    throw ApiError.forbidden(PLAN_MESSAGES.PRODUCT_INACTIVE);
  }

  // Validate dates
  if (data.startDate && data.endDate) {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw ApiError.badRequest(PLAN_MESSAGES.INVALID_DATES);
    }
  }

  const planData = {
    name: data.name,
    description: data.description || null,
    productId: data.productId,
    price: data.price,
    billingFrequency: data.billingFrequency || 'MONTHLY',
    minQuantity: data.minQuantity || 1,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    autoClose: data.autoClose || false,
    status: data.status || 'ACTIVE',
  };

  return planRepository.createPlan(planData);
};

/**
 * Update an existing subscription plan
 * - Only ADMIN can update
 */
export const updatePlan = async (id, data, user) => {
  if (user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PLAN_MESSAGES.FORBIDDEN_UPDATE);
  }

  const existingPlan = await planRepository.findPlanById(id);
  if (!existingPlan) {
    throw ApiError.notFound(PLAN_MESSAGES.NOT_FOUND);
  }

  // If changing the product, verify the new product exists and is active
  if (data.productId && data.productId !== existingPlan.productId) {
    const product = await planRepository.findProductById(data.productId);
    if (!product) {
      throw ApiError.notFound(PLAN_MESSAGES.PRODUCT_NOT_FOUND);
    }
    if (product.status === 'ARCHIVED') {
      throw ApiError.forbidden(PLAN_MESSAGES.PRODUCT_INACTIVE);
    }
  }

  // Validate dates
  const startDate = data.startDate !== undefined ? data.startDate : existingPlan.startDate;
  const endDate = data.endDate !== undefined ? data.endDate : existingPlan.endDate;
  if (startDate && endDate) {
    if (new Date(endDate) <= new Date(startDate)) {
      throw ApiError.badRequest(PLAN_MESSAGES.INVALID_DATES);
    }
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.productId !== undefined) updateData.productId = data.productId;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.billingFrequency !== undefined) updateData.billingFrequency = data.billingFrequency;
  if (data.minQuantity !== undefined) updateData.minQuantity = data.minQuantity;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.autoClose !== undefined) updateData.autoClose = data.autoClose;
  if (data.status !== undefined) updateData.status = data.status;

  return planRepository.updatePlan(id, updateData);
};

/**
 * Deactivate a subscription plan
 * - Only ADMIN can deactivate
 */
export const deactivatePlan = async (id, user) => {
  if (user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PLAN_MESSAGES.FORBIDDEN_DELETE);
  }

  const existingPlan = await planRepository.findPlanById(id);
  if (!existingPlan) {
    throw ApiError.notFound(PLAN_MESSAGES.NOT_FOUND);
  }

  if (existingPlan.status === PLAN_STATUSES.INACTIVE) {
    return existingPlan; // Already inactive
  }

  return planRepository.deactivatePlan(id);
};
