/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */

import { PrismaClient } from '@prisma/client';
import { ImplementationFn, TestFn } from 'ava';
import { PrismaService } from 'src/libs/prisma/prisma.service';

type PrismaContext = { prisma: PrismaService };

const prisma = new PrismaClient({});

export const transactionalTest = async <T extends PrismaContext>(
  testFn: TestFn<T>, title: string, implementation: ImplementationFn<unknown[], T>,
) => {
  testFn(title, async (test, ...args) => {
    try {
      await prisma.$transaction(async (transaction) => {
        const mockTargetKeys = Object.keys(transaction).filter((key) => !key.startsWith('_'));
        mockTargetKeys.forEach((key) => {
          test.context.prisma[key] = transaction[key];
        });

        await implementation(test, ...args);

        throw new Error('rollback transaction');
      });
      // eslint-disable-next-line no-empty
    } catch (e) { }
  });
};
