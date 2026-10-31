/**
 * customer.service.js
 * Business logic for Customer Management.
 * Sits between the controller and the repository.
 * Enforces strict customer data isolation and role boundaries.
 */

import { ApiError } from '../../utils/ApiError.js';
import { CUSTOMER_MESSAGES, CUSTOMER_STATUSES } from './customer.constants.js';
import {
  countCustomers,
  createCustomer,
  deactivateCustomer,
  findCustomerByEmail,
  findCustomerById,
  findCustomerByUserId,
  findCustomers,
  updateCustomer,
} from './customer.repository.js';
import { ROLES } from '../auth/auth.constants.js';

/**
 * List customers with pagination and filtering.
 * Restricted to ADMIN and STAFF roles.
 *
 * @param {object} requestingUser
 * @param {object} query - { page, limit, status, search }
 * @returns {Promise<{ customers: Customer[], total: number, page: number, totalPages: number }>}
 */
export const listCustomers = async (requestingUser, query = {}) => {
  // Enforce role boundary: Customers cannot browse directory
  if (requestingUser.role === ROLES.CUSTOMER) {
    throw ApiError.forbidden(CUSTOMER_MESSAGES.FORBIDDEN_ACCESS);
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filters = {
    ...(query.status && { status: query.status }),
    ...(query.search && { search: query.search.trim() }),
  };

  const [customers, total] = await Promise.all([
    findCustomers({ ...filters, skip, take: limit }),
    countCustomers(filters),
  ]);

  return {
    customers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get customer details by ID.
 * Enforces customer data isolation: CUSTOMER can only view their own record.
 *
 * @param {string} customerId
 * @param {object} requestingUser
 * @returns {Promise<Customer>}
 */
export const getCustomerDetails = async (customerId, requestingUser) => {
  const customer = await findCustomerById(customerId, true);

  if (!customer) {
    throw ApiError.notFound(CUSTOMER_MESSAGES.NOT_FOUND);
  }

  // Strict Data Isolation check:
  if (requestingUser.role === ROLES.CUSTOMER) {
    if (customer.userId !== requestingUser.id) {
      throw ApiError.forbidden(CUSTOMER_MESSAGES.FORBIDDEN_ACCESS);
    }
  }

  return customer;
};

/**
 * Get self-customer profile for the authenticated CUSTOMER.
 *
 * @param {object} requestingUser
 * @returns {Promise<Customer>}
 */
export const getMyCustomerProfile = async (requestingUser) => {
  const customer = await findCustomerByUserId(requestingUser.id);

  if (!customer) {
    throw ApiError.notFound('Customer profile not found for this account.');
  }

  return getCustomerDetails(customer.id, requestingUser);
};

/**
 * Create a new Customer record.
 * Restricted to ADMIN and STAFF roles.
 *
 * @param {object} dto
 * @param {object} requestingUser
 * @returns {Promise<Customer>}
 */
export const createCustomerRecord = async (dto, requestingUser) => {
  if (requestingUser.role === ROLES.CUSTOMER) {
    throw ApiError.forbidden('Only staff and administrators can create customer accounts.');
  }

  const email = dto.email.trim().toLowerCase();

  // Check duplicate email
  const existing = await findCustomerByEmail(email);
  if (existing) {
    throw ApiError.conflict(CUSTOMER_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  return createCustomer({
    firstName: dto.firstName.trim(),
    lastName: dto.lastName.trim(),
    email,
    phone: dto.phone?.trim() || null,
    companyName: dto.companyName?.trim() || null,
    address: dto.address?.trim() || null,
    city: dto.city?.trim() || null,
    state: dto.state?.trim() || null,
    country: dto.country?.trim() || null,
    postalCode: dto.postalCode?.trim() || null,
    status: dto.status || CUSTOMER_STATUSES.ACTIVE,
    notes: dto.notes?.trim() || null,
  });
};

/**
 * Update an existing customer record.
 * ADMIN and STAFF can update any customer.
 * CUSTOMER can only update their own contact information.
 *
 * @param {string} customerId
 * @param {object} dto
 * @param {object} requestingUser
 * @returns {Promise<Customer>}
 */
export const updateCustomerRecord = async (customerId, dto, requestingUser) => {
  const existing = await findCustomerById(customerId);

  if (!existing) {
    throw ApiError.notFound(CUSTOMER_MESSAGES.NOT_FOUND);
  }

  // Data isolation check for customer
  if (requestingUser.role === ROLES.CUSTOMER) {
    if (existing.userId !== requestingUser.id) {
      throw ApiError.forbidden(CUSTOMER_MESSAGES.FORBIDDEN_ACCESS);
    }
  }

  // Check email uniqueness if email is being updated
  if (dto.email && dto.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
    const emailConflict = await findCustomerByEmail(dto.email.trim().toLowerCase());
    if (emailConflict) {
      throw ApiError.conflict(CUSTOMER_MESSAGES.EMAIL_ALREADY_EXISTS);
    }
  }

  // Customers cannot modify their own status
  const statusToUpdate =
    requestingUser.role === ROLES.CUSTOMER ? existing.status : dto.status;

  return updateCustomer(customerId, {
    ...(dto.firstName && { firstName: dto.firstName.trim() }),
    ...(dto.lastName && { lastName: dto.lastName.trim() }),
    ...(dto.email && { email: dto.email.trim().toLowerCase() }),
    ...(dto.phone !== undefined && { phone: dto.phone?.trim() || null }),
    ...(dto.companyName !== undefined && { companyName: dto.companyName?.trim() || null }),
    ...(dto.address !== undefined && { address: dto.address?.trim() || null }),
    ...(dto.city !== undefined && { city: dto.city?.trim() || null }),
    ...(dto.state !== undefined && { state: dto.state?.trim() || null }),
    ...(dto.country !== undefined && { country: dto.country?.trim() || null }),
    ...(dto.postalCode !== undefined && { postalCode: dto.postalCode?.trim() || null }),
    ...(statusToUpdate && { status: statusToUpdate }),
    ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
  });
};

/**
 * Deactivate a customer record.
 * Restricted to ADMIN and STAFF roles.
 *
 * @param {string} customerId
 * @param {object} requestingUser
 * @returns {Promise<Customer>}
 */
export const deactivateCustomerRecord = async (customerId, requestingUser) => {
  if (requestingUser.role === ROLES.CUSTOMER) {
    throw ApiError.forbidden('Customers cannot deactivate customer records.');
  }

  const existing = await findCustomerById(customerId);
  if (!existing) {
    throw ApiError.notFound(CUSTOMER_MESSAGES.NOT_FOUND);
  }

  return deactivateCustomer(customerId);
};
