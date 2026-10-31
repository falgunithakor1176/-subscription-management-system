/**
 * product.routes.js
 * Express routing definitions for Products & Product Variants.
 * Enforces authentication and Admin-only RBAC mutation restrictions.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { adminOnly } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/error.middleware.js';
import {
  createProductSchema,
  createVariantSchema,
  updateProductSchema,
  updateVariantSchema,
} from './product.validation.js';
import {
  deleteProduct,
  deleteVariant,
  getProductById,
  getProducts,
  patchProduct,
  patchVariant,
  postProduct,
  postVariant,
} from './product.controller.js';

const router = Router();

// All product routes require valid authentication
router.use(authenticate);

/**
 * GET /api/v1/products
 * Read catalog: Admin (all), Staff (all), Customer (active products only)
 */
router.get('/', getProducts);

/**
 * GET /api/v1/products/:id
 * Read product details with variants
 */
router.get('/:id', getProductById);

/**
 * POST /api/v1/products
 * Admin only: Create new product
 */
router.post('/', adminOnly, validate(createProductSchema), postProduct);

/**
 * PATCH /api/v1/products/:id
 * Admin only: Update existing product
 */
router.patch('/:id', adminOnly, validate(updateProductSchema), patchProduct);

/**
 * DELETE /api/v1/products/:id
 * Admin only: Archive product
 */
router.delete('/:id', adminOnly, deleteProduct);

/**
 * POST /api/v1/products/:id/variants
 * Admin only: Add variant to product
 */
router.post('/:id/variants', adminOnly, validate(createVariantSchema), postVariant);

/**
 * PATCH /api/v1/products/:id/variants/:variantId
 * Admin only: Update variant
 */
router.patch('/:id/variants/:variantId', adminOnly, validate(updateVariantSchema), patchVariant);

/**
 * DELETE /api/v1/products/:id/variants/:variantId
 * Admin only: Delete variant
 */
router.delete('/:id/variants/:variantId', adminOnly, deleteVariant);

export default router;
