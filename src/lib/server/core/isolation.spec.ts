/**
 * Household isolation. Two households hold the same kinds of data (even the
 * same names, VINs and tags); none of it may ever be visible to, or touchable
 * by, the other. Needs a migrated MySQL database reachable through
 * DATABASE_URL, like the rest of the core integration tests.
 */
import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Prisma } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ConflictError,
  NotFoundError,
  createCore,
  createPrismaClient,
  pickActiveHousehold,
  type HouseholdCore,
} from "./index";
import {
  GLOBAL_MODELS,
  TENANT_MODELS,
  scopeArgs,
  scopeToHousehold,
} from "./scope";

const notFound = (promise: Promise<unknown>) =>
  expect(promise).rejects.toBeInstanceOf(NotFoundError);

describe("tenant model registry", () => {
  const models = Prisma.dmmf.datamodel.models;

  it("every model that is not global has a householdId column", () => {
    for (const model of models) {
      const has = model.fields.some(
        (f) => f.name === "householdId" && f.type === "Int",
      );
      if (GLOBAL_MODELS.has(model.name)) continue;
      expect(has, `${model.name} needs a householdId`).toBe(true);
      expect(TENANT_MODELS.has(model.name)).toBe(true);
    }
  });

  it("only knows global models that exist", () => {
    const names = new Set(models.map((m) => m.name));
    for (const name of GLOBAL_MODELS) expect(names.has(name)).toBe(true);
  });

  it("keeps raw SQL out of the core layer except the filtered search", () => {
    const dir = import.meta.dirname;
    const raw = /\$(queryRaw|executeRaw)(Unsafe)?\b/;
    const offenders = readdirSync(dir)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".spec.ts"))
      .filter((f) => raw.test(readFileSync(join(dir, f), "utf8")));
    expect(offenders).toEqual(["transactions.ts"]);
    const source = readFileSync(join(dir, "transactions.ts"), "utf8");
    expect(source).toMatch(/WHERE t\.householdId = \$\{householdId\}/);
    expect(source).not.toMatch(/Unsafe/);
  });
});

describe("scopeArgs", () => {
  it("pins reads, updates and deletes to the household", () => {
    for (const op of [
      "findMany",
      "findFirst",
      "count",
      "updateMany",
      "delete",
    ]) {
      expect(scopeArgs(op, { where: { id: 1 } }, 5).where).toEqual({
        id: 1,
        householdId: 5,
      });
      expect(scopeArgs(op, undefined, 5).where).toEqual({ householdId: 5 });
    }
  });

  it("overrides a householdId the caller passes", () => {
    expect(
      scopeArgs("findMany", { where: { householdId: 9, OR: [{ id: 1 }] } }, 5)
        .where,
    ).toEqual({ householdId: 5, OR: [{ id: 1 }] });
    expect(
      scopeArgs("create", { data: { householdId: 9, n: 1 } }, 5).data,
    ).toEqual({ householdId: 5, n: 1 });
    expect(
      scopeArgs("update", { where: { id: 1 }, data: { householdId: 9 } }, 5),
    ).toEqual({ where: { id: 1, householdId: 5 }, data: { householdId: 5 } });
  });

  it("stamps every row of a bulk create and both sides of an upsert", () => {
    expect(
      scopeArgs("createMany", { data: [{ n: 1 }, { n: 2, householdId: 9 }] }, 5)
        .data,
    ).toEqual([
      { n: 1, householdId: 5 },
      { n: 2, householdId: 5 },
    ]);
    const upsert = scopeArgs(
      "upsert",
      { where: { id: 1 }, create: { n: 1 }, update: { n: 2 } },
      5,
    );
    expect(upsert).toEqual({
      where: { id: 1, householdId: 5 },
      create: { n: 1, householdId: 5 },
      update: { n: 2, householdId: 5 },
    });
  });

  it("refuses operations it does not know", () => {
    expect(() => scopeArgs("findRaw", {}, 5)).toThrow(/not allowed/);
  });

  it("rejects invalid household ids", () => {
    for (const id of [0, -1, 1.5, NaN]) {
      expect(() => scopeToHousehold({} as never, id)).toThrow(
        /Invalid household/,
      );
    }
  });
});

