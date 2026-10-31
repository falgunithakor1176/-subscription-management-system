import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { staffOrAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/error.middleware.js';
import {
  createSubscriptionSchema,
  subscriptionQuerySchema,
  updateSubscriptionStatusSchema,
} from './subscription.validation.js';
import * as subscriptionController from './subscription.controller.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/subscriptions
router.get('/', validate(subscriptionQuerySchema), subscriptionController.getSubscriptions);

// GET /api/v1/subscriptions/:id
router.get('/:id', subscriptionController.getSubscriptionById);

// POST /api/v1/subscriptions (STAFF & ADMIN)
router.post('/', staffOrAdmin, validate(createSubscriptionSchema), subscriptionController.createSubscription);

// PATCH /api/v1/subscriptions/:id/status (STAFF & ADMIN)
router.patch('/:id/status', staffOrAdmin, validate(updateSubscriptionStatusSchema), subscriptionController.updateSubscriptionStatus);

export default router;
