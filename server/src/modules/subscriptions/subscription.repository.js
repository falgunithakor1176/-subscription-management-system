import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// SUBSCRIPTION REPOSITORY
// ============================================================

export const generateSubscriptionNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.subscription.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `SUB-${year}-${sequence}`;
};

export const findSubscriptionById = async (id) => {
  return prisma.subscription.findUnique({
    where: { id },
    include: {
      customer: true,
      plan: true,
      quotation: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
};

export const findSubscriptions = async ({
  skip = 0,
  take = 10,
  search,
  status,
  customerId,
  planId,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  const where = buildWhereClause({ search, status, customerId, planId });

  return prisma.subscription.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, companyName: true, email: true },
      },
      plan: {
        select: { id: true, name: true, billingFrequency: true },
      },
      _count: {
        select: { items: true },
      },
    },
  });
};

export const countSubscriptions = async ({ search, status, customerId, planId }) => {
  const where = buildWhereClause({ search, status, customerId, planId });
  return prisma.subscription.count({ where });
};

export const createSubscription = async (data, items) => {
  return prisma.subscription.create({
    data: {
      ...data,
      items: {
        create: items,
      },
    },
    include: {
      customer: true,
      plan: true,
      items: true,
    },
  });
};

export const updateSubscriptionStatus = async (id, status, notes = null) => {
  return prisma.subscription.update({
    where: { id },
    data: {
      status,
      ...(notes && { notes }),
    },
    include: {
      customer: true,
      plan: true,
      items: true,
    },
  });
};

const buildWhereClause = ({ search, status, customerId, planId }) => {
  const where = {};

  if (search) {
    where.OR = [
      { subscriptionNumber: { contains: search, mode: 'insensitive' } },
      { customer: { firstName: { contains: search, mode: 'insensitive' } } },
      { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      { customer: { companyName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (planId) where.planId = planId;

  return where;
};
