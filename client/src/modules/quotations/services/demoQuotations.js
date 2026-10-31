/**
 * demoQuotations.js
 * In-browser persistent demo dataset for Quotation Management.
 * Seeded with realistic quotations linked to demo customers, products, and variants.
 */

import { getDemoCustomers } from '../../customers/services/demoCustomers.js';
import { getDemoProducts } from '../../products/services/demoProducts.js';

const DEMO_QUOTATIONS_STORAGE_KEY = 'submanage_demo_quotations';

const INITIAL_DEMO_QUOTATIONS = [
  {
    id: 'quote-001',
    quotationNumber: 'QT-2026-0001',
    customerId: 'cust-001',
    customerName: 'Elena Vance',
    customerEmail: 'elena.vance@apexglobal.io',
    customerCompany: 'Apex Global Enterprises',
    status: 'SENT',
    validityDate: '2026-12-31T23:59:59.000Z',
    notes: 'Enterprise pilot deployment for Q4. Standard 30-day payment terms upon conversion.',
    subtotal: 1047.0,
    discountAmount: 104.7,
    taxAmount: 75.38,
    totalAmount: 1017.68,
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z',
    items: [
      {
        id: 'item-001',
        productId: 'prod-001',
        productName: 'Cloud Infrastructure Platform',
        variantId: 'var-002',
        variantName: 'Performance Instance (8 vCPU, 32GB)',
        description: 'Primary database cluster nodes',
        quantity: 2,
        unitPrice: 449.0,
        discountPct: 10.0,
        taxPct: 8.0,
        lineTotal: 872.86,
      },
      {
        id: 'item-002',
        productId: 'prod-002',
        productName: 'Enterprise Security & Compliance Suite',
        variantId: 'var-004',
        variantName: 'Base Security Scanner',
        description: 'Automated weekly vulnerability checks',
        quantity: 1,
        unitPrice: 149.0,
        discountPct: 10.0,
        taxPct: 8.0,
        lineTotal: 144.83,
      },
    ],
  },
  {
    id: 'quote-002',
    quotationNumber: 'QT-2026-0002',
    customerId: 'cust-002',
    customerName: 'Marcus Sterling',
    customerEmail: 'marcus.sterling@hyperiontech.com',
    customerCompany: 'Hyperion Technologies',
    status: 'ACCEPTED',
    validityDate: '2026-11-30T23:59:59.000Z',
    notes: 'Annual security suite renewal approved by CFO.',
    subtotal: 4500.0,
    discountAmount: 450.0,
    taxAmount: 324.0,
    totalAmount: 4374.0,
    createdAt: '2026-02-10T14:30:00.000Z',
    updatedAt: '2026-02-18T16:00:00.000Z',
    items: [
      {
        id: 'item-003',
        productId: 'prod-002',
        productName: 'Enterprise Security & Compliance Suite',
        variantId: null,
        variantName: null,
        description: 'Continuous compliance monitoring tier',
        quantity: 10,
        unitPrice: 450.0,
        discountPct: 10.0,
        taxPct: 8.0,
        lineTotal: 4374.0,
      },
    ],
  },
  {
    id: 'quote-003',
    quotationNumber: 'QT-2026-0003',
    customerId: 'cust-003',
    customerName: 'Sophia Rodriguez',
    customerEmail: 'sophia@novadigital.co',
    customerCompany: 'Nova Digital Agency',
    status: 'DRAFT',
    validityDate: '2026-10-15T23:59:59.000Z',
    notes: 'Preparing quote for marketing sandbox instances.',
    subtotal: 598.0,
    discountAmount: 0.0,
    taxAmount: 47.84,
    totalAmount: 645.84,
    createdAt: '2026-02-20T09:15:00.000Z',
    updatedAt: '2026-02-20T09:15:00.000Z',
    items: [
      {
        id: 'item-004',
        productId: 'prod-001',
        productName: 'Cloud Infrastructure Platform',
        variantId: 'var-001',
        variantName: 'Standard Instance (4 vCPU, 16GB)',
        description: 'Standard agency staging environment',
        quantity: 2,
        unitPrice: 299.0,
        discountPct: 0.0,
        taxPct: 8.0,
        lineTotal: 645.84,
      },
    ],
  },
  {
    id: 'quote-004',
    quotationNumber: 'QT-2026-0004',
    customerId: 'cust-004',
    customerName: 'David Chen',
    customerEmail: 'dchen@quantumedge.ai',
    customerCompany: 'QuantumEdge AI',
    status: 'REJECTED',
    validityDate: '2026-02-01T23:59:59.000Z',
    notes: 'Customer opted for on-premise alternative.',
    subtotal: 1200.0,
    discountAmount: 0.0,
    taxAmount: 96.0,
    totalAmount: 1296.0,
    createdAt: '2026-01-15T11:00:00.000Z',
    updatedAt: '2026-02-02T13:45:00.000Z',
    items: [
      {
        id: 'item-005',
        productId: 'prod-001',
        productName: 'Cloud Infrastructure Platform',
        variantId: 'var-003',
        variantName: 'Enterprise Cluster (16 vCPU, 64GB)',
        description: 'Dedicated GPU AI cluster node',
        quantity: 1,
        unitPrice: 1200.0,
        discountPct: 0.0,
        taxPct: 8.0,
        lineTotal: 1296.0,
      },
    ],
  },
];

