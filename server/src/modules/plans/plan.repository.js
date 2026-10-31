import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// SUBSCRIPTION PLAN REPOSITORY
// ============================================================

/**
 * Find a plan by ID with product relation
 */
export const findPlanById = async (id) => {
  return prisma.subscriptionPlan.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          salesPrice: true,
        },
      },
    },
  });
};

/**
 * Find plans with pagination, search, and filters
 */
export const findPlans = async ({
  skip = 0,
  take = 10,
  search,
  status,
  billingFrequency,
  productId,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  const where = buildWhereClause({ search, status, billingFrequency, productId });

  return prisma.subscriptionPlan.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Count plans matching filters
 */
export const countPlans = async ({ search, status, billingFrequency, productId }) => {
  const where = buildWhereClause({ search, status, billingFrequency, productId });
  return prisma.subscriptionPlan.count({ where });
};

/**
 * Create a new subscription plan
 */
export const createPlan = async (data) => {
  return prisma.subscriptionPlan.create({
    data,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Update a subscription plan
 */
export const updatePlan = async (id, data) => {
  return prisma.subscriptionPlan.update({
    where: { id },
    data,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Deactivate a subscription plan (soft delete)
 */
export const deactivatePlan = async (id) => {
  return prisma.subscriptionPlan.update({
    where: { id },
    data: { status: 'INACTIVE' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Check if a product exists
 */
export const findProductById = async (productId) => {
  return prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, status: true },
  });
};

// ============================================================
// HELPER: Build where clause
// ============================================================

const buildWhereClause = ({ search, status, billingFrequency, productId }) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (billingFrequency) {
    where.billingFrequency = billingFrequency;
  }

  if (productId) {
    where.productId = productId;
  }

  return where;
};
