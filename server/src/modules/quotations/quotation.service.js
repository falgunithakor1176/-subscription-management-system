import { ROLES } from '../auth/auth.constants.js';
import { QUOTATION_MESSAGES, QUOTATION_STATUSES } from './quotation.constants.js';
import * as quotationRepository from './quotation.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import prisma from '../../config/database.js';

// ============================================================
// QUOTATION CALCULATION HELPER
// ============================================================

export const calculateQuotationTotals = (items) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const processedItems = items.map((item) => {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = parseFloat(item.unitPrice) || 0;
    const discPct = parseFloat(item.discountPct) || 0;
    const taxPct = parseFloat(item.taxPct) || 0;

    const baseAmount = price * qty;
    const discountAmount = baseAmount * (discPct / 100);
    const afterDiscount = baseAmount - discountAmount;
    const taxAmount = afterDiscount * (taxPct / 100);
    const lineTotal = afterDiscount + taxAmount;

    subtotal += baseAmount;
    totalDiscount += discountAmount;
    totalTax += taxAmount;

    return {
      productId: item.productId,
      variantId: item.variantId || null,
      description: item.description || null,
      quantity: qty,
      unitPrice: price,
      discountPct: discPct,
      taxPct: taxPct,
      lineTotal: parseFloat(lineTotal.toFixed(2)),
    };
  });

  const totalAmount = subtotal - totalDiscount + totalTax;

  return {
    processedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(totalDiscount.toFixed(2)),
    taxAmount: parseFloat(totalTax.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

// ============================================================
// QUOTATION SERVICE
// ============================================================

/**
 * List quotations with role-based isolation
 * - ADMIN & STAFF: View all quotes
 * - CUSTOMER: View only their own quotes
 */
export const getQuotations = async (query, user) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  let customerId = query.customerId;

  // Strict Customer Isolation
  if (user.role === ROLES.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });
    if (!customer) {
      return { quotations: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    customerId = customer.id;
  }

  const skip = (page - 1) * limit;
  const [quotations, total] = await Promise.all([
    quotationRepository.findQuotations({
      skip,
      take: limit,
      search,
      status,
      customerId,
      sortBy,
      sortOrder,
    }),
    quotationRepository.countQuotations({
      search,
      status,
      customerId,
    }),
  ]);

  return {
    quotations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single quotation by ID with data isolation
 */
export const getQuotationById = async (id, user) => {
  const quotation = await quotationRepository.findQuotationById(id);
  if (!quotation) {
    throw ApiError.notFound(QUOTATION_MESSAGES.NOT_FOUND);
  }

  // Strict isolation check for CUSTOMER
  if (user.role === ROLES.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });
    if (!customer || quotation.customerId !== customer.id) {
      throw ApiError.forbidden(QUOTATION_MESSAGES.FORBIDDEN_ACCESS);
    }
  }

  return quotation;
};

/**
 * Create a new quotation (ADMIN & STAFF only)
 */
export const createQuotation = async (data, user) => {
  if (user.role === ROLES.CUSTOMER) {
    throw ApiError.forbidden(QUOTATION_MESSAGES.FORBIDDEN_ACCESS);
  }

  // Verify customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
  });
  if (!customer) {
    throw ApiError.notFound(QUOTATION_MESSAGES.CUSTOMER_NOT_FOUND);
  }

  const { processedItems, subtotal, discountAmount, taxAmount, totalAmount } =
    calculateQuotationTotals(data.items);

  const quotationNumber = await quotationRepository.generateQuotationNumber();

  const quotationData = {
    quotationNumber,
    customerId: data.customerId,
    createdById: user.id,
    status: QUOTATION_STATUSES.DRAFT,
    validityDate: data.validityDate ? new Date(data.validityDate) : null,
    notes: data.notes || null,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
  };

  return quotationRepository.createQuotation(quotationData, processedItems);
};

/**
 * Update quotation (ADMIN & STAFF only) - Only DRAFT quotes can be edited
 */
export const updateQuotation = async (id, data, user) => {
  if (user.role === ROLES.CUSTOMER) {
    throw ApiError.forbidden(QUOTATION_MESSAGES.FORBIDDEN_ACCESS);
  }

  const existing = await quotationRepository.findQuotationById(id);
  if (!existing) {
    throw ApiError.notFound(QUOTATION_MESSAGES.NOT_FOUND);
  }

  if (existing.status !== QUOTATION_STATUSES.DRAFT) {
    throw ApiError.badRequest(QUOTATION_MESSAGES.CANNOT_EDIT_NON_DRAFT);
  }

  let updateHeader = {};
  let processedItems = null;

  if (data.validityDate !== undefined) {
    updateHeader.validityDate = data.validityDate ? new Date(data.validityDate) : null;
  }
  if (data.notes !== undefined) {
    updateHeader.notes = data.notes;
  }

  if (data.items && data.items.length > 0) {
    const totals = calculateQuotationTotals(data.items);
    processedItems = totals.processedItems;
    updateHeader.subtotal = totals.subtotal;
    updateHeader.discountAmount = totals.discountAmount;
    updateHeader.taxAmount = totals.taxAmount;
    updateHeader.totalAmount = totals.totalAmount;
  }

  return quotationRepository.updateQuotation(id, updateHeader, processedItems);
};

/**
 * Update quotation status transition
 * - STAFF / ADMIN: Can mark as SENT, CANCELLED
 * - CUSTOMER: Can mark as ACCEPTED, REJECTED
 */
export const updateQuotationStatus = async (id, body, user) => {
  const quotation = await quotationRepository.findQuotationById(id);
  if (!quotation) {
    throw ApiError.notFound(QUOTATION_MESSAGES.NOT_FOUND);
  }

  const { status, reason } = body;

  if (user.role === ROLES.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });
    if (!customer || quotation.customerId !== customer.id) {
      throw ApiError.forbidden(QUOTATION_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (![QUOTATION_STATUSES.ACCEPTED, QUOTATION_STATUSES.REJECTED].includes(status)) {
      throw ApiError.forbidden(QUOTATION_MESSAGES.UNAUTHORIZED_CUSTOMER_ACTION);
    }

    if (quotation.status !== QUOTATION_STATUSES.SENT) {
      throw ApiError.badRequest('Can only accept or reject quotations that have been sent.');
    }
  }

  return quotationRepository.updateQuotationStatus(id, status);
};
