import { z } from 'zod';
import { SUBSCRIPTION_STATUSES } from './subscription.constants.js';

// ============================================================
// SUBSCRIPTION VALIDATION SCHEMAS
// ============================================================

const subscriptionItemSchema = z.object({
  productId: z.string({ required_error: 'Product is required' }),
  variantId: z.string().optional().nullable(),
  description: z.string().trim().max(300).optional().nullable(),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  unitPrice: z
    .number({ required_error: 'Unit price is required' })
    .min(0, 'Unit price cannot be negative'),
});

export const createSubscriptionSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
    planId: z.string({ required_error: 'Subscription Plan ID is required' }),
    quotationId: z.string().optional().nullable(),
    billingFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
    startDate: z.string().datetime({ message: 'Valid start date required' }),
    endDate: z.string().datetime().optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
    items: z
      .array(subscriptionItemSchema)
      .min(1, 'Subscription must contain at least one line item'),
  }),
});

export const updateSubscriptionStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      [
        SUBSCRIPTION_STATUSES.ACTIVE,
        SUBSCRIPTION_STATUSES.PAUSED,
        SUBSCRIPTION_STATUSES.CLOSED,
        SUBSCRIPTION_STATUSES.EXPIRED,
      ],
      { errorMap: () => ({ message: 'Invalid subscription status' }) }
    ),
    notes: z.string().trim().max(500).optional().nullable(),
  }),
});

export const subscriptionQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    search: z.string().trim().optional(),
    status: z.enum(Object.values(SUBSCRIPTION_STATUSES)).optional(),
    customerId: z.string().optional(),
    planId: z.string().optional(),
    sortBy: z.enum(['subscriptionNumber', 'amount', 'createdAt', 'nextBillingDate']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }),
});
