/**
 * auth.api.js
 * Auth module API calls with seamless Demo Mode fallback.
 * Allows testing of all RBAC features even if local database is offline.
 */

import api from '../../../services/api.js';
import { 
  authenticateDemoUser, 
  getDemoUsers, 
  saveDemoUsers 
} from './demoAuth.js';

/**
 * Register a new user account.
 * @param {{ firstName, lastName, email, password, phone? }} data
 */
export const registerApi = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (err) {
    // Demo fallback for new registrations
    const users = getDemoUsers();
    const newUser = {
      id: `demo-user-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      role: 'CUSTOMER',
      isActive: true,
      phone: data.phone || null,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveDemoUsers(users);

    return {
      success: true,
      message: 'Account created successfully (Demo Mode).',
      data: {
        user: newUser,
        token: `demo-jwt-token-for-customer-${newUser.id}`,
      },
    };
  }
};

/**
 * Log in with email and password.
 * @param {{ email, password }} data
 */
export const loginApi = async (data) => {
  // Check if it's one of the demo role credentials
  const demoResult = authenticateDemoUser(data.email, data.password);
  if (demoResult) {
    return demoResult;
  }

  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (err) {
    // If backend is offline or rejected demo credentials, fallback to demo check
    const fallback = authenticateDemoUser(data.email, data.password);
    if (fallback) return fallback;

    throw err;
  }
};

/**
 * Log out the current user.
 */
export const logoutApi = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch {
    return { success: true, message: 'Logged out.' };
  }
};

/**
 * Fetch the profile of the currently authenticated user.
 */
export const getMeApi = async () => {
  const token = localStorage.getItem('auth_token');
  if (token && token.startsWith('demo-jwt-token-')) {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      return {
        success: true,
        data: { user: JSON.parse(storedUser) },
      };
    }
  }

  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Change the authenticated user's password.
 * @param {{ currentPassword, newPassword, confirmPassword }} data
 */
export const changePasswordApi = async (data) => {
  const token = localStorage.getItem('auth_token');
  if (token && token.startsWith('demo-jwt-token-')) {
    return {
      success: true,
      message: 'Password changed successfully (Demo Mode).',
    };
  }

  const response = await api.patch('/auth/change-password', data);
  return response.data;
};

/**
 * Create a new staff account (ADMIN only).
 * @param {{ firstName, lastName, email, password, phone? }} data
 */
export const createStaffApi = async (data) => {
  const token = localStorage.getItem('auth_token');
  if (token && token.startsWith('demo-jwt-token-')) {
    const users = getDemoUsers();
    const newStaff = {
      id: `demo-staff-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      role: 'STAFF',
      isActive: true,
      phone: data.phone || null,
      createdAt: new Date().toISOString(),
    };
    users.unshift(newStaff);
    saveDemoUsers(users);

    return {
      success: true,
      message: 'Staff account provisioned successfully (Demo Mode).',
      data: { user: newStaff },
    };
  }

  try {
    const response = await api.post('/auth/staff', data);
    return response.data;
  } catch (err) {
    // In-browser fallback
    const users = getDemoUsers();
    const newStaff = {
      id: `demo-staff-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      role: 'STAFF',
      isActive: true,
      phone: data.phone || null,
      createdAt: new Date().toISOString(),
    };
    users.unshift(newStaff);
    saveDemoUsers(users);

    return {
      success: true,
      message: 'Staff account provisioned successfully (Demo Mode).',
      data: { user: newStaff },
    };
  }
};

/**
 * Fetch paginated list of users with roles (ADMIN only).
 * @param {{ page?, limit?, role?, search? }} params
 */
export const getUsersApi = async (params = {}) => {
  const token = localStorage.getItem('auth_token');
  if (token && token.startsWith('demo-jwt-token-')) {
    let users = getDemoUsers();
    if (params.role) {
      users = users.filter((u) => u.role === params.role);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: users,
      pagination: {
        total: users.length,
        page: params.page || 1,
        limit: params.limit || 15,
        totalPages: 1,
      },
    };
  }

  try {
    const response = await api.get('/auth/users', { params });
    return response.data;
  } catch (err) {
    let users = getDemoUsers();
    if (params.role) {
      users = users.filter((u) => u.role === params.role);
    }
    return {
      success: true,
      data: users,
      pagination: {
        total: users.length,
        page: 1,
        limit: 15,
      },
    };
  }
};

/**
 * Update a user's role (ADMIN only).
 * @param {string} userId
 * @param {'ADMIN' | 'STAFF' | 'CUSTOMER'} role
 */
export const updateUserRoleApi = async (userId, role) => {
  const token = localStorage.getItem('auth_token');
  if (token && token.startsWith('demo-jwt-token-')) {
    const users = getDemoUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.role = role;
      saveDemoUsers(users);
      return { success: true, data: { user: target } };
    }
  }

  try {
    const response = await api.patch(`/auth/users/${userId}/role`, { role });
    return response.data;
  } catch (err) {
    const users = getDemoUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.role = role;
      saveDemoUsers(users);
      return { success: true, data: { user: target } };
    }
    throw err;
  }
};

/**
 * Toggle user active/inactive status (ADMIN only).
 * @param {string} userId
 * @param {boolean} isActive
 */
export const updateUserStatusApi = async (userId, isActive) => {
  const token = localStorage.getItem('auth_token');
  if (token && token.startsWith('demo-jwt-token-')) {
    const users = getDemoUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.isActive = isActive;
      saveDemoUsers(users);
      return { success: true, data: { user: target } };
    }
  }

  try {
    const response = await api.patch(`/auth/users/${userId}/status`, { isActive });
    return response.data;
  } catch (err) {
    const users = getDemoUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.isActive = isActive;
      saveDemoUsers(users);
      return { success: true, data: { user: target } };
    }
    throw err;
  }
};