const url = process.env.DATABASE_URL;
const db = url ? createPrismaClient(url) : undefined;
const core = db ? createCore(db) : undefined;
const run = `iso${Date.now()}`;

describe.skipIf(!core)("household isolation", () => {
  const g = core!;
  const userIds: number[] = [];
  const householdIds: number[] = [];

  let a!: HouseholdCore;
  let b!: HouseholdCore;
  let ids!: Awaited<ReturnType<typeof seed>>;
  let seededB!: Awaited<ReturnType<typeof seed>>;

  /** The same shape of data in each household, under the same names. */
  async function seed(c: HouseholdCore) {
    const accounts = await c.accounts.list();
    const bank = accounts.find((x) => !x.isOut)!;
    const out = accounts.find((x) => x.isOut)!;
    const category = await c.categories.create({ name: "Food" });
    const tag = await c.tags.create({ name: "trip" });
    const component = await c.vehicles.components.create({ name: "Brakes" });
    const vehicle = await c.vehicles.create({
      name: "Car",
      brand: "Skoda",
      model: "Fabia",
      vin: "VIN-1",
      registration: "1AB 2345",
      categoryId: category.id,
    });
    const tx = await c.transactions.create({
      description: `${run} lunch`,
      amount: 100,
      sourceId: bank.id,
      targetId: out.id,
      categoryId: category.id,
      transactedAt: new Date("2026-05-10T12:00:00Z"),
      tags: ["trip"],
    });
    const pending = await c.transactions.create({
      description: `${run} rent`,
      amount: 500,
      sourceId: bank.id,
      targetId: out.id,
      transactedAt: new Date(Date.now() + 86_400_000),
    });
    const { checkpoint } = await c.checkpoints.create(bank.id, {
      amount: 1000,
      at: new Date("2026-05-11T12:00:00Z"),
    });
    const fuel = await c.vehicles.fuel.create(vehicle.id, {
      fueledAt: new Date("2026-05-12T12:00:00Z"),
      odometer: 1000,
      fuelAmount: 30,
      unitPrice: 1.5,
    });
    const service = await c.vehicles.service.create(vehicle.id, {
      type: "REGULAR_MAINTENANCE",
      title: "Annual",
      servicedAt: new Date("2026-05-13T12:00:00Z"),
      price: 200,
      componentIds: [component.id],
    });
    const meter = await c.meters.create({ name: "Power", unit: "kWh" });
    const reading = await c.meters.addReading(meter.id, { value: 10 });
    return {
      bank,
      out,
      category,
      tag,
      component,
      vehicle,
      tx,
      pending,
      checkpoint,
      fuel,
      service,
      meter,
      reading,
    };
  }

  // `ids` are household A's rows; `b` tries to reach them.
  beforeAll(async () => {
    const [first, second] = [
      await g.households.create({ name: `${run}-A` }),
      await g.households.create({ name: `${run}-B` }),
    ];
    householdIds.push(first.id, second.id);
    a = g.forHousehold(first.id);
    b = g.forHousehold(second.id);
    ids = await seed(a);
    seededB = await seed(b);
  });

  afterAll(async () => {
    for (const model of [
      "vehicleFuelEntry",
      "vehicleServiceEntry",
      "transaction",
      "vehicle",
      "vehicleComponent",
      "sourceState",
      "source",
      "category",
      "tag",
      "meterState",
      "meter",
      "appSettings",
    ] as const) {
      await (
        db![model] as unknown as {
          deleteMany: (a: object) => Promise<unknown>;
        }
      ).deleteMany({ where: { householdId: { in: householdIds } } });
    }
    await db!.membership.deleteMany({
      where: { householdId: { in: householdIds } },
    });
    await db!.household.deleteMany({ where: { id: { in: householdIds } } });
    for (const id of userIds) await g.users.remove(id).catch(() => {});
    await g.disconnect();
  });

  it("starts every household with its own default accounts", async () => {
    expect((await a.accounts.list()).map((x) => x.name).sort()).toEqual([
      "Bank account",
      "Expenses",
    ]);
    expect((await b.accounts.list()).map((x) => x.id)).not.toContain(
      ids.bank.id,
    );
  });

  describe("lists show only the household's own rows", () => {
    it("accounts, categories, tags, vehicles, components, meters", async () => {
      const own = (rows: { id: number }[]) => rows.map((r) => r.id).sort();
      expect(own(await b.accounts.list())).toEqual(
        own([seededB.bank, seededB.out]),
      );
      expect(own(await b.accounts.listWithBalances())).toEqual(
        own([seededB.bank, seededB.out]),
      );
      // B also has the "N/A" category its checkpoint created.
      const categories = own(await b.categories.list());
      expect(categories).toContain(seededB.category.id);
      expect(categories).not.toContain(ids.category.id);
      expect(
        own(
          await b.categories.listWithActivity({
            from: new Date("2026-01-01"),
            to: new Date("2027-01-01"),
          }),
        ),
      ).toEqual(categories);
      expect(own(await b.tags.list())).toEqual([seededB.tag.id]);
      expect(own(await b.vehicles.list())).toEqual([seededB.vehicle.id]);
      expect(own(await b.vehicles.components.list())).toEqual([
        seededB.component.id,
      ]);
      expect(own(await b.meters.list())).toEqual([seededB.meter.id]);
    });

    it("transactions, in every kind of listing", async () => {
      const mine = [seededB.tx.id, seededB.pending.id].sort();
      const idsOf = async (filter = {}) =>
        (await b.transactions.list({ ...filter, limit: 500 })).items
          .map((t) => t.id)
          .sort();
      expect(await idsOf()).toEqual(expect.arrayContaining(mine) as number[]);
      const all = await idsOf();
      for (const t of [ids.tx, ids.pending]) expect(all).not.toContain(t.id);

      // Text search runs raw SQL: it must filter by household as well.
      const found = await b.transactions.list({ search: run });
      expect(found.total).toBe(2);
      expect(found.items.map((t) => t.id).sort()).toEqual(mine);

      expect(
        (
          await b.transactions.upcoming(new Date(Date.now() + 7 * 86_400_000))
        ).map((t) => t.id),
      ).toEqual([seededB.pending.id]);
      expect(await b.transactions.tags()).toEqual(["trip"]);
      expect(await idsOf({ tag: "trip" })).toEqual([seededB.tx.id]);
    });

    it("an account's journal, balance and checkpoints", async () => {
      // B asking about A's account sees nothing, not an error or A's numbers.
      expect((await b.ledger.forAccount(ids.bank.id)).total).toBe(0);
      expect(
        (await b.ledger.forAccount(ids.bank.id, {}, { checkpointsOnly: true }))
          .total,
      ).toBe(0);
      expect(await b.checkpoints.list(ids.bank.id)).toEqual([]);
      await notFound(b.checkpoints.suggest(ids.bank.id));
      await notFound(b.accounts.balanceAt(ids.bank.id, new Date()));
      await notFound(b.accounts.trajectory(ids.bank.id));
    });

    it("activity totals and monthly series", async () => {
      const range = {
        from: new Date("2026-01-01"),
        to: new Date("2027-01-01"),
      };
      const mine = (await b.categories.listWithActivity(range)).find(
        (c) => c.id === seededB.category.id,
      );
      // The lunch (100) and the service (200) booked on the vehicle's category.
      expect(mine?.spent).toBe(300);
      expect((await b.tags.listWithActivity(range))[0].spent).toBe(100);
      // A's category id queried from B: zero everywhere.
      const series = await b.categories.spendingByMonth(ids.category.id, range);
      expect(series.every((m) => m.spent === 0)).toBe(true);
      const tagSeries = await b.tags.spendingByMonth(ids.tag.id, range);
      expect(tagSeries.every((m) => m.spent === 0)).toBe(true);
    });
  });

  describe("another household's ids are simply not found", () => {
    it("accounts", async () => {
      await notFound(b.accounts.get(ids.bank.id));
      await notFound(b.accounts.update(ids.bank.id, { name: "pwned" }));
      await notFound(b.accounts.remove(ids.bank.id));
      await notFound(b.accounts.recordState(ids.bank.id, 1));
      expect((await a.accounts.get(ids.bank.id)).name).toBe("Bank account");
    });

    it("categories", async () => {
      await notFound(b.categories.get(ids.category.id));
      await notFound(b.categories.update(ids.category.id, { name: "pwned" }));
      await notFound(b.categories.remove(ids.category.id));
      // Neither as the one being deleted nor as the one transactions move to.
      await notFound(
        b.categories.remove(ids.category.id, {
          reassignTo: (await b.categories.list())[0].id,
        }),
      );
      await notFound(
        b.categories.remove((await b.categories.list())[0].id, {
          reassignTo: ids.category.id,
        }),
      );
      expect((await a.categories.get(ids.category.id)).name).toBe("Food");
      expect((await a.transactions.get(ids.tx.id)).categoryId).toBe(
        ids.category.id,
      );
    });

    it("tags", async () => {
      await notFound(b.tags.get(ids.tag.id));
      await notFound(b.tags.update(ids.tag.id, { name: "pwned" }));
      await notFound(b.tags.remove(ids.tag.id));
      expect((await a.tags.get(ids.tag.id)).name).toBe("trip");
    });

    it("transactions", async () => {
      await notFound(b.transactions.get(ids.tx.id));
      await notFound(b.transactions.update(ids.tx.id, { amount: 1 }));
      await notFound(b.transactions.confirm(ids.pending.id));
      await notFound(b.transactions.remove(ids.tx.id));
      const untouched = await a.transactions.get(ids.tx.id);
      expect(untouched.amount).toBe(100);
      expect((await a.transactions.get(ids.pending.id)).confirmed).toBe(false);
    });

    it("checkpoints", async () => {
      await notFound(b.checkpoints.create(ids.bank.id, { amount: 1 }));
      await notFound(b.checkpoints.remove(ids.bank.id, ids.checkpoint.id));
      expect((await a.checkpoints.list(ids.bank.id)).length).toBe(1);
    });

    it("vehicles, entries and components", async () => {
      await notFound(b.vehicles.get(ids.vehicle.id));
      await notFound(b.vehicles.update(ids.vehicle.id, { name: "pwned" }));
      await notFound(b.vehicles.remove(ids.vehicle.id));
      await notFound(b.vehicles.fuel.list(ids.vehicle.id));
      await notFound(
        b.vehicles.fuel.create(ids.vehicle.id, {
          fueledAt: new Date(),
          odometer: 1,
          fuelAmount: 1,
          unitPrice: 1,
        }),
      );
      await notFound(
        b.vehicles.fuel.update(ids.vehicle.id, ids.fuel.id, { odometer: 5 }),
      );
      await notFound(b.vehicles.fuel.remove(ids.vehicle.id, ids.fuel.id));
      await notFound(b.vehicles.service.list(ids.vehicle.id));
      await notFound(
        b.vehicles.service.create(ids.vehicle.id, {
          type: "DEFECT",
          title: "x",
          servicedAt: new Date(),
        }),
      );
      await notFound(
        b.vehicles.service.update(ids.vehicle.id, ids.service.id, {
          title: "pwned",
        }),
      );
      await notFound(b.vehicles.service.remove(ids.vehicle.id, ids.service.id));
      await notFound(
        b.vehicles.components.update(ids.component.id, { name: "pwned" }),
      );
      await notFound(b.vehicles.components.remove(ids.component.id));
      const detail = await a.vehicles.get(ids.vehicle.id);
      expect(detail.name).toBe("Car");
      expect(detail.fuelEntries).toHaveLength(1);
      expect(detail.serviceEntries).toHaveLength(1);
    });

    it("meters and readings", async () => {
      await notFound(b.meters.get(ids.meter.id));
      await notFound(b.meters.update(ids.meter.id, { name: "pwned" }));
      await notFound(b.meters.addReading(ids.meter.id, { value: 99 }));
      await notFound(b.meters.removeReading(ids.reading.id));
      expect((await a.meters.get(ids.meter.id)).readings).toHaveLength(1);
    });
  });

  describe("writes cannot point at another household's rows", () => {
    it("a transaction cannot use foreign accounts or categories", async () => {
      const input = {
        description: "x",
        amount: 1,
        sourceId: seededB.bank.id,
        targetId: seededB.out.id,
      };
      await notFound(
        b.transactions.create({ ...input, sourceId: ids.bank.id }),
      );
      await notFound(b.transactions.create({ ...input, targetId: ids.out.id }));
      await notFound(
        b.transactions.create({ ...input, categoryId: ids.category.id }),
      );
      const own = await b.transactions.create(input);
      await notFound(b.transactions.update(own.id, { sourceId: ids.bank.id }));
      await notFound(
        b.transactions.update(own.id, { categoryId: ids.category.id }),
      );
      await b.transactions.remove(own.id);
    });

    it("a vehicle cannot use a foreign category", async () => {
      await notFound(
        b.vehicles.create({
          name: "x",
          brand: "x",
          model: "x",
          vin: "VIN-2",
          registration: "2",
          categoryId: ids.category.id,
        }),
      );
      await notFound(
        b.vehicles.update(seededB.vehicle.id, {
          fuelCategoryId: ids.category.id,
        }),
      );
    });

    it("a service cannot use a foreign component", async () => {
      await notFound(
        b.vehicles.service.create(seededB.vehicle.id, {
          type: "DEFECT",
          title: "x",
          servicedAt: new Date(),
          componentIds: [ids.component.id],
        }),
      );
    });

    it("a fill-up cannot follow another household's fill-up", async () => {
      await expect(
        b.vehicles.fuel.create(seededB.vehicle.id, {
          fueledAt: new Date("2026-06-01T12:00:00Z"),
          odometer: 2000,
          fuelAmount: 10,
          unitPrice: 1,
          previousFullTankFuelEntryId: ids.fuel.id,
        }),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("settings cannot point at foreign rows", async () => {
      await notFound(b.settings.update({ mankoCategoryId: ids.category.id }));
      await notFound(b.settings.update({ defaultOutAccountId: ids.out.id }));
    });
  });

  describe("names are only unique within a household", () => {
    it("allows the same category, tag, VIN, plate and component in both", async () => {
      // seed() already created the same ones in A and B; B's are its own.
      expect(seededB.category.name).toBe(ids.category.name);
      expect(seededB.vehicle.vin).toBe(ids.vehicle.vin);
      expect(seededB.vehicle.registration).toBe(ids.vehicle.registration);
      expect(seededB.component.name).toBe(ids.component.name);
    });

    it("still rejects duplicates inside one household", async () => {
      await expect(
        b.categories.create({ name: "Food" }),
      ).rejects.toBeInstanceOf(ConflictError);
      await expect(b.tags.create({ name: "trip" })).rejects.toBeInstanceOf(
        ConflictError,
      );
      await expect(
        b.vehicles.components.create({ name: "Brakes" }),
      ).rejects.toBeInstanceOf(ConflictError);
      await expect(
        b.vehicles.create({
          name: "dup",
          brand: "x",
          model: "x",
          vin: "VIN-1",
          registration: "other",
        }),
      ).rejects.toThrow(/vin/i);
    });

    it("never reveals that another household has the name", async () => {
      // Creating something A already has must succeed in a household without
      // it: otherwise the conflict message would leak A's data.
      const [fresh] = [
        g.forHousehold((await g.households.create({ name: `${run}-C` })).id),
      ];
      householdIds.push(fresh.householdId);
      await fresh.categories.create({ name: "Food" });
      await fresh.tags.create({ name: "trip" });
      await fresh.vehicles.components.create({ name: "Brakes" });
      const vehicle = await fresh.vehicles.create({
        name: "Car",
        brand: "Skoda",
        model: "Fabia",
        vin: "VIN-1",
        registration: "1AB 2345",
      });
      expect(vehicle.vin).toBe("VIN-1");
    });

    it("tags named like another household's tag are created, not shared", async () => {
      const tx = await b.transactions.create({
        description: `${run} shared-name`,
        amount: 1,
        sourceId: seededB.bank.id,
        targetId: seededB.out.id,
        tags: ["trip", "only-b"],
      });
      const tagIds = tx.tags.map((t) => t.id);
      expect(tagIds).toContain(seededB.tag.id);
      expect(tagIds).not.toContain(ids.tag.id);
      expect((await a.tags.list()).map((t) => t.name)).toEqual(["trip"]);
      expect(await a.transactions.tags()).toEqual(["trip"]);
      await b.transactions.remove(tx.id);
    });
  });

  describe("settings", () => {
    it("are per household", async () => {
      await a.settings.update({ currency: "EUR" });
      expect((await a.settings.get()).currency).toBe("EUR");
      expect((await b.settings.get()).currency).not.toBe("EUR");
      const rows = await db!.appSettings.findMany({
        where: { householdId: { in: [a.householdId, b.householdId] } },
      });
      expect(rows).toHaveLength(2);
    });

    it("never fall back to another household's rows", async () => {
      const empty = g.forHousehold(
        (await g.households.create({ name: `${run}-D` })).id,
      );
      householdIds.push(empty.householdId);
      // Remove its own external account: A and B still have theirs.
      const own = (await empty.accounts.list()).filter((x) => x.isOut);
      for (const x of own) await empty.accounts.remove(x.id);
      const settings = await empty.settings.get();
      expect(settings.defaultOutAccountId).toBeNull();
      expect(settings.mankoCategoryId).not.toBe(ids.category.id);
      expect((await empty.categories.list()).map((c) => c.name)).toEqual([
        "N/A",
      ]);
    });
  });

  describe("the scoped client", () => {
    it("keeps interactive and batched transactions scoped", async () => {
      const scoped = scopeToHousehold(db!, b.householdId);
      const inside = await scoped.$transaction(async (tx) => ({
        accounts: await tx.source.findMany(),
        found: await tx.source.findUnique({ where: { id: ids.bank.id } }),
        deleted: await tx.source.deleteMany({ where: { id: ids.bank.id } }),
      }));
      expect(inside.accounts.map((x) => x.id).sort()).toEqual(
        [seededB.bank.id, seededB.out.id].sort(),
      );
      expect(inside.found).toBeNull();
      expect(inside.deleted.count).toBe(0);

      const [counted, wiped] = await scoped.$transaction([
        scoped.source.count(),
        scoped.transaction.updateMany({
          where: { description: { contains: run } },
          data: { description: `${run} touched` },
        }),
      ]);
      expect(counted).toBe(2);
      expect(wiped.count).toBe(2); // B's two transactions, not A's.
      expect((await a.transactions.get(ids.tx.id)).description).toBe(
        `${run} lunch`,
      );
    });

    it("stamps created rows with its household whatever the caller says", async () => {
      const scoped = scopeToHousehold(db!, b.householdId);
      const row = await scoped.category.create({
        data: { name: `${run}-stamp`, householdId: a.householdId },
      });
      expect(row.householdId).toBe(b.householdId);
      await scoped.category.delete({ where: { id: row.id } });
    });

    it("cannot move a row to another household", async () => {
      const scoped = scopeToHousehold(db!, b.householdId);
      const row = await scoped.category.create({
        data: { name: `${run}-move` },
      });
      const moved = await scoped.category.update({
        where: { id: row.id },
        data: { householdId: a.householdId },
      });
      expect(moved.householdId).toBe(b.householdId);
      await scoped.category.delete({ where: { id: row.id } });
    });

    it("never matches rows via a caller-supplied householdId", async () => {
      const scoped = scopeToHousehold(db!, b.householdId);
      // Asking for A's rows by household yields B's own, never A's.
      const rows = await scoped.category.findMany({
        where: { householdId: a.householdId },
      });
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every((r) => r.householdId === b.householdId)).toBe(true);
      expect(
        await scoped.category.count({
          where: {
            OR: [{ householdId: a.householdId }, { id: ids.category.id }],
          },
        }),
      ).toBe(0);
    });
  });

  describe("members and sessions", () => {
    it("tracks who belongs where, and only that", async () => {
      const user = await g.users.create({
        email: `${run}-m@example.com`,
        password: "correct horse",
      });
      userIds.push(user.id);
      expect(user.isAdmin).toBe(false);
      expect(await g.households.forUser(user.id)).toEqual([]);

      await g.households.addMember(a.householdId, user.id);
      await g.households.addMember(a.householdId, user.id); // idempotent
      expect(await g.households.isMember(user.id, a.householdId)).toBe(true);
      expect(await g.households.isMember(user.id, b.householdId)).toBe(false);
      expect((await g.households.forUser(user.id)).map((h) => h.id)).toEqual([
        a.householdId,
      ]);
      const listed = (await g.households.list()).find(
        (h) => h.id === a.householdId,
      );
      expect(listed?.members.map((m) => m.id)).toEqual([user.id]);
      expect(JSON.stringify(listed)).not.toContain("scrypt");

      await g.households.addMember(b.householdId, user.id);
      expect(
        (await g.households.forUser(user.id)).map((h) => h.id).sort(),
      ).toEqual([a.householdId, b.householdId].sort());
    });

    it("rejects unknown households and users", async () => {
      await notFound(g.households.addMember(a.householdId, 2_000_000_000));
      await notFound(g.households.addMember(2_000_000_000, userIds[0]));
      await notFound(g.households.get(2_000_000_000));
    });

    it("removing a member also takes the session out of that household", async () => {
      const user = await g.users.create({
        email: `${run}-r@example.com`,
        password: "correct horse",
      });
      userIds.push(user.id);
      await g.households.addMember(a.householdId, user.id);
      const { token } = await g.sessions.create(user.id, a.householdId);
      expect((await g.sessions.validate(token))?.householdId).toBe(
        a.householdId,
      );

      await g.households.removeMember(a.householdId, user.id);
      expect(await g.households.forUser(user.id)).toEqual([]);
      expect((await g.sessions.validate(token))?.householdId).toBeNull();

      await g.sessions.setHousehold(token, b.householdId);
      expect((await g.sessions.validate(token))?.householdId).toBe(
        b.householdId,
      );
    });

    it("deleting a user removes memberships and sessions", async () => {
      const user = await g.users.create({
        email: `${run}-d@example.com`,
        password: "correct horse",
      });
      await g.households.addMember(a.householdId, user.id);
      const { token } = await g.sessions.create(user.id, a.householdId);
      await g.users.remove(user.id);
      expect(await g.sessions.validate(token)).toBeNull();
      expect(await db!.membership.count({ where: { userId: user.id } })).toBe(
        0,
      );
    });

    it("works in the first household when the remembered one is gone", () => {
      const list = [{ id: 3 }, { id: 5 }];
      expect(pickActiveHousehold(list, 5)).toEqual({ id: 5 });
      expect(pickActiveHousehold(list, 9)).toEqual({ id: 3 });
      expect(pickActiveHousehold(list, null)).toEqual({ id: 3 });
      expect(pickActiveHousehold([], 5)).toBeNull();
    });
  });
});
