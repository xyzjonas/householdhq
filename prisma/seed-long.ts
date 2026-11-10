/**
 * Stress-test seed: records with very long names/descriptions (including
 * unbreakable strings) to expose layout overflow. Idempotent.
 * Used by e2e/overflow.e2e.ts; run after `npm run db:seed`.
 */
import "dotenv/config";
import { createCore, createPrismaClient } from "../src/lib/server/core";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const core = createCore(createPrismaClient(url));

const WORDS = "A very long name that keeps going";
const UNBROKEN = "Supercalifragilisticexpialidocious".repeat(3);
const long = (tag: string) => `${tag} ${WORDS} ${UNBROKEN}`;

try {
  const household = (await core.households.list())[0];
  if (!household) throw new Error("seed-long: run `npm run db:seed` first");
  const hq = core.forHousehold(household.id);
  if ((await hq.accounts.list()).some((a) => a.name.startsWith("LONG"))) {
    console.log("seed-long: already seeded");
  } else {
    await hq.ensureDefaults();
    const accounts = await hq.accounts.list();
    const outside = accounts.find((a) => a.isOut)!;

    const account = await hq.accounts.create({
      name: long("LONG account"),
      type: "ACCOUNT",
      isDisponible: true,
      position: 90,
    });
    const portfolio = await hq.accounts.create({
      name: long("LONG portfolio"),
      type: "INVESTMENT",
      isPortfolio: true,
      position: 91,
    });
    await hq.accounts.recordState(account.id, 123_456_789.55);
    await hq.accounts.recordState(portfolio.id, 987_654_321.11);

    const category = await hq.categories.create({
      name: long("LONG category"),
      description: long("LONG category description"),
    });
    const tag = await hq.tags.create({
      name: long("LONG tag"),
      description: long("LONG tag description"),
    });

    for (let i = 0; i < 3; i++) {
      await hq.transactions.create({
        description: long(`LONG transaction ${i}`),
        amount: 99_999_999 + i,
        sourceId: account.id,
        targetId: outside.id,
        categoryId: category.id,
        transactedAt: new Date(),
        tags: [tag.name],
        isImportant: i === 0,
      });
    }
    await hq.transactions.create({
      description: long("LONG pending recurring"),
      amount: 5_000,
      sourceId: account.id,
      targetId: outside.id,
      categoryId: category.id,
      transactedAt: new Date(Date.now() + 7 * 864e5),
      confirmed: false,
      recurring: 1,
    });

    const meter = await hq.meters.create({
      name: long("LONG meter"),
      unit: "kWh",
      meterNumber: UNBROKEN.slice(0, 60),
    });
    await hq.meters.addReading(meter.id, { value: 123_456.789 });
    await hq.meters.addReading(meter.id, {
      value: 123_999.1,
      meteredAt: new Date(Date.now() + 864e5),
    });

    const vehicle = await hq.vehicles.create({
      name: long("LONG vehicle"),
      brand: long("LONG brand"),
      model: long("LONG model"),
      vin: UNBROKEN.slice(0, 60),
      registration: UNBROKEN.slice(0, 30),
      fuelType: long("LONG fuel"),
      purchasePrice: 9_999_999,
      defaultFuelTransactionTitle: long("LONG fuel title"),
      categoryId: category.id,
    });

    // A second household with an unbreakable name, for the admin page and the
    // household title/switcher, with everyone from the first one in it.
    const longHousehold = await core.households.create({
      name: `LONG household ${UNBROKEN.slice(0, 80)}`,
      icon: "car",
      color: "#d9480f",
    });
    for (const member of household.members) {
      await core.households.addMember(longHousehold.id, member.id);
    }
    console.log(`seed-long: created long-text data (vehicle ${vehicle.id})`);
  }
} finally {
  await core.disconnect();
}
