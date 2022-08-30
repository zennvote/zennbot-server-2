import { Prisma, PrismaClient } from '@prisma/client';

export const transactionalTest = async (
  prisma: PrismaClient,
  fn: (transaction: Prisma.TransactionClient) => Promise<unknown>,
) => {
  try {
    await prisma.$transaction(async (transaction) => {
      await fn(transaction);

      throw new Error('rollback transaction');
    });
    // eslint-disable-next-line no-empty
  } catch (e) { }
};
