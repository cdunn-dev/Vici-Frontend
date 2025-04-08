import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient();

// Export models and client
export * from './models';
export { prisma }; 