/**
 * product.validation.js
 * Zod validation schemas for Product and Product Variant endpoints.
 */

import { z } from 'zod';
import { PRODUCT_STATUSES, PRODUCT_TYPES } from './product.constants.js';

export const createProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required.' }).trim().min(2, 'Name must be at least 2 characters.'),
  description: z.string().trim().optional().nullable(),
  productType: z.enum([PRODUCT_TYPES.SERVICE, PRODUCT_TYPES.PHYSICAL, PRODUCT_TYPES.DIGITAL]).default(PRODUCT_TYPES.SERVICE),
  salesPrice: z.coerce.number().positive('Sales price must be greater than 0.'),
  costPrice: z.coerce.number().nonnegative('Cost price cannot be negative.').optional().nullable(),
  status: z.enum([PRODUCT_STATUSES.ACTIVE, PRODUCT_STATUSES.ARCHIVED]).default(PRODUCT_STATUSES.ACTIVE),
  sku: z.string().trim().optional().nullable(),
  unit: z.string().trim().optional().nullable(),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Variant name is required.'),
        description: z.string().trim().optional().nullable(),
        additionalPrice: z.coerce.number().default(0),
        sku: z.string().trim().optional().nullable(),
        isActive: z.boolean().default(true),
      })
    )
    .optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().optional().nullable(),
  productType: z.enum([PRODUCT_TYPES.SERVICE, PRODUCT_TYPES.PHYSICAL, PRODUCT_TYPES.DIGITAL]).optional(),
  salesPrice: z.coerce.number().positive('Sales price must be greater than 0.').optional(),
  costPrice: z.coerce.number().nonnegative('Cost price cannot be negative.').optional().nullable(),
  status: z.enum([PRODUCT_STATUSES.ACTIVE, PRODUCT_STATUSES.ARCHIVED]).optional(),
  sku: z.string().trim().optional().nullable(),
  unit: z.string().trim().optional().nullable(),
});

export const createVariantSchema = z.object({
  name: z.string({ required_error: 'Variant name is required.' }).trim().min(1, 'Variant name is required.'),
  description: z.string().trim().optional().nullable(),
  additionalPrice: z.coerce.number().default(0),
  sku: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateVariantSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional().nullable(),
  additionalPrice: z.coerce.number().optional(),
  sku: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
});
