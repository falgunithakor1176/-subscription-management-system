/**
 * auth.repository.js
 * Handles all database operations for the Authentication module.
 * Only this file may import prisma directly within the auth module.
 * Never import this from controllers — go through the service layer.
 */

import prisma from '../../config/database.js';

/**
 * Find a user by their email address (includes passwordHash for auth).
 * @param {string} email
 * @returns {Promise<User|null>}
 */
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Find a user by ID including passwordHash (for credential verification).
 * @param {string} id
 * @returns {Promise<User|null>}
 */
export const findUserWithPasswordById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Find a user by their ID.
 * @param {string} id
 * @returns {Promise<User|null>}
 */
export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      customer: {
        select: { id: true },
      },
    },
  });
};

/**
 * Create a new user record.
 * @param {object} data - { firstName, lastName, email, passwordHash, role, phone? }
 * @returns {Promise<User>}
 */
export const createUser = async (data) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
};

/**
 * Update a user's password hash.
 * @param {string} userId
 * @param {string} passwordHash
 * @returns {Promise<User>}
 */
export const updateUserPassword = async (userId, passwordHash) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
    select: { id: true, email: true },
  });
};

/**
 * Check if a user exists with the given email.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const emailExists = async (email) => {
  const count = await prisma.user.count({ where: { email } });
  return count > 0;
};

/**
 * Find paginated users list with optional search and role filtering.
 * @param {object} params
 * @returns {Promise<User[]>}
 */
export const findUsers = async ({ role, search, skip = 0, take = 20 }) => {
  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Count users matching criteria.
 * @param {object} params
 * @returns {Promise<number>}
 */
export const countUsers = async ({ role, search }) => {
  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  return prisma.user.count({ where });
};

/**
 * Count active administrators.
 * Used to safeguard against demoting or deactivating the last active ADMIN.
 * @returns {Promise<number>}
 */
export const countActiveAdmins = async () => {
  return prisma.user.count({
    where: {
      role: 'ADMIN',
      isActive: true,
    },
  });
};

/**
 * Update a user's role.
 * @param {string} id
 * @param {string} role
 * @returns {Promise<User>}
 */
export const updateUserRole = async (id, role) => {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });
};

/**
 * Update a user's active status (deactivate or activate).
 * @param {string} id
 * @param {boolean} isActive
 * @returns {Promise<User>}
 */
export const updateUserStatus = async (id, isActive) => {
  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });
};
