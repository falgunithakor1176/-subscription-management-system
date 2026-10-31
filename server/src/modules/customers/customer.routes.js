/**
 * customer.routes.js
 * Route definitions for the Customer Management module.
 * Attaches authentication and RBAC middleware to endpoints.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { staffOrAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/error.middleware.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from './customer.validation.js';
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  getMyCustomer,
  updateCustomer,
} from './customer.controller.js';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/customers/me
 * Authenticated CUSTOMER — retrieves own linked customer profile
 */
router.get('/me', getMyCustomer);

/**
 * GET /api/v1/customers
 * STAFF and ADMIN only — lists all customers with search and filters
 */
router.get('/', staffOrAdmin, getCustomers);

/**
 * GET /api/v1/customers/:id
 * Retrieves specific customer details (enforces customer isolation in service)
 */
router.get('/:id', getCustomerById);

/**
 * POST /api/v1/customers
 * STAFF and ADMIN only — creates new customer record
 */
router.post('/', staffOrAdmin, validate(createCustomerSchema), createCustomer);

/**
 * PATCH /api/v1/customers/:id
 * Updates customer details (Staff/Admin for all; Customer for own record)
 */
router.patch('/:id', validate(updateCustomerSchema), updateCustomer);

/**
 * DELETE /api/v1/customers/:id
 * STAFF and ADMIN only — deactivates customer record
 */
router.delete('/:id', staffOrAdmin, deleteCustomer);

export default router;