export const getDemoQuotations = () => {
  try {
    const raw = localStorage.getItem(DEMO_QUOTATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_QUOTATIONS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_QUOTATIONS));
      return INITIAL_DEMO_QUOTATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading demo quotations:', e);
    return INITIAL_DEMO_QUOTATIONS;
  }
};

export const saveDemoQuotations = (quotes) => {
  try {
    localStorage.setItem(DEMO_QUOTATIONS_STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed saving demo quotations:', e);
  }
};

export const createDemoQuotation = (data) => {
  const quotes = getDemoQuotations();
  const customers = getDemoCustomers();
  const customer = customers.find((c) => c.id === data.customerId);

  const year = new Date().getFullYear();
  const count = quotes.length + 1;
  const quotationNumber = `QT-${year}-${String(count).padStart(4, '0')}`;

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const items = (data.items || []).map((item, idx) => {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = parseFloat(item.unitPrice) || 0;
    const disc = parseFloat(item.discountPct) || 0;
    const tax = parseFloat(item.taxPct) || 0;

    const base = price * qty;
    const discAmt = base * (disc / 100);
    const afterDisc = base - discAmt;
    const taxAmt = afterDisc * (tax / 100);
    const lineTotal = afterDisc + taxAmt;

    subtotal += base;
    totalDiscount += discAmt;
    totalTax += taxAmt;

    return {
      id: `item-${Date.now()}-${idx}`,
      productId: item.productId,
      productName: item.productName || 'Standard Service',
      variantId: item.variantId || null,
      variantName: item.variantName || null,
      description: item.description || '',
      quantity: qty,
      unitPrice: price,
      discountPct: disc,
      taxPct: tax,
      lineTotal: parseFloat(lineTotal.toFixed(2)),
    };
  });

  const totalAmount = subtotal - totalDiscount + totalTax;

  const newQuote = {
    id: `quote-${Date.now().toString(36)}`,
    quotationNumber,
    customerId: data.customerId,
    customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Direct Client',
    customerEmail: customer?.email || '',
    customerCompany: customer?.companyName || '',
    status: 'DRAFT',
    validityDate: data.validityDate || null,
    notes: data.notes || '',
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(totalDiscount.toFixed(2)),
    taxAmount: parseFloat(totalTax.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  quotes.unshift(newQuote);
  saveDemoQuotations(quotes);
  return newQuote;
};

export const updateDemoQuotation = (id, data) => {
  const quotes = getDemoQuotations();
  const idx = quotes.findIndex((q) => q.id === id);
  if (idx === -1) return null;

  const existing = quotes[idx];
  let subtotal = existing.subtotal;
  let discountAmount = existing.discountAmount;
  let taxAmount = existing.taxAmount;
  let totalAmount = existing.totalAmount;
  let items = existing.items;

  if (data.items && data.items.length > 0) {
    subtotal = 0;
    discountAmount = 0;
    taxAmount = 0;

    items = data.items.map((item, i) => {
      const qty = parseInt(item.quantity, 10) || 1;
      const price = parseFloat(item.unitPrice) || 0;
      const disc = parseFloat(item.discountPct) || 0;
      const tax = parseFloat(item.taxPct) || 0;

      const base = price * qty;
      const discAmt = base * (disc / 100);
      const afterDisc = base - discAmt;
      const taxAmt = afterDisc * (tax / 100);
      const lineTotal = afterDisc + taxAmt;

      subtotal += base;
      discountAmount += discAmt;
      taxAmount += taxAmt;

      return {
        id: item.id || `item-${Date.now()}-${i}`,
        productId: item.productId,
        productName: item.productName || 'Standard Service',
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        description: item.description || '',
        quantity: qty,
        unitPrice: price,
        discountPct: disc,
        taxPct: tax,
        lineTotal: parseFloat(lineTotal.toFixed(2)),
      };
    });

    totalAmount = subtotal - discountAmount + taxAmount;
  }

  quotes[idx] = {
    ...existing,
    ...data,
    validityDate: data.validityDate !== undefined ? data.validityDate : existing.validityDate,
    notes: data.notes !== undefined ? data.notes : existing.notes,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    items,
    updatedAt: new Date().toISOString(),
  };

  saveDemoQuotations(quotes);
  return quotes[idx];
};

export const updateDemoQuotationStatus = (id, status) => {
  const quotes = getDemoQuotations();
  const idx = quotes.findIndex((q) => q.id === id);
  if (idx === -1) return null;

  quotes[idx].status = status;
  quotes[idx].updatedAt = new Date().toISOString();
  saveDemoQuotations(quotes);
  return quotes[idx];
};
