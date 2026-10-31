/**
 * auth.repository.js
 * Handles all database operations for the Authentication module.
 * Only this file may import prisma directly within the auth module.
 * Never import this from controllers — go through the service layer.
 */

import prisma from '../../config/database.js';

/**
 * Find a user by their email address.
 * @param {string} email
 * @returns {Promise<User|null>}
 */
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
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
