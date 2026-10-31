/**
 * demoProducts.js
 * In-browser persistent demo dataset for Product & Variant Management.
 * Preloaded with realistic SaaS products and tier/attribute variants.
 */

const DEMO_PRODUCTS_STORAGE_KEY = 'submanage_demo_products';

const INITIAL_DEMO_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Cloud Infrastructure Platform',
    sku: 'PROD-CLOUD-INFRA',
    productType: 'SERVICE',
    salesPrice: 299.0,
    costPrice: 85.0,
    unit: 'Month',
    status: 'ACTIVE',
    description: 'Scalable cloud computing resources with automated failover and 99.99% SLA.',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-02-15T12:00:00.000Z',
    variants: [
      {
        id: 'var-001',
        name: 'Standard Instance (4 vCPU, 16GB)',
        sku: 'VAR-CLOUD-STD',
        additionalPrice: 0.0,
        description: 'Standard production compute node.',
        isActive: true,
      },
      {
        id: 'var-002',
        name: 'Performance Instance (8 vCPU, 32GB)',
        sku: 'VAR-CLOUD-PERF',
        additionalPrice: 150.0,
        description: 'High-compute node with NVMe caching.',
        isActive: true,
      },
      {
        id: 'var-003',
        name: 'Enterprise Cluster (16 vCPU, 64GB)',
        sku: 'VAR-CLOUD-ENT',
        additionalPrice: 350.0,
        description: 'Dedicated multi-region cluster with isolated VPC.',
        isActive: true,
      },
    ],
  },
  {
    id: 'prod-002',
    name: 'Enterprise Security & Compliance Suite',
    sku: 'PROD-SEC-COMPL',
    productType: 'DIGITAL',
    salesPrice: 450.0,
    costPrice: 110.0,
    unit: 'Seat/Mo',
    status: 'ACTIVE',
    description: 'SOC2, HIPAA, and GDPR continuous compliance monitoring with threat detection.',
    createdAt: '2026-01-15T09:30:00.000Z',
    updatedAt: '2026-02-20T10:15:00.000Z',
    variants: [
      {
        id: 'var-004',
        name: 'Base Security Scanner',
        sku: 'VAR-SEC-BASE',
        additionalPrice: 0.0,
        description: 'Weekly automated vulnerability scans.',
        isActive: true,
      },
      {
        id: 'var-005',
        name: 'Advanced Real-Time SIEM Integration',
        sku: 'VAR-SEC-SIEM',
        additionalPrice: 200.0,
        description: 'Real-time telemetry and Splunk/Datadog forwarders.',
        isActive: true,
      },
    ],
  },
  {
    id: 'prod-003',
    name: '24/7 Dedicated Support & TAM',
    sku: 'PROD-SUPP-TAM',
    productType: 'SERVICE',
    salesPrice: 600.0,
    costPrice: 250.0,
    unit: 'Account/Mo',
    status: 'ACTIVE',
    description: 'Named Technical Account Manager with 15-minute emergency response SLA.',
    createdAt: '2026-02-01T11:00:00.000Z',
    updatedAt: '2026-03-01T14:45:00.000Z',
    variants: [
      {
        id: 'var-006',
        name: 'Standard TAM (Business Hours)',
        sku: 'VAR-TAM-STD',
        additionalPrice: 0.0,
        description: 'Business hours ticket escalation.',
        isActive: true,
      },
      {
        id: 'var-007',
        name: 'Global 24/7 Priority TAM',
        sku: 'VAR-TAM-GLOBAL',
        additionalPrice: 300.0,
        description: 'Direct Slack connect and phone escalation line.',
        isActive: true,
      },
    ],
  },
  {
    id: 'prod-004',
    name: 'Hardware HSM Security Token',
    sku: 'PROD-HW-TOKEN',
    productType: 'PHYSICAL',
    salesPrice: 120.0,
    costPrice: 45.0,
    unit: 'Unit',
    status: 'ACTIVE',
    description: 'FIPS 140-2 Level 3 certified cryptographic hardware authenticator.',
    createdAt: '2026-02-10T14:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
    variants: [],
  },
];

