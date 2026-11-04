/**
 * Development/e2e seed data, written through the core layer.
 * Idempotent: does nothing when accounts already exist.
 */
import "dotenv/config";
import { createCore, createPrismaClient } from "../src/lib/server/core";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const core = createCore(createPrismaClient(url));

try {
  if ((await core.accounts.list()).length > 0) {
    console.log("seed: accounts already exist, skipping");
  } else {
    // Transactions default to targetId=2, so the "outside world" comes second.
    const main = await core.accounts.create({
      name: "Main checking",
      type: "ACCOUNT",
      isDisponible: true,
      position: 1,
    });
    const outside = await core.accounts.create({
      name: "Outside world",
      type: "OUT",
      isOut: true,
      position: 2,
    });
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

    const day = (n: number) => new Date(Date.now() - n * 86_400_000);
    await core.transactions.create({
      description: "Salary",
      amount: 15_000,
      sourceId: outside.id,
      targetId: main.id,
      categoryId: salary.id,
      transactedAt: day(0),
    });
    await core.transactions.create({
      description: "Rohlik delivery",
      amount: 2_180,
      sourceId: main.id,
      targetId: outside.id,
      categoryId: groceries.id,
      transactedAt: day(0),
    });
    await core.transactions.create({
      description: "Electricity advance",
      amount: 3_450,
      sourceId: main.id,
      targetId: outside.id,
      categoryId: energy.id,
      transactedAt: day(0),
    });
    console.log("seed: done");
  }
} finally {
  await core.disconnect();
}
