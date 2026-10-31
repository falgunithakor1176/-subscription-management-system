import { ROLES } from '../auth/auth.constants.js';
import { SUBSCRIPTION_MESSAGES, SUBSCRIPTION_STATUSES } from './subscription.constants.js';
import * as subscriptionRepository from './subscription.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import prisma from '../../config/database.js';

// ============================================================
// SUBSCRIPTION SERVICE
// ============================================================

export const getSubscriptions = async (query, user) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    planId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  let customerId = query.customerId;

  if (user.role === ROLES.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });
    if (!customer) {
      return { subscriptions: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    customerId = customer.id;
  }

  const skip = (page - 1) * limit;
  const [subscriptions, total] = await Promise.all([
    subscriptionRepository.findSubscriptions({
      skip,
      take: limit,
      search,
      status,
      customerId,
      planId,
      sortBy,
      sortOrder,
    }),
    subscriptionRepository.countSubscriptions({
      search,
      status,
      customerId,
      planId,
    }),
  ]);

  return {
    subscriptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSubscriptionById = async (id, user) => {
  const subscription = await subscriptionRepository.findSubscriptionById(id);
  if (!subscription) {
    throw ApiError.notFound(SUBSCRIPTION_MESSAGES.NOT_FOUND);
  }

  if (user.role === ROLES.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });
    if (!customer || subscription.customerId !== customer.id) {
      throw ApiError.forbidden(SUBSCRIPTION_MESSAGES.FORBIDDEN_ACCESS);
    }
  }

  return subscription;
};

export const createSubscription = async (data, user) => {
  if (user.role === ROLES.CUSTOMER) {
    throw ApiError.forbidden(SUBSCRIPTION_MESSAGES.FORBIDDEN_ACTION);
  }

  const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
  if (!customer) throw ApiError.notFound(SUBSCRIPTION_MESSAGES.CUSTOMER_NOT_FOUND);

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: data.planId } });
  if (!plan) throw ApiError.notFound(SUBSCRIPTION_MESSAGES.PLAN_NOT_FOUND);

  let totalAmount = 0;
  const items = data.items.map((item) => {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = parseFloat(item.unitPrice) || 0;
    const lineTotal = qty * price;
    totalAmount += lineTotal;

    return {
      productId: item.productId,
      variantId: item.variantId || null,
      description: item.description || null,
      quantity: qty,
      unitPrice: price,
      lineTotal: parseFloat(lineTotal.toFixed(2)),
    };
  });

  const subscriptionNumber = await subscriptionRepository.generateSubscriptionNumber();

  // Next billing date calculation
  const start = new Date(data.startDate);
  const nextBilling = new Date(start);
  if (data.billingFrequency === 'DAILY') nextBilling.setDate(nextBilling.getDate() + 1);
  else if (data.billingFrequency === 'WEEKLY') nextBilling.setDate(nextBilling.getDate() + 7);
  else if (data.billingFrequency === 'YEARLY') nextBilling.setFullYear(nextBilling.getFullYear() + 1);
  else nextBilling.setMonth(nextBilling.getMonth() + 1);

  const subData = {
    subscriptionNumber,
    customerId: data.customerId,
    planId: data.planId,
    quotationId: data.quotationId || null,
    createdById: user.id,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
    startDate: start,
    endDate: data.endDate ? new Date(data.endDate) : null,
    nextBillingDate: nextBilling,
    billingFrequency: data.billingFrequency,
    amount: parseFloat(totalAmount.toFixed(2)),
    notes: data.notes || null,
  };

  return subscriptionRepository.createSubscription(subData, items);
};

export const updateSubscriptionStatus = async (id, body, user) => {
  if (user.role === ROLES.CUSTOMER) {
    throw ApiError.forbidden(SUBSCRIPTION_MESSAGES.FORBIDDEN_ACTION);
  }

  const subscription = await subscriptionRepository.findSubscriptionById(id);
  if (!subscription) throw ApiError.notFound(SUBSCRIPTION_MESSAGES.NOT_FOUND);

  return subscriptionRepository.updateSubscriptionStatus(id, body.status, body.notes);
};
