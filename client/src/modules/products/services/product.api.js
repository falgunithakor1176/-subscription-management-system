/**
 * product.api.js
 * API communication for Product & Variant Management with demo fallback.
 */

import api from '../../../services/api.js';
import {
  addDemoVariant,
  archiveDemoProduct,
  createDemoProduct,
  deleteDemoVariant,
  getDemoProducts,
  updateDemoProduct,
  updateDemoVariant,
} from './demoProducts.js';

export const getProductsApi = async (params = {}) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    let all = getDemoProducts();

    if (params.productType && params.productType !== 'ALL') {
      all = all.filter((p) => p.productType === params.productType);
    }
    if (params.status && params.status !== 'ALL') {
      all = all.filter((p) => p.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    const total = all.length;
    const startIndex = (page - 1) * limit;
    const products = all.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (err) {
    let all = getDemoProducts();
    if (params.search) {
      const q = params.search.toLowerCase();
      all = all.filter((p) => p.name.toLowerCase().includes(q));
    }
    return {
      success: true,
      data: {
        products: all,
        total: all.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }
};

export const getProductByIdApi = async (id) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const products = getDemoProducts();
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found.');
    return { success: true, data: { product } };
  }

  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (err) {
    const products = getDemoProducts();
    const product = products.find((p) => p.id === id);
    if (product) return { success: true, data: { product } };
    throw err;
  }
};

export const createProductApi = async (data) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const product = createDemoProduct(data);
    return { success: true, data: { product } };
  }

  try {
    const response = await api.post('/products', data);
    return response.data;
  } catch (err) {
    const product = createDemoProduct(data);
    return { success: true, data: { product } };
  }
};

export const updateProductApi = async (id, data) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const product = updateDemoProduct(id, data);
    return { success: true, data: { product } };
  }

  try {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  } catch (err) {
    const product = updateDemoProduct(id, data);
    return { success: true, data: { product } };
  }
};

export const deleteProductApi = async (id) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const product = archiveDemoProduct(id);
    return { success: true, data: { product } };
  }

  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (err) {
    const product = archiveDemoProduct(id);
    return { success: true, data: { product } };
  }
};

export const createVariantApi = async (productId, data) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const variant = addDemoVariant(productId, data);
    return { success: true, data: { variant } };
  }

  try {
    const response = await api.post(`/products/${productId}/variants`, data);
    return response.data;
  } catch (err) {
    const variant = addDemoVariant(productId, data);
    return { success: true, data: { variant } };
  }
};

export const updateVariantApi = async (productId, variantId, data) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const variant = updateDemoVariant(productId, variantId, data);
    return { success: true, data: { variant } };
  }

  try {
    const response = await api.patch(`/products/${productId}/variants/${variantId}`, data);
    return response.data;
  } catch (err) {
    const variant = updateDemoVariant(productId, variantId, data);
    return { success: true, data: { variant } };
  }
};

export const deleteVariantApi = async (productId, variantId) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    deleteDemoVariant(productId, variantId);
    return { success: true };
  }

  try {
    const response = await api.delete(`/products/${productId}/variants/${variantId}`);
    return response.data;
  } catch (err) {
    deleteDemoVariant(productId, variantId);
    return { success: true };
  }
};
