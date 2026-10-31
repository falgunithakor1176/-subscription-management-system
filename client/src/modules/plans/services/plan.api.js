/**
 * plan.api.js
 * API communication for Subscription Plan Management with demo fallback.
 */

import api from '../../../services/api.js';
import {
  createDemoPlan,
  deactivateDemoPlan,
  getDemoPlans,
  updateDemoPlan,
} from './demoPlans.js';

export const getPlansApi = async (params = {}) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    let all = getDemoPlans();

    // Role-based filtering in demo mode: if role is CUSTOMER, only ACTIVE plans
    const storedUser = localStorage.getItem('auth_user');
    let currentUser = null;
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {}
    }
    if (currentUser?.role === 'CUSTOMER') {
      all = all.filter((p) => p.status === 'ACTIVE');
    } else if (params.status && params.status !== 'ALL') {
      all = all.filter((p) => p.status === params.status);
    }

    if (params.billingFrequency && params.billingFrequency !== 'ALL') {
      all = all.filter((p) => p.billingFrequency === params.billingFrequency);
    }

    if (params.productId) {
      all = all.filter((p) => p.productId === params.productId);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.productName && p.productName.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    const total = all.length;
    const startIndex = (page - 1) * limit;
    const plans = all.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        plans,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  try {
    const response = await api.get('/plans', { params });
    return response.data;
  } catch (error) {
    console.warn('Real API failed, falling back to demo plans:', error.message);
    const all = getDemoPlans();
    return {
      success: true,
      data: {
        plans: all,
        total: all.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }
};

export const getPlanByIdApi = async (id) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const plans = getDemoPlans();
    const plan = plans.find((p) => p.id === id);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    return { success: true, data: plan };
  }

  try {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  } catch (error) {
    const plans = getDemoPlans();
    const plan = plans.find((p) => p.id === id);
    if (plan) {
      return { success: true, data: plan };
    }
    throw error;
  }
};

export const createPlanApi = async (planData) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const newPlan = createDemoPlan(planData);
    return { success: true, data: newPlan, message: 'Plan created successfully' };
  }

  try {
    const response = await api.post('/plans', planData);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    // Fallback to demo
    const newPlan = createDemoPlan(planData);
    return { success: true, data: newPlan, message: 'Plan created in demo storage' };
  }
};

export const updatePlanApi = async (id, updates) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const updated = updateDemoPlan(id, updates);
    if (!updated) throw new Error('Plan not found to update');
    return { success: true, data: updated, message: 'Plan updated successfully' };
  }

  try {
    const response = await api.patch(`/plans/${id}`, updates);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    const updated = updateDemoPlan(id, updates);
    return { success: true, data: updated, message: 'Plan updated in demo storage' };
  }
};

export const deactivatePlanApi = async (id) => {
  const token = localStorage.getItem('auth_token');
  const isDemo = token && token.startsWith('demo-jwt-token-');

  if (isDemo) {
    const deactivated = deactivateDemoPlan(id);
    return { success: true, data: deactivated, message: 'Plan deactivated successfully' };
  }

  try {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  } catch (error) {
    const deactivated = deactivateDemoPlan(id);
    return { success: true, data: deactivated, message: 'Plan deactivated in demo storage' };
  }
};
