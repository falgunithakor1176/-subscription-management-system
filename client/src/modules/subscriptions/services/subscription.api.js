/**
 * subscription.api.js
 * API communication for Subscription Management with demo fallback.
 */

import api from '../../../services/api.js';
import {
  createDemoSubscription,
  getDemoSubscriptions,
  updateDemoSubscriptionStatus,
} from './demoSubscriptions.js';

export const getSubscriptionsApi = async (params = {}) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    let all = getDemoSubscriptions();

    const storedUser = localStorage.getItem('auth_user');
    let currentUser = null;
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {}
    }

    if (currentUser?.role === 'CUSTOMER') {
      all = all.filter(
        (s) =>
          s.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
          s.customerId === 'cust-001'
      );
    }

    if (params.status && params.status !== 'ALL') {
      all = all.filter((s) => s.status === params.status);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (s) =>
          s.subscriptionNumber?.toLowerCase().includes(q) ||
          s.customerName?.toLowerCase().includes(q) ||
          s.customerCompany?.toLowerCase().includes(q) ||
          s.planName?.toLowerCase().includes(q)
      );
    }

    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    const total = all.length;
    const startIndex = (page - 1) * limit;
    const subscriptions = all.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        subscriptions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  try {
    const response = await api.get('/subscriptions', { params });
    return response.data;
  } catch (error) {
    const all = getDemoSubscriptions();
    return {
      success: true,
      data: {
        subscriptions: all,
        total: all.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }
};

export const getSubscriptionByIdApi = async (id) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const subs = getDemoSubscriptions();
    const found = subs.find((s) => s.id === id);
    if (!found) throw new Error('Subscription not found');
    return { success: true, data: found };
  }

  try {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  } catch (error) {
    const subs = getDemoSubscriptions();
    const found = subs.find((s) => s.id === id);
    if (found) return { success: true, data: found };
    throw error;
  }
};

export const createSubscriptionApi = async (data) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const newSub = createDemoSubscription(data);
    return { success: true, data: newSub, message: 'Subscription activated successfully' };
  }

  try {
    const response = await api.post('/subscriptions', data);
    return response.data;
  } catch (error) {
    const newSub = createDemoSubscription(data);
    return { success: true, data: newSub, message: 'Subscription created in demo storage' };
  }
};

export const updateSubscriptionStatusApi = async (id, status, notes = null) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const updated = updateDemoSubscriptionStatus(id, status);
    return { success: true, data: updated, message: `Subscription marked as ${status}` };
  }

  try {
    const response = await api.patch(`/subscriptions/${id}/status`, { status, notes });
    return response.data;
  } catch (error) {
    const updated = updateDemoSubscriptionStatus(id, status);
    return { success: true, data: updated, message: `Subscription marked as ${status}` };
  }
};
