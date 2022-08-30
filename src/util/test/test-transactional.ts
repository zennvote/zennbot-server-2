import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ });

export const transactionalTest = async (
  targetPrisma: PrismaClient,
  fn: (transaction: Prisma.TransactionClient) => Promise<unknown>,
) => {
  try {
    await prisma.$transaction(async (transaction) => {
      const mockTargetKeys = Object.keys(transaction).filter((key) => !key.startsWith('_'));
      mockTargetKeys.forEach((key) => {
        // eslint-disable-next-line no-param-reassign
        (targetPrisma as any)[key] = transaction[key];
      });

      await fn(transaction);

      throw new Error('rollback transaction');
    });
    // eslint-disable-next-line no-empty
  } catch (e) { }
};
