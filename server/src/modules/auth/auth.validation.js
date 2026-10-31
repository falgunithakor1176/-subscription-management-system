/**
 * auth.validation.js
 * Zod schemas for all Authentication module endpoints.
 * All input validation lives here — never in controllers or services.
 */

import { z } from 'zod';

// ─── Password validation rule ────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

// ─── Registration schema ─────────────────────────────────────────────────────
export const registerSchema = z.object({
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
    .email('Please enter a valid email address.'),

  password: passwordSchema,

  phone: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

// ─── Login schema ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),

  password: z
    .string()
    .min(1, 'Password is required.'),
});

// ─── Create staff schema (ADMIN only) ────────────────────────────────────────
export const createStaffSchema = z.object({
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
    .email('Please enter a valid email address.'),

  password: passwordSchema,

  phone: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

// ─── Change password schema ───────────────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
