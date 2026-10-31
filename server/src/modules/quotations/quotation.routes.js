import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { staffOrAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/error.middleware.js';
import {
  createQuotationSchema,
  quotationQuerySchema,
  updateQuotationSchema,
  updateQuotationStatusSchema,
} from './quotation.validation.js';
import * as quotationController from './quotation.controller.js';

const router = Router();

// ============================================================
// QUOTATION ROUTES
// ============================================================

router.use(authenticate);

// GET /api/v1/quotations — List quotes (all roles, customer data isolated)
router.get('/', validate(quotationQuerySchema), quotationController.getQuotations);

// GET /api/v1/quotations/:id — Get single quote details
router.get('/:id', quotationController.getQuotationById);

// POST /api/v1/quotations — Create quote (STAFF & ADMIN only)
router.post('/', staffOrAdmin, validate(createQuotationSchema), quotationController.createQuotation);

// PATCH /api/v1/quotations/:id — Update draft quote (STAFF & ADMIN only)
router.patch('/:id', staffOrAdmin, validate(updateQuotationSchema), quotationController.updateQuotation);

// PATCH /api/v1/quotations/:id/status — Transition status (Customer can accept/reject, Staff/Admin can send/cancel)
router.patch('/:id/status', validate(updateQuotationStatusSchema), quotationController.updateQuotationStatus);

export default router;
