require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trading_platform?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Connect to PostgreSQL database via Prisma
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('[PostgreSQL] Database connected successfully via Prisma');
  } catch (error) {
    console.error(`[PostgreSQL] Connection error: ${error.message}`);
    console.log('[PostgreSQL] Please ensure PostgreSQL is running and DATABASE_URL in .env is correct.');
    console.log('[PostgreSQL] Example: postgresql://postgres:password@localhost:5432/trading_platform?schema=public');
  }
};

module.exports = {
  prisma,
  connectDB,
};
