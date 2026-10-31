/**
 * Database configuration
 * Single Prisma client instance for the entire application.
 * Replaces the legacy config/prisma.js.
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const prisma = new PrismaClient({
  log: env.isDevelopment ? ['error', 'warn'] : ['error'],
});

export default prisma;
