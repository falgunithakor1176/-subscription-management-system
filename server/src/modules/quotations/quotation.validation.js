import { z } from 'zod';
import { QUOTATION_STATUSES } from './quotation.constants.js';

// ============================================================
// QUOTATION VALIDATION SCHEMAS
// ============================================================

const quotationItemSchema = z.object({
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
  discountPct: z
    .number()
    .min(0, 'Discount percentage cannot be negative')
    .max(100, 'Discount percentage cannot exceed 100%')
    .default(0)
    .optional(),
  taxPct: z
    .number()
    .min(0, 'Tax percentage cannot be negative')
    .max(100, 'Tax percentage cannot exceed 100%')
    .default(0)
    .optional(),
});

export const createQuotationSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
    validityDate: z.string().datetime().optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
    items: z
      .array(quotationItemSchema)
      .min(1, 'Quotation must contain at least one line item'),
  }),
});

export const updateQuotationSchema = z.object({
  body: z.object({
    validityDate: z.string().datetime().optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
    items: z
      .array(quotationItemSchema)
      .min(1, 'Quotation must contain at least one line item')
      .optional(),
  }),
});

export const updateQuotationStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      [
        QUOTATION_STATUSES.SENT,
        QUOTATION_STATUSES.ACCEPTED,
        QUOTATION_STATUSES.REJECTED,
        QUOTATION_STATUSES.CANCELLED,
      ],
      { errorMap: () => ({ message: 'Invalid quotation status transition' }) }
    ),
    reason: z.string().trim().max(500).optional().nullable(),
  }),
});

export const quotationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    search: z.string().trim().optional(),
    status: z.enum(Object.values(QUOTATION_STATUSES)).optional(),
    customerId: z.string().optional(),
    sortBy: z.enum(['quotationNumber', 'totalAmount', 'createdAt', 'validityDate']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }),
});
