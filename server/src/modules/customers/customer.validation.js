/**
 * customer.validation.js
 * Zod validation schemas for the Customer Management module.
 */

import { z } from 'zod';
import { CUSTOMER_STATUSES } from './customer.constants.js';

export const createCustomerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(50, 'First name must not exceed 50 characters.'),

  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required.')
    .max(50, 'Last name must not exceed 50 characters.'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required.')
    .email('Please provide a valid email address.'),

  phone: z
    .string()
    .trim()
    .max(30, 'Phone number must not exceed 30 characters.')
    .optional()
    .nullable(),

  companyName: z
    .string()
    .trim()
    .max(100, 'Company name must not exceed 100 characters.')
    .optional()
    .nullable(),

  address: z
    .string()
    .trim()
    .max(200, 'Address must not exceed 200 characters.')
    .optional()
    .nullable(),

  city: z
    .string()
    .trim()
    .max(100, 'City must not exceed 100 characters.')
    .optional()
    .nullable(),

  state: z
    .string()
    .trim()
    .max(100, 'State must not exceed 100 characters.')
    .optional()
    .nullable(),

  country: z
    .string()
    .trim()
    .max(100, 'Country must not exceed 100 characters.')
    .optional()
    .nullable(),

  postalCode: z
    .string()
    .trim()
    .max(20, 'Postal code must not exceed 20 characters.')
    .optional()
    .nullable(),

  status: z
    .enum([CUSTOMER_STATUSES.ACTIVE, CUSTOMER_STATUSES.INACTIVE], {
      errorMap: () => ({ message: 'Status must be either ACTIVE or INACTIVE.' }),
    })
    .optional(),

  notes: z
    .string()
    .trim()
    .max(1000, 'Notes must not exceed 1000 characters.')
    .optional()
    .nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
