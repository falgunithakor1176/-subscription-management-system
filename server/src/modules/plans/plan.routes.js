import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { adminOnly } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/error.middleware.js';
import { createPlanSchema, updatePlanSchema, planQuerySchema } from './plan.validation.js';
import * as planController from './plan.controller.js';

const router = Router();

// ============================================================
// SUBSCRIPTION PLAN ROUTES
// ============================================================

// All routes require authentication
router.use(authenticate);

// GET /api/v1/plans — List plans (all authenticated users)
router.get('/', validate(planQuerySchema), planController.getPlans);

// GET /api/v1/plans/:id — Get single plan (all authenticated users)
router.get('/:id', planController.getPlanById);

// POST /api/v1/plans — Create plan (ADMIN only)
router.post('/', adminOnly, validate(createPlanSchema), planController.createPlan);

// PATCH /api/v1/plans/:id — Update plan (ADMIN only)
router.patch('/:id', adminOnly, validate(updatePlanSchema), planController.updatePlan);

// DELETE /api/v1/plans/:id — Deactivate plan (ADMIN only)
router.delete('/:id', adminOnly, planController.deactivatePlan);

export default router;
