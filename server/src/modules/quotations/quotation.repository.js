import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// QUOTATION REPOSITORY
// ============================================================

/**
 * Generate next quotation number (e.g., QT-2026-0001)
 */
export const generateQuotationNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.quotation.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `QT-${year}-${sequence}`;
};

/**
 * Find quotation by ID with all relations
 */
export const findQuotationById = async (id) => {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          companyName: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
          userId: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              productType: true,
              sku: true,
              unit: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              additionalPrice: true,
            },
          },
        },
      },
      subscription: {
        select: {
          id: true,
          subscriptionNumber: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Find paginated list of quotations
 */
export const findQuotations = async ({
  skip = 0,
  take = 10,
  search,
  status,
  customerId,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  const where = buildWhereClause({ search, status, customerId });

  return prisma.quotation.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          companyName: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: {
        select: { items: true },
      },
    },
  });
};

/**
 * Count total quotations matching filters
 */
export const countQuotations = async ({ search, status, customerId }) => {
  const where = buildWhereClause({ search, status, customerId });
  return prisma.quotation.count({ where });
};

/**
 * Create quotation with nested line items in a transaction
 */
export const createQuotation = async (quotationData, itemsData) => {
  return prisma.quotation.create({
    data: {
      ...quotationData,
      items: {
        create: itemsData,
      },
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
};

/**
 * Update quotation header and optionally replace items
 */
export const updateQuotation = async (id, quotationData, itemsData = null) => {
  return prisma.$transaction(async (tx) => {
    if (itemsData) {
      // Delete existing line items
      await tx.quotationItem.deleteMany({ where: { quotationId: id } });

      // Create new line items
      await tx.quotationItem.createMany({
        data: itemsData.map((item) => ({
          ...item,
          quotationId: id,
        })),
      });
    }

    return tx.quotation.update({
      where: { id },
      data: quotationData,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  });
};

/**
 * Update quotation status
 */
export const updateQuotationStatus = async (id, status) => {
  return prisma.quotation.update({
    where: { id },
    data: { status },
    include: {
      customer: true,
      items: true,
    },
  });
};

/**
 * Helper to build where clause
 */
const buildWhereClause = ({ search, status, customerId }) => {
  const where = {};

  if (search) {
    where.OR = [
      { quotationNumber: { contains: search, mode: 'insensitive' } },
      { customer: { firstName: { contains: search, mode: 'insensitive' } } },
      { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      { customer: { companyName: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  return where;
};
