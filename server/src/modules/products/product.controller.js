/**
 * product.controller.js
 * Express route handlers for Product & Variant Management.
 */

import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendPaginated, sendSuccess } from '../../utils/ApiResponse.js';
import { PRODUCT_MESSAGES } from './product.constants.js';
import {
  addVariant,
  archiveProduct,
  createProduct,
  getProductDetails,
  listProducts,
  removeVariant,
  updateProduct,
  updateVariant,
} from './product.service.js';

export const getProducts = asyncHandler(async (req, res) => {
  const result = await listProducts(req.user, req.query);
  return sendPaginated(
    res,
    result.products,
    result.total,
    result.page,
    result.limit,
    'Products fetched successfully.'
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await getProductDetails(req.params.id, req.user);
  return sendSuccess(res, { product }, 'Product fetched successfully.');
});

export const postProduct = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body, req.user);
  return sendSuccess(res, { product }, PRODUCT_MESSAGES.CREATED, 201);
});

export const patchProduct = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.params.id, req.body, req.user);
  return sendSuccess(res, { product }, PRODUCT_MESSAGES.UPDATED);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await archiveProduct(req.params.id, req.user);
  return sendSuccess(res, { product }, PRODUCT_MESSAGES.ARCHIVED);
});

// ─── Variants ─────────────────────────────────────────────────────────────────

export const postVariant = asyncHandler(async (req, res) => {
  const variant = await addVariant(req.params.id, req.body, req.user);
  return sendSuccess(res, { variant }, PRODUCT_MESSAGES.VARIANT_CREATED, 201);
});

export const patchVariant = asyncHandler(async (req, res) => {
  const variant = await updateVariant(req.params.variantId, req.body, req.user);
  return sendSuccess(res, { variant }, PRODUCT_MESSAGES.VARIANT_UPDATED);
});

export const deleteVariant = asyncHandler(async (req, res) => {
  await removeVariant(req.params.variantId, req.user);
  return sendSuccess(res, null, PRODUCT_MESSAGES.VARIANT_DELETED);
});
