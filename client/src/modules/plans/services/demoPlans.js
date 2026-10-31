/**
 * demoPlans.js
 * In-browser persistent demo dataset for Subscription Plan Management.
 * Preloaded with realistic plans linked to demo products and billing cycles.
 */

import { getDemoProducts } from '../../products/services/demoProducts.js';

const DEMO_PLANS_STORAGE_KEY = 'submanage_demo_plans';

const INITIAL_DEMO_PLANS = [
  {
    id: 'plan-001',
    name: 'Cloud Infrastructure — Monthly Pro',
    description: 'Full-featured dedicated cloud infrastructure compute cluster with monthly billing and 99.99% SLA.',
    productId: 'prod-001',
    productName: 'Cloud Infrastructure Platform',
    price: 299.0,
    billingFrequency: 'MONTHLY',
    minQuantity: 1,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: null,
    autoClose: false,
    status: 'ACTIVE',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'plan-002',
    name: 'Cloud Infrastructure — Annual Enterprise',
    description: 'High-availability multi-region cluster with 2 months free on yearly billing.',
    productId: 'prod-001',
    productName: 'Cloud Infrastructure Platform',
    price: 2990.0,
    billingFrequency: 'YEARLY',
    minQuantity: 1,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: null,
    autoClose: false,
    status: 'ACTIVE',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'plan-003',
    name: 'Security & Compliance — Monthly Team',
    description: 'Continuous SOC2/HIPAA threat monitoring and automated audits per seat.',
    productId: 'prod-002',
    productName: 'Enterprise Security & Compliance Suite',
    price: 450.0,
    billingFrequency: 'MONTHLY',
    minQuantity: 5,
    startDate: '2026-01-15T00:00:00.000Z',
    endDate: null,
    autoClose: false,
    status: 'ACTIVE',
    createdAt: '2026-01-16T11:00:00.000Z',
    updatedAt: '2026-01-16T11:00:00.000Z',
  },
  {
    id: 'plan-004',
    name: 'Security & Compliance — Annual Enterprise',
    description: 'Annual enterprise security monitoring with dedicated compliance officer review.',
    productId: 'prod-002',
    productName: 'Enterprise Security & Compliance Suite',
    price: 4500.0,
    billingFrequency: 'YEARLY',
    minQuantity: 10,
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: null,
    autoClose: false,
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: '2026-02-01T08:30:00.000Z',
  },
  {
    id: 'plan-005',
    name: 'Rapid Sprint Sandbox — Weekly',
    description: 'Temporary dev sandbox environment with weekly auto-renewal and automatic closure upon expiration.',
    productId: 'prod-001',
    productName: 'Cloud Infrastructure Platform',
    price: 89.0,
    billingFrequency: 'WEEKLY',
    minQuantity: 1,
    startDate: '2026-02-10T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z',
    autoClose: true,
    status: 'ACTIVE',
    createdAt: '2026-02-10T14:00:00.000Z',
    updatedAt: '2026-02-10T14:00:00.000Z',
  },
  {
    id: 'plan-006',
    name: 'Legacy Cloud Starter (Deprecated)',
    description: 'Retired legacy compute tier, grandfathered accounts only.',
    productId: 'prod-001',
    productName: 'Cloud Infrastructure Platform',
    price: 149.0,
    billingFrequency: 'MONTHLY',
    minQuantity: 1,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-12-31T23:59:59.000Z',
    autoClose: true,
    status: 'INACTIVE',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const getDemoPlans = () => {
  try {
    const raw = localStorage.getItem(DEMO_PLANS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_PLANS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PLANS));
      return INITIAL_DEMO_PLANS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading demo plans:', err);
    return INITIAL_DEMO_PLANS;
  }
};

export const saveDemoPlans = (plans) => {
  try {
    localStorage.setItem(DEMO_PLANS_STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Error saving demo plans:', err);
  }
};

export const createDemoPlan = (planData) => {
  const plans = getDemoPlans();
  const products = getDemoProducts();
  const product = products.find((p) => p.id === planData.productId);

  const newPlan = {
    id: `plan-${Date.now().toString(36)}`,
    name: planData.name,
    description: planData.description || null,
    productId: planData.productId,
    productName: product ? product.name : 'Standard Product',
    price: parseFloat(planData.price),
    billingFrequency: planData.billingFrequency || 'MONTHLY',
    minQuantity: parseInt(planData.minQuantity, 10) || 1,
    startDate: planData.startDate || null,
    endDate: planData.endDate || null,
    autoClose: Boolean(planData.autoClose),
    status: planData.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  plans.unshift(newPlan);
  saveDemoPlans(plans);
  return newPlan;
};

export const updateDemoPlan = (id, updates) => {
  const plans = getDemoPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const products = getDemoProducts();
  const product = updates.productId ? products.find((p) => p.id === updates.productId) : null;

  const updatedPlan = {
    ...plans[index],
    ...updates,
    price: updates.price !== undefined ? parseFloat(updates.price) : plans[index].price,
    minQuantity: updates.minQuantity !== undefined ? parseInt(updates.minQuantity, 10) : plans[index].minQuantity,
    productName: product ? product.name : plans[index].productName,
    updatedAt: new Date().toISOString(),
  };

  plans[index] = updatedPlan;
  saveDemoPlans(plans);
  return updatedPlan;
};

export const deactivateDemoPlan = (id) => {
  const plans = getDemoPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return null;

  plans[index].status = 'INACTIVE';
  plans[index].updatedAt = new Date().toISOString();
  saveDemoPlans(plans);
  return plans[index];
};
