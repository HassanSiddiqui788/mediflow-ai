import 'dotenv/config';
import 'temporal-polyfill/global';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from '../../prisma/contract.d';
import contractJson from '../../prisma/contract.json' with { type: 'json' };

// Global singleton pattern for development hot-reloading in Next.js
const globalForDb = globalThis as unknown as {
  mediflowDb?: ReturnType<typeof postgres<Contract>>;
};

export const db =
  globalForDb.mediflowDb ??
  postgres<Contract>({
    contractJson,
    url: process.env['DATABASE_URL']!,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mediflowDb = db;
}
