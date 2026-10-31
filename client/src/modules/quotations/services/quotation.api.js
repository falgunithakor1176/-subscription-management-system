/**
 * quotation.api.js
 * API communication for Quotation Management with demo fallback.
 */

import api from '../../../services/api.js';
import {
  createDemoQuotation,
  getDemoQuotations,
  updateDemoQuotation,
  updateDemoQuotationStatus,
} from './demoQuotations.js';

export const getQuotationsApi = async (params = {}) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    let all = getDemoQuotations();

    const storedUser = localStorage.getItem('auth_user');
    let currentUser = null;
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {}
    }

    // Role-based filtering: customer only sees their own quotes
    if (currentUser?.role === 'CUSTOMER') {
      all = all.filter(
        (q) =>
          q.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
          q.customerId === 'cust-001'
      );
    }

    if (params.status && params.status !== 'ALL') {
      all = all.filter((q) => q.status === params.status);
    }

    if (params.search) {
      const query = params.search.toLowerCase();
      all = all.filter(
        (q) =>
          q.quotationNumber?.toLowerCase().includes(query) ||
          q.customerName?.toLowerCase().includes(query) ||
          q.customerCompany?.toLowerCase().includes(query) ||
          q.notes?.toLowerCase().includes(query)
      );
    }

    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    const total = all.length;
    const startIndex = (page - 1) * limit;
    const quotations = all.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        quotations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  try {
    const response = await api.get('/quotations', { params });
    return response.data;
  } catch (error) {
    console.warn('Real API failed, falling back to demo quotations:', error.message);
    const all = getDemoQuotations();
    return {
      success: true,
      data: {
        quotations: all,
        total: all.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }
};

export const getQuotationByIdApi = async (id) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const quotes = getDemoQuotations();
    const found = quotes.find((q) => q.id === id);
    if (!found) throw new Error('Quotation not found');
    return { success: true, data: found };
  }

  try {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  } catch (error) {
    const quotes = getDemoQuotations();
    const found = quotes.find((q) => q.id === id);
    if (found) return { success: true, data: found };
    throw error;
  }
};

export const createQuotationApi = async (data) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const newQuote = createDemoQuotation(data);
    return { success: true, data: newQuote, message: 'Quotation created successfully' };
  }

  try {
    const response = await api.post('/quotations', data);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    const newQuote = createDemoQuotation(data);
    return { success: true, data: newQuote, message: 'Quotation created in demo storage' };
  }
};

export const updateQuotationApi = async (id, data) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const updated = updateDemoQuotation(id, data);
    if (!updated) throw new Error('Quotation not found');
    return { success: true, data: updated, message: 'Quotation updated successfully' };
  }

  try {
    const response = await api.patch(`/quotations/${id}`, data);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    const updated = updateDemoQuotation(id, data);
    return { success: true, data: updated, message: 'Quotation updated in demo storage' };
  }
};

export const updateQuotationStatusApi = async (id, status, reason = null) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const updated = updateDemoQuotationStatus(id, status);
    if (!updated) throw new Error('Quotation not found');
    return { success: true, data: updated, message: `Quotation status updated to ${status}` };
  }

  try {
    const response = await api.patch(`/quotations/${id}/status`, { status, reason });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    const updated = updateDemoQuotationStatus(id, status);
    return { success: true, data: updated, message: `Quotation status updated to ${status}` };
  }
};
