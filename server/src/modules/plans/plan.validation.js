import { z } from 'zod';
import { BILLING_FREQUENCIES, PLAN_STATUSES } from './plan.constants.js';

// ============================================================
// SUBSCRIPTION PLAN VALIDATION SCHEMAS
// ============================================================

export const createPlanSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Plan name is required' })
      .trim()
      .min(2, 'Plan name must be at least 2 characters')
      .max(100, 'Plan name must not exceed 100 characters'),
    description: z
      .string()
      .trim()
      .max(500, 'Description must not exceed 500 characters')
      .optional()
      .nullable(),
    productId: z
      .string({ required_error: 'Product ID is required' })
      .uuid('Invalid product ID format'),
    price: z
      .number({ required_error: 'Price is required' })
      .positive('Price must be a positive number')
      .max(999999.99, 'Price must not exceed 999,999.99'),
    billingFrequency: z
      .enum(Object.values(BILLING_FREQUENCIES), {
        errorMap: () => ({ message: 'Invalid billing frequency. Must be DAILY, WEEKLY, MONTHLY, or YEARLY' }),
      })
      .default('MONTHLY'),
    minQuantity: z
      .number()
      .int('Minimum quantity must be a whole number')
      .min(1, 'Minimum quantity must be at least 1')
      .max(10000, 'Minimum quantity must not exceed 10,000')
      .default(1),
    startDate: z
      .string()
      .datetime({ message: 'Invalid start date format' })
      .optional()
      .nullable(),
    endDate: z
      .string()
      .datetime({ message: 'Invalid end date format' })
      .optional()
      .nullable(),
    autoClose: z
      .boolean()
      .default(false),
    status: z
      .enum(Object.values(PLAN_STATUSES), {
        errorMap: () => ({ message: 'Invalid status. Must be ACTIVE or INACTIVE' }),
      })
      .default('ACTIVE'),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] }
  ),
});

export const updatePlanSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Plan name must be at least 2 characters')
      .max(100, 'Plan name must not exceed 100 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Description must not exceed 500 characters')
      .optional()
      .nullable(),
    productId: z
      .string()
      .uuid('Invalid product ID format')
      .optional(),
    price: z
      .number()
      .positive('Price must be a positive number')
      .max(999999.99, 'Price must not exceed 999,999.99')
      .optional(),
    billingFrequency: z
      .enum(Object.values(BILLING_FREQUENCIES), {
        errorMap: () => ({ message: 'Invalid billing frequency' }),
      })
      .optional(),
    minQuantity: z
      .number()
      .int('Minimum quantity must be a whole number')
      .min(1, 'Minimum quantity must be at least 1')
      .max(10000, 'Minimum quantity must not exceed 10,000')
      .optional(),
    startDate: z
      .string()
      .datetime({ message: 'Invalid start date format' })
      .optional()
      .nullable(),
    endDate: z
      .string()
      .datetime({ message: 'Invalid end date format' })
      .optional()
      .nullable(),
    autoClose: z
      .boolean()
      .optional(),
    status: z
      .enum(Object.values(PLAN_STATUSES), {
        errorMap: () => ({ message: 'Invalid status' }),
      })
      .optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] }
  ),
});

export const planQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    search: z.string().trim().optional(),
    status: z.enum(Object.values(PLAN_STATUSES)).optional(),
    billingFrequency: z.enum(Object.values(BILLING_FREQUENCIES)).optional(),
    productId: z.string().uuid().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt', 'billingFrequency']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }),
});
