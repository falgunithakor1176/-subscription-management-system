/**
 * product.service.js
 * Business logic and RBAC enforcement for Product and Variant Management.
 */

import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../auth/auth.constants.js';
import {
  PRODUCT_MESSAGES,
  PRODUCT_STATUSES,
} from './product.constants.js';
import {
  archiveProduct as repoArchiveProduct,
  countProducts,
  createProduct as repoCreateProduct,
  createProductVariant as repoCreateVariant,
  deleteProductVariant as repoDeleteVariant,
  findProductById,
  findProductBySku,
  findProducts,
  findVariantById,
  updateProduct as repoUpdateProduct,
  updateProductVariant as repoUpdateVariant,
} from './product.repository.js';

export const listProducts = async (requestingUser, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Customers can only view ACTIVE products
  const statusFilter =
    requestingUser.role === ROLES.CUSTOMER
      ? PRODUCT_STATUSES.ACTIVE
      : query.status;

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(query.productType && { productType: query.productType }),
    ...(query.search && { search: query.search.trim() }),
  };

  const [products, total] = await Promise.all([
    findProducts({ ...filters, skip, take: limit }),
    countProducts(filters),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getProductDetails = async (id, requestingUser) => {
  const product = await findProductById(id, true);

  if (!product) {
    throw ApiError.notFound(PRODUCT_MESSAGES.NOT_FOUND);
  }

  // Customer cannot view archived products
  if (requestingUser.role === ROLES.CUSTOMER && product.status !== PRODUCT_STATUSES.ACTIVE) {
    throw ApiError.notFound(PRODUCT_MESSAGES.NOT_FOUND);
  }

  return product;
};

export const createProduct = async (productData, requestingUser) => {
  // RBAC: Only Admin can create products
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PRODUCT_MESSAGES.FORBIDDEN_MODIFICATION);
  }

  if (productData.sku) {
    const existingSku = await findProductBySku(productData.sku);
    if (existingSku) {
      throw ApiError.conflict(PRODUCT_MESSAGES.SKU_EXISTS);
    }
  }

  return repoCreateProduct(productData);
};

export const updateProduct = async (id, updateData, requestingUser) => {
  // RBAC: Only Admin can update products
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PRODUCT_MESSAGES.FORBIDDEN_MODIFICATION);
  }

  const existing = await findProductById(id, false);
  if (!existing) {
    throw ApiError.notFound(PRODUCT_MESSAGES.NOT_FOUND);
  }

  if (updateData.sku && updateData.sku !== existing.sku) {
    const existingSku = await findProductBySku(updateData.sku);
    if (existingSku && existingSku.id !== id) {
      throw ApiError.conflict(PRODUCT_MESSAGES.SKU_EXISTS);
    }
  }

  return repoUpdateProduct(id, updateData);
};

export const archiveProduct = async (id, requestingUser) => {
  // RBAC: Only Admin can archive products
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PRODUCT_MESSAGES.FORBIDDEN_MODIFICATION);
  }

  const existing = await findProductById(id, false);
  if (!existing) {
    throw ApiError.notFound(PRODUCT_MESSAGES.NOT_FOUND);
  }

  return repoArchiveProduct(id);
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const addVariant = async (productId, variantData, requestingUser) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PRODUCT_MESSAGES.FORBIDDEN_MODIFICATION);
  }

  const product = await findProductById(productId, false);
  if (!product) {
    throw ApiError.notFound(PRODUCT_MESSAGES.NOT_FOUND);
  }

  return repoCreateVariant(productId, variantData);
};

export const updateVariant = async (variantId, updateData, requestingUser) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PRODUCT_MESSAGES.FORBIDDEN_MODIFICATION);
  }

  const variant = await findVariantById(variantId);
  if (!variant) {
    throw ApiError.notFound(PRODUCT_MESSAGES.VARIANT_NOT_FOUND);
  }

  return repoUpdateVariant(variantId, updateData);
};

export const removeVariant = async (variantId, requestingUser) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw ApiError.forbidden(PRODUCT_MESSAGES.FORBIDDEN_MODIFICATION);
  }

  const variant = await findVariantById(variantId);
  if (!variant) {
    throw ApiError.notFound(PRODUCT_MESSAGES.VARIANT_NOT_FOUND);
  }

  return repoDeleteVariant(variantId);
};
