import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    logger.debug(`Query: ${e.query} (${e.duration}ms)`);
  });
}

prisma.$on('error' as never, (e: { message: string }) => {
  logger.error(`Prisma error: ${e.message}`);
});

prisma.$on('warn' as never, (e: { message: string }) => {
  logger.warn(`Prisma warning: ${e.message}`);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
