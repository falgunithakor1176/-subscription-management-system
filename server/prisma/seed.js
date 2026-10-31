
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

const seed = async () => {
  console.log('[Seed] Starting database seed...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  // Require credentials from environment variables (no hardcoded credentials)
  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Missing required environment variables: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be configured.'
    );
  }

  if (adminPassword.length < 8) {
    throw new Error('Seed admin password must be at least 8 characters.');
  }

  const prisma = new PrismaClient();

  try {
    // Check whether the admin already exists (idempotent check)
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`[Seed] Admin user (${adminEmail}) already exists. Skipping.`);
      return;
    }

    // Hash password with 12 rounds
    const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);

    await prisma.user.create({
      data: {
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });

    // Never log password or hash
    console.log(`[Seed] Admin user (${adminEmail}) created successfully.`);
  } finally {
    await prisma.$disconnect();
  }
};

seed().catch((error) => {
  console.error('[Seed] Database seed failed:', error.message);
  process.exitCode = 1;
});

