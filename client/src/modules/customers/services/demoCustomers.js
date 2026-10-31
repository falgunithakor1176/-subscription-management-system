/**
 * demoCustomers.js
 * In-browser persistent demo dataset for the Customer Management module.
 * Enables immediate review and interactive testing of customer CRUD workflows.
 */

const DEMO_CUSTOMERS_STORAGE_KEY = 'submanage_demo_customers';

const INITIAL_DEMO_CUSTOMERS = [
  {
    id: 'cust-001',
    firstName: 'Alex',
    lastName: 'Rivers',
    companyName: 'TechNova Solutions',
    email: 'customer@brightloop.com',
    phone: '+1 (555) 012-4411',
    address: '742 Evergreen Terrace',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94105',
    status: 'ACTIVE',
    notes: 'Key Enterprise account with 3 active subscriptions.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-02-15T14:30:00.000Z',
  },
  {
    id: 'cust-002',
    firstName: 'Elena',
    lastName: 'Rostova',
    companyName: 'Apex Financial Technologies',
    email: 'elena.rostova@apextech.io',
    phone: '+1 (555) 439-8821',
    address: '120 Wall Street, Floor 14',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postalCode: '10005',
    status: 'ACTIVE',
    notes: 'Quarterly billing schedule. Direct ACH.',
    createdAt: '2026-01-18T11:20:00.000Z',
    updatedAt: '2026-02-20T09:15:00.000Z',
  },
  {
    id: 'cust-003',
    firstName: 'Marcus',
    lastName: 'Vance',
    companyName: 'Vance Cloud Infrastructure',
    email: 'marcus.v@vancecloud.net',
    phone: '+1 (555) 872-3349',
    address: '400 Pine Street',
    city: 'Seattle',
    state: 'WA',
    country: 'United States',
    postalCode: '98101',
    status: 'ACTIVE',
    notes: 'Annual upfront payment. Dedicated support tier.',
    createdAt: '2026-02-01T08:45:00.000Z',
    updatedAt: '2026-03-01T16:00:00.000Z',
  },
  {
    id: 'cust-004',
    firstName: 'Sophia',
    lastName: 'Lin',
    companyName: 'BioHealth Dynamics',
    email: 'slin@biohealthdynamics.com',
    phone: '+1 (555) 604-1192',
    address: '88 Tech Parkway',
    city: 'Boston',
    state: 'MA',
    country: 'United States',
    postalCode: '02115',
    status: 'ACTIVE',
    notes: 'Medical compliance requirements verified.',
    createdAt: '2026-02-14T13:10:00.000Z',
    updatedAt: '2026-02-28T11:45:00.000Z',
  },
  {
    id: 'cust-005',
    firstName: 'David',
    lastName: 'Kowalski',
    companyName: 'Nordic Logistics Global',
    email: 'd.kowalski@nordiclogistics.eu',
    phone: '+44 20 7946 0912',
    address: '25 Finsbury Circus',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    postalCode: 'EC2M 7EE',
    status: 'INACTIVE',
    notes: 'Paused subscription pending EU tax verification.',
    createdAt: '2026-02-20T15:00:00.000Z',
    updatedAt: '2026-03-05T10:20:00.000Z',
  },
];

export const getDemoCustomers = () => {
  try {
    const raw = localStorage.getItem(DEMO_CUSTOMERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_CUSTOMERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CUSTOMERS));
      return INITIAL_DEMO_CUSTOMERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(DEMO_CUSTOMERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CUSTOMERS));
      return INITIAL_DEMO_CUSTOMERS;
    }
    return parsed;
  } catch {
    return INITIAL_DEMO_CUSTOMERS;
  }
};

export const saveDemoCustomers = (customers) => {
  localStorage.setItem(DEMO_CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
};

export const createDemoCustomer = (customerData) => {
  const customers = getDemoCustomers();
  const exists = customers.some(
    (c) => c.email.toLowerCase() === customerData.email.trim().toLowerCase()
  );
  if (exists) {
    throw new Error('A customer with this email address already exists.');
  }

  const newCustomer = {
    id: `cust-${Date.now().toString(36)}`,
    firstName: customerData.firstName.trim(),
    lastName: customerData.lastName.trim(),
    companyName: customerData.companyName?.trim() || null,
    email: customerData.email.trim().toLowerCase(),
    phone: customerData.phone?.trim() || null,
    address: customerData.address?.trim() || null,
    city: customerData.city?.trim() || null,
    state: customerData.state?.trim() || null,
    country: customerData.country?.trim() || 'United States',
    postalCode: customerData.postalCode?.trim() || null,
    status: customerData.status || 'ACTIVE',
    notes: customerData.notes?.trim() || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  customers.unshift(newCustomer);
  saveDemoCustomers(customers);
  return newCustomer;
};

export const updateDemoCustomer = (id, updateData) => {
  const customers = getDemoCustomers();
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Customer not found.');
  }

  // Check email conflict
  if (updateData.email) {
    const emailConflict = customers.some(
      (c) => c.id !== id && c.email.toLowerCase() === updateData.email.trim().toLowerCase()
    );
    if (emailConflict) {
      throw new Error('Another customer is already using this email address.');
    }
  }

  const updated = {
    ...customers[index],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  customers[index] = updated;
  saveDemoCustomers(customers);
  return updated;
};

export const deleteDemoCustomer = (id) => {
  const customers = getDemoCustomers();
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('Customer not found.');
  }
  customers[index].status = 'INACTIVE';
  customers[index].updatedAt = new Date().toISOString();
  saveDemoCustomers(customers);
  return customers[index];
};
