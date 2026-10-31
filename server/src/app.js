/**
 * app.js
 * Express application factory.
 * Configures middleware and mounts all module routers.
 * Separated from server.js so the app can be tested without starting a port listener.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// ─── Module routers ───────────────────────────────────────────────────────────
import authRouter from './modules/auth/auth.routes.js';

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request logging ──────────────────────────────────────────────────────────
if (env.isDevelopment) {
  app.use(morgan('dev'));
}

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    message: {
      success: false,
      message: 'Too many requests. Please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Brightloop API is running.',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── Module routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Error handling (must be last) ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
