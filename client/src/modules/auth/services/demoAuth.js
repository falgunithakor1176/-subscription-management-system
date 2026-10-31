/**
 * demoAuth.js
 * In-browser fallback for Demo Mode testing.
 * Enables immediate review and testing of all roles (ADMIN, STAFF, CUSTOMER)
 * even when the local PostgreSQL database server is offline or being configured.
 */

const DEMO_USERS_STORAGE_KEY = 'submanage_demo_directory';

const INITIAL_DEMO_USERS = [
  {
    id: 'demo-admin-01',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@brightloop.com',
    role: 'ADMIN',
    isActive: true,
    phone: '+1 (555) 019-2831',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'demo-staff-01',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'staff@brightloop.com',
    role: 'STAFF',
    isActive: true,
    phone: '+1 (555) 014-9922',
    createdAt: '2026-02-10T09:30:00.000Z',
  },
  {
    id: 'demo-customer-01',
    firstName: 'Alex',
    lastName: 'Rivers',
    email: 'customer@brightloop.com',
    role: 'CUSTOMER',
    isActive: true,
    phone: '+1 (555) 012-4411',
    createdAt: '2026-03-01T11:15:00.000Z',
  },
];

export const getDemoUsers = () => {
  try {
    const raw = localStorage.getItem(DEMO_USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      return INITIAL_DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_USERS;
  }
};

export const saveDemoUsers = (users) => {
  localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(users));
};

export const authenticateDemoUser = (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getDemoUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (user) {
    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact support.');
    }
    // Accept standard demo password or any entered password for demo accounts
    return {
      success: true,
      message: 'Demo login successful.',
      data: {
        user,
        token: `demo-jwt-token-for-${user.role.toLowerCase()}-${user.id}`,
      },
    };
  }

  return null;
};
