/**
 * product.repository.js
 * Database access layer for Product and ProductVariant models using Prisma.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findProductById = async (id, includeVariants = true) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: includeVariants,
      plans: true,
    },
  });
};

export const findProductBySku = async (sku) => {
  if (!sku) return null;
  return prisma.product.findUnique({
    where: { sku },
  });
};

export const findProducts = async ({
  search,
  productType,
  status,
  skip = 0,
  take = 20,
} = {}) => {
  const where = {
    ...(status && { status }),
    ...(productType && { productType }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return prisma.product.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      variants: true,
      _count: {
        select: {
          variants: true,
          plans: true,
        },
      },
    },
  });
};

export const countProducts = async ({ search, productType, status } = {}) => {
  const where = {
    ...(status && { status }),
    ...(productType && { productType }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return prisma.product.count({ where });
};

export const createProduct = async (data) => {
  const { variants, ...productData } = data;

  return prisma.product.create({
    data: {
      ...productData,
      ...(variants && variants.length > 0 && {
        variants: {
          create: variants,
        },
      }),
    },
    include: {
      variants: true,
    },
  });
};

export const updateProduct = async (id, data) => {
  return prisma.product.update({
    where: { id },
    data,
    include: {
      variants: true,
    },
  });
};

export const archiveProduct = async (id) => {
  return prisma.product.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const createProductVariant = async (productId, data) => {
  return prisma.productVariant.create({
    data: {
      ...data,
      productId,
    },
  });
};

export const updateProductVariant = async (id, data) => {
  return prisma.productVariant.update({
    where: { id },
    data,
  });
};

export const deleteProductVariant = async (id) => {
  return prisma.productVariant.delete({
    where: { id },
  });
};

export const findVariantById = async (id) => {
  return prisma.productVariant.findUnique({
    where: { id },
  });
};
