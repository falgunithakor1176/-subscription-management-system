import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { SUBSCRIPTION_MESSAGES } from './subscription.constants.js';
import * as subscriptionService from './subscription.service.js';

export const getSubscriptions = asyncHandler(async (req, res) => {
  const { subscriptions, pagination } = await subscriptionService.getSubscriptions(
    req.query,
    req.user
  );
  sendPaginated(res, subscriptions, pagination, SUBSCRIPTION_MESSAGES.LIST_FETCHED);
});

export const getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getSubscriptionById(
    req.params.id,
    req.user
  );
  sendSuccess(res, subscription, SUBSCRIPTION_MESSAGES.FETCHED);
});

export const createSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.createSubscription(req.body, req.user);
  sendSuccess(res, subscription, SUBSCRIPTION_MESSAGES.CREATED, 201);
});

export const updateSubscriptionStatus = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.updateSubscriptionStatus(
    req.params.id,
    req.body,
    req.user
  );
  sendSuccess(res, subscription, SUBSCRIPTION_MESSAGES.STATUS_UPDATED);
});
