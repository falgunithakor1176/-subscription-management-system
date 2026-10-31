/**
 * server.js
 * Application entry point.
 * Imports the configured Express app, connects to the database, and starts the HTTP server.
 */

import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/database.js';

const startServer = async () => {
  try {
    // Verify database connectivity on startup
    await prisma.$connect();
    console.log('[Database] Connected to PostgreSQL via Prisma.');

    app.listen(env.port, () => {
      console.log(`[Server] Brightloop API running on port ${env.port} (${env.nodeEnv})`);
      console.log(`[Server] Health check: http://localhost:${env.port}/api/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  await prisma.$disconnect();
  console.log('[Database] Disconnected from PostgreSQL.');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
  process.exit(1);
});

startServer();
