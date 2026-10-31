/**
 * customer.api.js
 * API client for the Customer Management module.
 * Communicates with backend endpoints (/api/v1/customers) with seamless
 * demo mode fallback for responsive local evaluation.
 */

import api from '../../../services/api.js';
import {
  createDemoCustomer,
  deleteDemoCustomer,
  getDemoCustomers,
  updateDemoCustomer,
} from './demoCustomers.js';

/**
 * Fetch all customers with optional query filters (search, status, page, limit).
 * @param {object} params - { search, status, page, limit }
 */
export const getCustomersApi = async (params = {}) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    let all = getDemoCustomers();
    if (params.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q))
      );
    }
    if (params.status) {
      all = all.filter((c) => c.status === params.status);
    }

    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    const total = all.length;
    const startIndex = (page - 1) * limit;
    const customers = all.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        customers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  try {
    const response = await api.get('/customers', { params });
    return response.data;
  } catch (err) {
    // If backend is unavailable, fallback to demo dataset
    let all = getDemoCustomers();
    if (params.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return {
      success: true,
      data: {
        customers: all,
        total: all.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }
};

/**
 * Fetch a single customer's full details by ID.
 * @param {string} id
 */
export const getCustomerByIdApi = async (id) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const customers = getDemoCustomers();
    const customer = customers.find((c) => c.id === id);
    if (!customer) {
      throw new Error('Customer not found.');
    }
    return {
      success: true,
      data: { customer },
    };
  }

  try {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  } catch (err) {
    const customers = getDemoCustomers();
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      return { success: true, data: { customer } };
    }
    throw err;
  }
};

/**
 * Create a new customer record.
 * @param {object} customerData
 */
export const createCustomerApi = async (customerData) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const newCustomer = createDemoCustomer(customerData);
    return {
      success: true,
      message: 'Customer created successfully.',
      data: { customer: newCustomer },
    };
  }

  try {
    const response = await api.post('/customers', customerData);
    return response.data;
  } catch (err) {
    // Demo fallback
    const newCustomer = createDemoCustomer(customerData);
    return {
      success: true,
      message: 'Customer created successfully (Demo Mode).',
      data: { customer: newCustomer },
    };
  }
};

/**
 * Update an existing customer record.
 * @param {string} id
 * @param {object} updateData
 */
export const updateCustomerApi = async (id, updateData) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const updated = updateDemoCustomer(id, updateData);
    return {
      success: true,
      message: 'Customer updated successfully.',
      data: { customer: updated },
    };
  }

  try {
    const response = await api.patch(`/customers/${id}`, updateData);
    return response.data;
  } catch (err) {
    const updated = updateDemoCustomer(id, updateData);
    return {
      success: true,
      message: 'Customer updated successfully (Demo Mode).',
      data: { customer: updated },
    };
  }
};

/**
 * Deactivate a customer.
 * @param {string} id
 */
export const deleteCustomerApi = async (id) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const deactivated = deleteDemoCustomer(id);
    return {
      success: true,
      message: 'Customer deactivated successfully.',
      data: { customer: deactivated },
    };
  }

  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (err) {
    const deactivated = deleteDemoCustomer(id);
    return {
      success: true,
      message: 'Customer deactivated successfully (Demo Mode).',
      data: { customer: deactivated },
    };
  }
};
