/**
 * Development/e2e seed data, written through the core layer.
 * Idempotent: every step is skipped when its data already exists.
 *
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD override the dev admin login.
 */
import "dotenv/config";
import {
  DEFAULT_BANK_ACCOUNT,
  DEFAULT_EXPENSE_ACCOUNT,
  createCore,
  createPrismaClient,
} from "../src/lib/server/core";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const core = createCore(createPrismaClient(url));

try {
  if ((await core.users.count()) === 0) {
    await core.users.create(
      {
        email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com",
        password: process.env.SEED_ADMIN_PASSWORD ?? "password123",
      },
      { isSuperuser: true },
    );
    console.log("seed: created admin user");
  }

  await core.ensureDefaults();
  const accounts = await core.accounts.list();
  const named = (name: string) => accounts.find((a) => a.name === name);

  const main =
    named(DEFAULT_BANK_ACCOUNT) ??
    (await core.accounts.create({
      name: DEFAULT_BANK_ACCOUNT,
      isDisponible: true,
      position: 1,
    }));
  const outside =
    named(DEFAULT_EXPENSE_ACCOUNT) ??
    (await core.accounts.create({
      name: DEFAULT_EXPENSE_ACCOUNT,
      type: "OUT",
      isOut: true,
      position: 2,
    }));

  if ((await core.transactions.list({ limit: 1 })).total > 0) {
    console.log("seed: transactions already exist, skipping sample data");
  } else {
    const cash = await core.accounts.create({
      name: "Wallet",
      type: "CASH",
      isDisponible: true,
      position: 3,
    });
    const savings = await core.accounts.create({
      name: "Emergency fund",
      type: "SAVINGS",
      isPortfolio: true,
      position: 4,
    });
    const invest = await core.accounts.create({
      name: "Global ETFs",
      type: "INVESTMENT",
      isPortfolio: true,
      position: 5,
    });

    await core.accounts.recordState(main.id, 10_000);
    await core.accounts.recordState(cash.id, 2_450);
    await core.accounts.recordState(savings.id, 45_000);
    await core.accounts.recordState(invest.id, 120_800);

    const groceries = await core.categories.create({ name: "Groceries" });
    const energy = await core.categories.create({ name: "Energy" });
    const salary = await core.categories.create({ name: "Income" });

    const now = new Date();
    await core.transactions.create({
      description: "Salary",
      amount: 15_000,
      sourceId: outside.id,
      targetId: main.id,
      categoryId: salary.id,
      transactedAt: now,
    });
    await core.transactions.create({
      description: "Rohlik delivery",
      amount: 2_180,
      sourceId: main.id,
      targetId: outside.id,
      categoryId: groceries.id,
      transactedAt: now,
    });
    await core.transactions.create({
      description: "Electricity advance",
      amount: 3_450,
      sourceId: main.id,
      targetId: outside.id,
      categoryId: energy.id,
      transactedAt: now,
    });
    console.log("seed: created sample data");
  }
} finally {
  await core.disconnect();
}
