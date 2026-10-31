/**
 * customer.repository.js
 * Database access layer for Customer Management using Prisma.
 * Never imported directly by controllers; consumed exclusively by customer.service.js.
 */

import prisma from '../../config/database.js';

/**
 * Find customer by primary ID with optional relation trees.
 * @param {string} id
 * @param {boolean} includeRelations
 * @returns {Promise<Customer|null>}
 */
export const findCustomerById = async (id, includeRelations = false) => {
  return prisma.customer.findUnique({
    where: { id },
    include: includeRelations
      ? {
          user: {
            select: { id: true, email: true, role: true, isActive: true },
          },
          subscriptions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              subscriptionNumber: true,
              status: true,
              startDate: true,
              endDate: true,
              billingFrequency: true,
              totalAmount: true,
            },
          },
          invoices: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              issueDate: true,
              dueDate: true,
              grandTotal: true,
              outstandingAmount: true,
            },
          },
          payments: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              paymentNumber: true,
              amount: true,
              paymentDate: true,
              paymentMethod: true,
              status: true,
            },
          },
        }
      : undefined,
  });
};

/**
 * Find customer by email.
 * @param {string} email
 * @returns {Promise<Customer|null>}
 */
export const findCustomerByEmail = async (email) => {
  return prisma.customer.findUnique({
    where: { email },
  });
};

/**
 * Find customer associated with a registered User account.
 * @param {string} userId
 * @returns {Promise<Customer|null>}
 */
export const findCustomerByUserId = async (userId) => {
  return prisma.customer.findUnique({
    where: { userId },
  });
};

/**
 * Find paginated customers with optional status filter and search query.
 * @param {object} params
 * @returns {Promise<Customer[]>}
 */
export const findCustomers = async ({ status, search, skip = 0, take = 20 }) => {
  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return prisma.customer.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      companyName: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      state: true,
      country: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          subscriptions: true,
          invoices: true,
        },
      },
    },
  });
};

/**
 * Count customers matching query criteria.
 * @param {object} params
 * @returns {Promise<number>}
 */
export const countCustomers = async ({ status, search }) => {
  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return prisma.customer.count({ where });
};

/**
 * Create a new Customer record.
 * @param {object} data
 * @returns {Promise<Customer>}
 */
export const createCustomer = async (data) => {
  return prisma.customer.create({
    data,
  });
};

/**
 * Update an existing customer record.
 * @param {string} id
 * @param {object} data
 * @returns {Promise<Customer>}
 */
export const updateCustomer = async (id, data) => {
  return prisma.customer.update({
    where: { id },
    data,
  });
};

/**
 * Deactivate a customer (soft delete).
 * @param {string} id
 * @returns {Promise<Customer>}
 */
export const deactivateCustomer = async (id) => {
  return prisma.customer.update({
    where: { id },
    data: { status: 'INACTIVE' },
  });
};
