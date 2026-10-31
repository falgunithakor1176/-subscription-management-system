/**
 * product.constants.js
 * Enums and response messages for Product & Variant Management.
 */

export const PRODUCT_TYPES = {
  SERVICE: 'SERVICE',
  PHYSICAL: 'PHYSICAL',
  DIGITAL: 'DIGITAL',
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
};

export const PRODUCT_MESSAGES = {
  CREATED: 'Product created successfully.',
  UPDATED: 'Product updated successfully.',
  ARCHIVED: 'Product archived successfully.',
  NOT_FOUND: 'Product not found.',
  VARIANT_CREATED: 'Product variant created successfully.',
  VARIANT_UPDATED: 'Product variant updated successfully.',
  VARIANT_DELETED: 'Product variant removed successfully.',
  VARIANT_NOT_FOUND: 'Product variant not found.',
  FORBIDDEN_MODIFICATION: 'Forbidden: Only administrators can create or modify products and variants.',
  SKU_EXISTS: 'A product with this SKU already exists.',
};
