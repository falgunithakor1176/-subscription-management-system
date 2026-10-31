/**
 * demoSubscriptions.js
 * In-browser persistent demo dataset for Subscription Management.
 */

import { getDemoCustomers } from '../../customers/services/demoCustomers.js';
import { getDemoPlans } from '../../plans/services/demoPlans.js';

const DEMO_SUBSCRIPTIONS_STORAGE_KEY = 'submanage_demo_subscriptions';

const INITIAL_DEMO_SUBSCRIPTIONS = [
  {
    id: 'sub-001',
    subscriptionNumber: 'SUB-2026-0001',
    customerId: 'cust-001',
    customerName: 'Elena Vance',
    customerCompany: 'Apex Global Enterprises',
    customerEmail: 'elena.vance@apexglobal.io',
    planId: 'plan-001',
    planName: 'Cloud Infrastructure — Monthly Pro',
    status: 'ACTIVE',
    billingFrequency: 'MONTHLY',
    amount: 299.0,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: null,
    nextBillingDate: '2026-11-01T00:00:00.000Z',
    notes: 'Primary production cloud infrastructure subscription.',
    items: [
      {
        id: 'subitem-001',
        productId: 'prod-001',
        productName: 'Cloud Infrastructure Platform',
        quantity: 1,
        unitPrice: 299.0,
        lineTotal: 299.0,
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sub-002',
    subscriptionNumber: 'SUB-2026-0002',
    customerId: 'cust-002',
    customerName: 'Marcus Sterling',
    customerCompany: 'Hyperion Technologies',
    customerEmail: 'marcus.sterling@hyperiontech.com',
    planId: 'plan-004',
    planName: 'Security & Compliance — Annual Enterprise',
    status: 'ACTIVE',
    billingFrequency: 'YEARLY',
    amount: 4500.0,
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2027-02-01T00:00:00.000Z',
    nextBillingDate: '2027-02-01T00:00:00.000Z',
    notes: 'Converted from accepted quotation QT-2026-0002.',
    items: [
      {
        id: 'subitem-002',
        productId: 'prod-002',
        productName: 'Enterprise Security & Compliance Suite',
        quantity: 10,
        unitPrice: 450.0,
        lineTotal: 4500.0,
      },
    ],
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'sub-003',
    subscriptionNumber: 'SUB-2026-0003',
    customerId: 'cust-003',
    customerName: 'Sophia Rodriguez',
    customerCompany: 'Nova Digital Agency',
    customerEmail: 'sophia@novadigital.co',
    planId: 'plan-005',
    planName: 'Rapid Sprint Sandbox — Weekly',
    status: 'PAUSED',
    billingFrequency: 'WEEKLY',
    amount: 89.0,
    startDate: '2026-02-15T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z',
    nextBillingDate: '2026-11-05T00:00:00.000Z',
    notes: 'Temporarily paused during agency client sprint transition.',
    items: [
      {
        id: 'subitem-003',
        productId: 'prod-001',
        productName: 'Cloud Infrastructure Platform',
        quantity: 1,
        unitPrice: 89.0,
        lineTotal: 89.0,
      },
    ],
    createdAt: '2026-02-15T00:00:00.000Z',
  },
];

export const getDemoSubscriptions = () => {
  try {
    const raw = localStorage.getItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SUBSCRIPTIONS));
      return INITIAL_DEMO_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DEMO_SUBSCRIPTIONS;
  }
};

export const saveDemoSubscriptions = (subs) => {
  try {
    localStorage.setItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subs));
  } catch (e) {}
};

export const createDemoSubscription = (data) => {
  const subs = getDemoSubscriptions();
  const customers = getDemoCustomers();
  const plans = getDemoPlans();

  const customer = customers.find((c) => c.id === data.customerId);
  const plan = plans.find((p) => p.id === data.planId);

  const year = new Date().getFullYear();
  const count = subs.length + 1;
  const subscriptionNumber = `SUB-${year}-${String(count).padStart(4, '0')}`;

  let totalAmount = 0;
  const items = (data.items || []).map((it, idx) => {
    const qty = parseInt(it.quantity, 10) || 1;
    const price = parseFloat(it.unitPrice) || 0;
    const lineTotal = qty * price;
    totalAmount += lineTotal;

    return {
      id: `subitem-${Date.now()}-${idx}`,
      productId: it.productId,
      productName: it.productName || 'Service',
      quantity: qty,
      unitPrice: price,
      lineTotal,
    };
  });

  const newSub = {
    id: `sub-${Date.now().toString(36)}`,
    subscriptionNumber,
    customerId: data.customerId,
    customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Client',
    customerCompany: customer?.companyName || '',
    customerEmail: customer?.email || '',
    planId: data.planId,
    planName: plan?.name || 'Subscription Plan',
    status: 'ACTIVE',
    billingFrequency: data.billingFrequency || plan?.billingFrequency || 'MONTHLY',
    amount: parseFloat(totalAmount.toFixed(2)),
    startDate: data.startDate,
    endDate: data.endDate || null,
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: data.notes || '',
    items,
    createdAt: new Date().toISOString(),
  };

  subs.unshift(newSub);
  saveDemoSubscriptions(subs);
  return newSub;
};

export const updateDemoSubscriptionStatus = (id, status) => {
  const subs = getDemoSubscriptions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  subs[idx].status = status;
  saveDemoSubscriptions(subs);
  return subs[idx];
};