export const getDemoProducts = () => {
  try {
    const raw = localStorage.getItem(DEMO_PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
      return INITIAL_DEMO_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(DEMO_PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
      return INITIAL_DEMO_PRODUCTS;
    }
    return parsed;
  } catch {
    return INITIAL_DEMO_PRODUCTS;
  }
};

export const saveDemoProducts = (products) => {
  localStorage.setItem(DEMO_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

export const createDemoProduct = (data) => {
  const products = getDemoProducts();

  const newProduct = {
    id: `prod-${Date.now().toString(36)}`,
    name: data.name.trim(),
    sku: data.sku?.trim() || `SKU-${Date.now().toString(36).toUpperCase()}`,
    productType: data.productType || 'SERVICE',
    salesPrice: parseFloat(data.salesPrice) || 0,
    costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
    unit: data.unit?.trim() || 'Unit',
    status: data.status || 'ACTIVE',
    description: data.description?.trim() || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: (data.variants || []).map((v, i) => ({
      id: `var-${Date.now().toString(36)}-${i}`,
      name: v.name.trim(),
      sku: v.sku?.trim() || null,
      additionalPrice: parseFloat(v.additionalPrice) || 0,
      description: v.description?.trim() || null,
      isActive: v.isActive !== false,
    })),
  };

  products.unshift(newProduct);
  saveDemoProducts(products);
  return newProduct;
};

export const updateDemoProduct = (id, data) => {
  const products = getDemoProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found.');

  const updated = {
    ...products[idx],
    ...data,
    salesPrice: data.salesPrice !== undefined ? parseFloat(data.salesPrice) : products[idx].salesPrice,
    costPrice: data.costPrice !== undefined ? (data.costPrice ? parseFloat(data.costPrice) : null) : products[idx].costPrice,
    updatedAt: new Date().toISOString(),
  };

  products[idx] = updated;
  saveDemoProducts(products);
  return updated;
};

export const archiveDemoProduct = (id) => {
  const products = getDemoProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found.');

  products[idx].status = 'ARCHIVED';
  products[idx].updatedAt = new Date().toISOString();
  saveDemoProducts(products);
  return products[idx];
};

export const addDemoVariant = (productId, variantData) => {
  const products = getDemoProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error('Product not found.');

  const newVariant = {
    id: `var-${Date.now().toString(36)}`,
    name: variantData.name.trim(),
    sku: variantData.sku?.trim() || null,
    additionalPrice: parseFloat(variantData.additionalPrice) || 0,
    description: variantData.description?.trim() || null,
    isActive: variantData.isActive !== false,
  };

  products[idx].variants = products[idx].variants || [];
  products[idx].variants.push(newVariant);
  products[idx].updatedAt = new Date().toISOString();
  saveDemoProducts(products);
  return newVariant;
};

export const updateDemoVariant = (productId, variantId, variantData) => {
  const products = getDemoProducts();
  const prod = products.find((p) => p.id === productId);
  if (!prod) throw new Error('Product not found.');

  const vIdx = (prod.variants || []).findIndex((v) => v.id === variantId);
  if (vIdx === -1) throw new Error('Variant not found.');

  prod.variants[vIdx] = {
    ...prod.variants[vIdx],
    ...variantData,
    additionalPrice:
      variantData.additionalPrice !== undefined
        ? parseFloat(variantData.additionalPrice)
        : prod.variants[vIdx].additionalPrice,
  };

  prod.updatedAt = new Date().toISOString();
  saveDemoProducts(products);
  return prod.variants[vIdx];
};

export const deleteDemoVariant = (productId, variantId) => {
  const products = getDemoProducts();
  const prod = products.find((p) => p.id === productId);
  if (!prod) throw new Error('Product not found.');

  prod.variants = (prod.variants || []).filter((v) => v.id !== variantId);
  prod.updatedAt = new Date().toISOString();
  saveDemoProducts(products);
  return { success: true };
};
