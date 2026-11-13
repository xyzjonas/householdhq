/**
 * Integration tests for the core layer. Needs a migrated MySQL database
 * reachable through DATABASE_URL (see `just test-unit`).
 */
import "dotenv/config";
import { afterAll, describe, expect, it, vi } from "vitest";
import { ensureDefaultAccounts } from "./bootstrap";
import type { Db } from "./prisma";
import { settingsRepo } from "./settings";
import {
  createCore,
  createPrismaClient,
  ConflictError,
  NotFoundError,
} from "./index";

const url = process.env.DATABASE_URL;
const db = url ? createPrismaClient(url) : undefined;
const core = db ? createCore(db) : undefined;
const run = `t${Date.now()}`;
const HID = 7;

describe("ensureDefaultAccounts", () => {
  const fake = (existing: number) => {
    const create = vi.fn().mockResolvedValue({});
    const db = { source: { count: async () => existing, create } };
    return { db: db as unknown as Db, create };
  };

  it("creates the bank account first and the expense account second when blank", async () => {
    const { db, create } = fake(0);
    expect(await ensureDefaultAccounts(db)).toBe(true);
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[0][0].data).toMatchObject({
      type: "ACCOUNT",
      isDisponible: true,
    });
    expect(create.mock.calls[1][0].data).toMatchObject({
      type: "OUT",
      isOut: true,
    });
  });

  it("does nothing when accounts already exist", async () => {
    const { db, create } = fake(3);
    expect(await ensureDefaultAccounts(db)).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("settings", () => {
  const row = {
    id: 1,
    currency: "EUR",
    mankoCategoryId: 7,
    defaultOutAccountId: 3,
  };
  const fake = (existing: typeof row | null = null) => {
    const upsert = vi.fn().mockResolvedValue(row);
    const findUnique = vi.fn().mockResolvedValue(existing);
    const db = { appSettings: { upsert, findUnique } } as unknown as Db;
    return { repo: settingsRepo(db, HID), upsert, findUnique };
  };

  it("get creates the singleton row with defaults when missing", async () => {
    const { repo, upsert } = fake();
    await repo.get();
    expect(upsert).toHaveBeenCalledWith({
      where: { householdId: HID },
      create: { householdId: HID },
      update: {},
    });
  });

  it("get only reads when the row already exists", async () => {
    const { repo, upsert, findUnique } = fake(row);
    expect(await repo.get()).toEqual(row);
    expect(findUnique).toHaveBeenCalledWith({ where: { householdId: HID } });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("update normalizes the currency and only touches given fields", async () => {
    const { repo, upsert } = fake();
    await repo.update({ currency: " eur " });
    expect(upsert).toHaveBeenCalledWith({
      where: { householdId: HID },
      create: { householdId: HID, currency: "EUR" },
      update: { currency: "EUR" },
    });
    await repo.update({});
    expect(upsert.mock.calls[1][0].update).toEqual({});
  });

  it("update accepts a fiscal interval start day and rejects bad ones", async () => {
    const { repo, upsert } = fake();
    await repo.update({ fiscalIntervalStartDay: 14 });
    expect(upsert.mock.calls[0][0].update).toEqual({
      fiscalIntervalStartDay: 14,
    });
    await expect(repo.update({ fiscalIntervalStartDay: 0 })).rejects.toThrow();
    await expect(repo.update({ fiscalIntervalStartDay: 32 })).rejects.toThrow();
    await expect(
      repo.update({ fiscalIntervalStartDay: 1.5 }),
    ).rejects.toThrow();
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("update only accepts an existing external account as the default out account", async () => {
    const upsert = vi.fn().mockResolvedValue({});
    const findUnique = vi.fn();
    const repo = settingsRepo(
      {
        appSettings: { upsert },
        source: { findUnique },
      } as unknown as Db,
      HID,
    );

    findUnique.mockResolvedValueOnce(null);
    await expect(
      repo.update({ defaultOutAccountId: 9 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    findUnique.mockResolvedValueOnce({ id: 1, name: "Bank", isOut: false });
    await expect(
      repo.update({ defaultOutAccountId: 1 }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(upsert).not.toHaveBeenCalled();

    findUnique.mockResolvedValueOnce({ id: 2, name: "Expenses", isOut: true });
    await repo.update({ defaultOutAccountId: 2 });
    expect(upsert.mock.calls[0][0].update).toEqual({ defaultOutAccountId: 2 });
  });

  it("update rejects invalid currencies", async () => {
    const { repo, upsert } = fake();
    await expect(repo.update({ currency: "EURO" })).rejects.toThrow();
    await expect(repo.update({ currency: "12" })).rejects.toThrow();
    expect(upsert).not.toHaveBeenCalled();
  });
});

// Everything below runs inside one household of its own.
const household = core
  ? await core.households.create({ name: `${run}-household` })
  : undefined;

describe.skipIf(!core)("core layer", () => {
  const g = core!;
  const c = g.forHousehold(household!.id);
  const ids = {
    accounts: [] as number[],
    categories: [] as number[],
    tags: [] as number[],
    transactions: [] as number[],
    users: [] as number[],
    vehicles: [] as number[],
  };

  afterAll(async () => {
    // Vehicles first: they own transactions that cannot be removed alone.
    for (const id of ids.vehicles) await c.vehicles.remove(id).catch(() => {});
    for (const id of ids.transactions)
      await c.transactions.remove(id).catch(() => {});
    for (const id of ids.accounts) await c.accounts.remove(id).catch(() => {});
    for (const id of ids.categories)
      await c.categories.remove(id).catch(() => {});
    for (const id of ids.tags) await c.tags.remove(id).catch(() => {});
    for (const id of ids.users) await g.users.remove(id).catch(() => {});
    // Whatever the household still owns (checkpoints, settings, ...) goes with it.
    for (const model of [
      "appSettings",
      "sourceState",
      "meterState",
      "meter",
      "vehicleComponent",
    ] as const) {
      await (
        db![model] as unknown as {
          deleteMany: (a: object) => Promise<unknown>;
        }
      ).deleteMany({ where: { householdId: household!.id } });
    }
    await db!.household.delete({ where: { id: household!.id } });
    await g.disconnect();
  });

  describe("sessions", () => {
    it("creates, validates and invalidates sessions", async () => {
      const user = await g.users.create({
        email: `${run}-s@example.com`,
        password: "correct horse",
      });
      ids.users.push(user.id);

      const { token } = await g.sessions.create(user.id);
      expect(token.length).toBeGreaterThan(30);
      const valid = await g.sessions.validate(token);
      expect(valid?.user).toEqual(user);
      expect(valid?.renewed).toBe(false);

      await g.sessions.invalidate(token);
      expect(await g.sessions.validate(token)).toBeNull();
      expect(await g.sessions.validate("not-a-token")).toBeNull();
    });

    it("rejects expired sessions and renews old ones", async () => {
      const user = await g.users.create({
        email: `${run}-e@example.com`,
        password: "correct horse",
      });
      ids.users.push(user.id);

      const expired = await g.sessions.create(user.id);
      await db!.session.updateMany({
        where: { userId: user.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      expect(await g.sessions.validate(expired.token)).toBeNull();

      const old = await g.sessions.create(user.id);
      await db!.session.updateMany({
        where: { userId: user.id },
        data: { expiresAt: new Date(Date.now() + 60_000) },
      });
      const renewed = await g.sessions.validate(old.token);
      expect(renewed?.renewed).toBe(true);
      expect(renewed!.expiresAt.getTime()).toBeGreaterThan(
        Date.now() + 86_400_000,
      );

      await g.sessions.invalidateAllForUser(user.id);
      expect(await g.sessions.validate(old.token)).toBeNull();
    });

    it("stores only a hash of the token", async () => {
      const user = await g.users.create({
        email: `${run}-h@example.com`,
        password: "correct horse",
      });
      ids.users.push(user.id);
      const { token } = await g.sessions.create(user.id);
      expect(await db!.session.findUnique({ where: { id: token } })).toBeNull();
      await g.sessions.invalidateAllForUser(user.id);
    });
  });

  describe("meters", () => {
    it("records readings newest first and edits the meter", async () => {
      const meter = await c.meters.create({
        name: `${run}-meter`,
        unit: "kWh",
        meterNumber: " ",
      });
      try {
        expect(meter.meterNumber).toBeNull();
        await c.meters.addReading(meter.id, {
          value: 100,
          meteredAt: new Date("2026-01-01T10:00:00Z"),
        });
        const newer = await c.meters.addReading(meter.id, {
          value: 130.5,
          meteredAt: new Date("2026-02-01T10:00:00Z"),
        });

        const loaded = await c.meters.get(meter.id);
        expect(loaded.readings.map((r) => r.value)).toEqual([130.5, 100]);
        expect(
          (await c.meters.list()).find((m) => m.id === meter.id)?.readings,
        ).toHaveLength(2);

        const updated = await c.meters.update(meter.id, { unit: "MWh" });
        expect(updated.unit).toBe("MWh");

        await c.meters.removeReading(newer.id);
        expect((await c.meters.get(meter.id)).readings).toHaveLength(1);
        await expect(c.meters.removeReading(newer.id)).rejects.toBeInstanceOf(
          NotFoundError,
        );
        await expect(
          c.meters.addReading(meter.id + 100000, { value: 1 }),
        ).rejects.toBeInstanceOf(NotFoundError);
      } finally {
        await db!.meterState.deleteMany({ where: { meterId: meter.id } });
        await db!.meter.delete({ where: { id: meter.id } });
      }
    });
  });

  describe("categories", () => {
    it("creates, reads, updates and deletes", async () => {
      const created = await c.categories.create({ name: `${run}-cat` });
      ids.categories.push(created.id);
      expect((await c.categories.get(created.id)).name).toBe(`${run}-cat`);

      const updated = await c.categories.update(created.id, { color: "#fff" });
      expect(updated.color).toBe("#fff");

      await c.categories.remove(created.id);
      await expect(c.categories.get(created.id)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it("lists categories by recent usage, then all-time usage", async () => {
      const main = await c.accounts.create({ name: `${run}-rank-main` });
      const outside = await c.accounts.create({
        name: `${run}-rank-out`,
        type: "OUT",
      });
      ids.accounts.push(main.id, outside.id);
      // Names sort the opposite way round to the expected ranking.
      const unused = await c.categories.create({ name: `${run}-rank-a` });
      const old = await c.categories.create({ name: `${run}-rank-b` });
      const hot = await c.categories.create({ name: `${run}-rank-c` });
      ids.categories.push(unused.id, old.id, hot.id);

      const spend = async (categoryId: number, transactedAt: Date) => {
        const t = await c.transactions.create({
          description: `${run}-rank`,
          amount: 1,
          sourceId: main.id,
          targetId: outside.id,
          categoryId,
          transactedAt,
        });
        ids.transactions.push(t.id);
      };
      const longAgo = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
      // `old` has more transactions overall, but only `hot` is recent.
      await spend(old.id, longAgo);
      await spend(old.id, longAgo);
      await spend(hot.id, new Date());

      const order = (await c.categories.list())
        .map((x) => x.id)
        .filter((id) => [unused.id, old.id, hot.id].includes(id));
      expect(order).toEqual([hot.id, old.id, unused.id]);
    });

    it("moves transactions to another category when deleting", async () => {
      const doomed = await c.categories.create({ name: `${run}-doomed` });
      const heir = await c.categories.create({ name: `${run}-heir` });
      ids.categories.push(heir.id);
      await expect(
        c.categories.remove(doomed.id, { reassignTo: doomed.id }),
      ).rejects.toBeInstanceOf(ConflictError);

      await c.categories.remove(doomed.id, { reassignTo: heir.id });
      await expect(c.categories.get(doomed.id)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(
        c.categories.remove(doomed.id, { reassignTo: heir.id }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("sums spending and income per category within a range", async () => {
      const category = await c.categories.create({ name: `${run}-act` });
      ids.categories.push(category.id);
      const main = await c.accounts.create({ name: `${run}-act-main` });
      const outside = await c.accounts.create({
        name: `${run}-act-out`,
        isOut: true,
        type: "OUT",
      });
      ids.accounts.push(main.id, outside.id);
      const tx = async (
        amount: number,
        sourceId: number,
        targetId: number,
        transactedAt: Date,
        extra: { cancelled?: boolean } = {},
      ) => {
        const t = await c.transactions.create({
          description: `${run}-act`,
          amount,
          sourceId,
          targetId,
          categoryId: category.id,
          transactedAt,
        });
        if (extra.cancelled) {
          await db!.transaction.update({
            where: { id: t.id },
            data: { cancelled: true },
          });
        }
        ids.transactions.push(t.id);
      };
      const from = new Date("2001-02-01T00:00:00Z");
      const to = new Date("2001-03-01T00:00:00Z");
      const inRange = new Date("2001-02-10T12:00:00Z");
      await tx(100, main.id, outside.id, inRange);
      await tx(50, main.id, outside.id, inRange);
      await tx(900, outside.id, main.id, inRange);
      await tx(70, main.id, outside.id, inRange, { cancelled: true });
      await tx(999, main.id, outside.id, new Date("2001-03-01T00:00:00Z"));

      const found = (await c.categories.listWithActivity({ from, to })).find(
        (x) => x.id === category.id,
      );
      expect(found).toMatchObject({ spent: 150, received: 900 });

      // Per-month series: zero-filled, spending only, bounded by the range.
      await tx(25, main.id, outside.id, new Date("2000-12-20T12:00:00Z"));
      const range = { from: new Date("2000-12-01T00:00:00Z"), to };
      const monthly = await c.categories.spendingByMonth(category.id, range);
      expect(monthly.map((m) => m.spent)).toEqual([25, 0, 150]);
      expect(monthly[0].monthStart).toEqual(range.from);
      // Without `from` the series starts at the first month with spending.
      expect(
        (await c.categories.spendingByMonth(category.id, { to })).map(
          (m) => m.spent,
        ),
      ).toEqual([25, 0, 150]);
      // Income series: incoming money only.
      expect(
        (
          await c.categories.spendingByMonth(category.id, range, "received")
        ).map((m) => m.spent),
      ).toEqual([0, 0, 900]);
      // Transfer series: money moved between two household accounts.
      const savings = await c.accounts.create({ name: `${run}-act-savings` });
      ids.accounts.push(savings.id);
      await tx(300, main.id, savings.id, inRange);
      expect(
        (
          await c.categories.spendingByMonth(category.id, range, "transferred")
        ).map((m) => m.spent),
      ).toEqual([0, 0, 300]);
    });

    it("rejects duplicate names", async () => {
      const first = await c.categories.create({ name: `${run}-dup` });
      ids.categories.push(first.id);
      await expect(
        c.categories.create({ name: `${run}-dup` }),
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe("tags", () => {
    it("creates, reads, updates and deletes", async () => {
      const created = await c.tags.create({ name: `${run}-tag` });
      ids.tags.push(created.id);
      expect((await c.tags.get(created.id)).name).toBe(`${run}-tag`);

      const updated = await c.tags.update(created.id, { color: "#fff" });
      expect(updated.color).toBe("#fff");
      expect((await c.tags.list()).map((t) => t.id)).toContain(created.id);

      await c.tags.remove(created.id);
      await expect(c.tags.get(created.id)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(
        c.tags.update(created.id, { color: "#000" }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("rejects duplicate names", async () => {
      const first = await c.tags.create({ name: `${run}-tagdup` });
      ids.tags.push(first.id);
      await expect(
        c.tags.create({ name: `${run}-tagdup` }),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("sums activity and monthly series over overlapping tags", async () => {
      const main = await c.accounts.create({ name: `${run}-tag-main` });
      const outside = await c.accounts.create({
        name: `${run}-tag-out`,
        isOut: true,
        type: "OUT",
      });
      ids.accounts.push(main.id, outside.id);
      const tx = async (
        amount: number,
        sourceId: number,
        targetId: number,
        transactedAt: Date,
        tags: string[],
      ) => {
        const t = await c.transactions.create({
          description: `${run}-tag`,
          amount,
          sourceId,
          targetId,
          transactedAt,
          tags,
        });
        ids.transactions.push(t.id);
        return t;
      };
      const trip = `${run}-trip`;
      const food = `${run}-food-tag`;
      const from = new Date("2002-02-01T00:00:00Z");
      const to = new Date("2002-03-01T00:00:00Z");
      const inRange = new Date("2002-02-10T12:00:00Z");
      await tx(100, main.id, outside.id, inRange, [trip, food]);
      await tx(40, main.id, outside.id, inRange, [food]);
      await tx(500, outside.id, main.id, inRange, [trip]);
      await tx(25, main.id, outside.id, new Date("2002-01-20T12:00:00Z"), [
        trip,
      ]);
      await tx(999, main.id, outside.id, new Date("2002-03-01T00:00:00Z"), [
        trip,
      ]);

      const tags = await c.tags.listWithActivity({ from, to });
      const byName = (name: string) => tags.find((t) => t.name === name)!;
      ids.tags.push(byName(trip).id, byName(food).id);
      // A transaction counts towards each of its tags.
      expect(byName(trip)).toMatchObject({
        spent: 100,
        received: 500,
        entries: 2,
      });
      expect(byName(food)).toMatchObject({
        spent: 140,
        received: 0,
        entries: 2,
      });

      const range = { from: new Date("2002-01-01T00:00:00Z"), to };
      expect(
        (await c.tags.spendingByMonth(byName(trip).id, range)).map(
          (m) => m.spent,
        ),
      ).toEqual([25, 100]);
      expect(
        (await c.tags.spendingByMonth(byName(trip).id, range, "received")).map(
          (m) => m.spent,
        ),
      ).toEqual([0, 500]);
    });

    it("detaches a deleted tag but keeps its transactions and children", async () => {
      const parent = await c.tags.create({ name: `${run}-parent` });
      const child = await c.tags.create({ name: `${run}-child` });
      ids.tags.push(parent.id, child.id);
      await db!.tag.update({
        where: { id: child.id },
        data: { parentId: parent.id },
      });
      const main = await c.accounts.create({ name: `${run}-tagdel-main` });
      const outside = await c.accounts.create({
        name: `${run}-tagdel-out`,
        isOut: true,
        type: "OUT",
      });
      ids.accounts.push(main.id, outside.id);
      const t = await c.transactions.create({
        description: `${run}-tagdel`,
        amount: 5,
        sourceId: main.id,
        targetId: outside.id,
        tags: [parent.name, child.name],
      });
      ids.transactions.push(t.id);

      await c.tags.remove(parent.id);

      expect((await c.tags.get(child.id)).parentId).toBeNull();
      expect((await c.transactions.get(t.id)).tags.map((x) => x.name)).toEqual([
        child.name,
      ]);
    });
  });

  describe("users", () => {
    it("hashes passwords and authenticates", async () => {
      const email = `${run}@example.com`;
      const user = await g.users.create({ email, password: "correct horse" });
      ids.users.push(user.id);
      expect(user).not.toHaveProperty("password");
      expect(await g.users.authenticate(email, "correct horse")).toEqual(user);
      expect(await g.users.authenticate(email, "wrong")).toBeNull();
      await expect(
        g.users.create({ email, password: "correct horse" }),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("creates regular users unless told otherwise", async () => {
      const regular = await g.users.create({
        email: `${run}-regular@example.com`,
        password: "correct horse",
      });
      const admin = await g.users.create(
        { email: `${run}-admin@example.com`, password: "correct horse" },
        { isSuperuser: true },
      );
      ids.users.push(regular.id, admin.id);
      expect(regular.isSuperuser).toBe(false);
      expect(admin.isSuperuser).toBe(true);
    });

    it("invites with a random password that works until it is replaced", async () => {
      const email = `${run}-invited@example.com`;
      const { user, password } = await g.users.invite(email);
      ids.users.push(user.id);
      expect(user.isSuperuser).toBe(false);
      expect(password.length).toBeGreaterThanOrEqual(20);
      expect(await g.users.authenticate(email, password)).toEqual(user);

      const again = await g.users.reissueInvite(user.id);
      expect(again.password).not.toBe(password);
      expect(await g.users.authenticate(email, password)).toBeNull();
      expect(await g.users.authenticate(email, again.password)).toEqual(user);
    });

    it("signs the user out everywhere when the password changes", async () => {
      const user = await g.users.create({
        email: `${run}-reset@example.com`,
        password: "correct horse",
      });
      ids.users.push(user.id);
      const { token } = await g.sessions.create(user.id);

      await g.users.setPassword(user.id, "battery staple");
      expect(await g.sessions.validate(token)).toBeNull();
      expect(
        await g.users.authenticate(user.email, "correct horse"),
      ).toBeNull();
      expect(await g.users.authenticate(user.email, "battery staple")).toEqual(
        user,
      );
      await expect(g.users.setPassword(user.id, "short")).rejects.toThrow();
      await expect(
        g.users.setPassword(2_000_000_000, "battery staple"),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("removes users together with their sessions", async () => {
      const user = await g.users.create({
        email: `${run}-gone@example.com`,
        password: "correct horse",
      });
      const { token } = await g.sessions.create(user.id);
      await g.users.remove(user.id);
      expect(await g.sessions.validate(token)).toBeNull();
      await expect(g.users.remove(user.id)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe("accounts and transactions", () => {
    it("computes balances from state plus transactions", async () => {
      const bank = await c.accounts.create({
        name: `${run}-bank`,
        isDisponible: true,
      });
      const out = await c.accounts.create({
        name: `${run}-out`,
        type: "OUT",
        isOut: true,
      });
      ids.accounts.push(bank.id, out.id);
      await c.accounts.recordState(bank.id, 1000);

      const cat = await c.categories.create({ name: `${run}-food` });
      ids.categories.push(cat.id);

      const spend = await c.transactions.create({
        description: `${run} lunch`,
        amount: 250,
        sourceId: bank.id,
        targetId: out.id,
        categoryId: cat.id,
        tags: ["lunch"],
      });
      const income = await c.transactions.create({
        description: `${run} gift`,
        amount: 100,
        sourceId: out.id,
        targetId: bank.id,
      });
      ids.transactions.push(spend.id, income.id);

      expect(spend.category?.name).toBe(`${run}-food`);
      expect(spend.tags.map((t) => t.name)).toEqual(["lunch"]);

      const accounts = await c.accounts.listWithBalances();
      expect(accounts.find((a) => a.id === bank.id)?.balance).toBe(850);
    });

    it("editing a transaction before a checkpoint moves the checkpoint", async () => {
      const bank = await c.accounts.create({ name: `${run}-re-bank` });
      const out = await c.accounts.create({
        name: `${run}-re-out`,
        type: "OUT",
        isOut: true,
      });
      ids.accounts.push(bank.id, out.id);
      const day = (n: number) => new Date(Date.UTC(2026, 5, n));

      const first = await c.transactions.create({
        description: `${run} first`,
        amount: 5000,
        sourceId: bank.id,
        targetId: out.id,
        transactedAt: day(12),
      });
      await c.checkpoints.create(bank.id, { amount: 10000, at: day(13) });
      const later = await c.transactions.create({
        description: `${run} later`,
        amount: 5000,
        sourceId: bank.id,
        targetId: out.id,
        transactedAt: day(14),
      });
      ids.transactions.push(first.id, later.id);
      expect((await c.checkpoints.suggest(bank.id, day(15))).balance).toBe(
        5000,
      );

      // partial refund: the first spend was really only 1000
      await c.transactions.update(first.id, { amount: 1000 });
      const [checkpoint] = await c.checkpoints.list(bank.id);
      expect(checkpoint.amount).toBe(14000);
      expect((await c.checkpoints.suggest(bank.id, day(15))).balance).toBe(
        9000,
      );

      // moving it behind the checkpoint takes it out of the checkpoint again
      await c.transactions.update(first.id, { transactedAt: day(14) });
      expect((await c.checkpoints.list(bank.id))[0].amount).toBe(15000);

      // re-pointing it to another account moves it for both accounts
      const other = await c.accounts.create({ name: `${run}-re-other` });
      ids.accounts.push(other.id);
      await c.checkpoints.create(other.id, { amount: 100, at: day(13) });
      await c.transactions.update(first.id, {
        transactedAt: day(12),
        sourceId: other.id,
      });
      expect((await c.checkpoints.list(other.id))[0].amount).toBe(-900);
      expect((await c.checkpoints.list(bank.id))[0].amount).toBe(15000);
    });

    it("keeps due transactions pending until confirmed", async () => {
      const bank = await c.accounts.create({
        name: `${run}-pend-bank`,
        isDisponible: true,
      });
      const out = await c.accounts.create({
        name: `${run}-pend-out`,
        type: "OUT",
        isOut: true,
      });
      ids.accounts.push(bank.id, out.id);
      const hour = 3_600_000;
      const scheduled = await c.transactions.create({
        description: `${run} rent`,
        amount: 100,
        sourceId: bank.id,
        targetId: out.id,
        recurring: 1,
        transactedAt: new Date(Date.now() + hour),
      });
      ids.transactions.push(scheduled.id);
      expect(scheduled.confirmed).toBe(false);
      await expect(c.transactions.confirm(scheduled.id)).rejects.toBeInstanceOf(
        ConflictError,
      );

      // Once it is due it stays pending: not in the balance, still upcoming.
      const due = await c.transactions.update(scheduled.id, {
        transactedAt: new Date(Date.now() - hour),
      });
      expect(due.confirmed).toBe(false);
      expect(await c.accounts.balanceAt(bank.id, new Date())).toBe(0);
      expect(
        await c.accounts.balanceAt(bank.id, new Date(Date.now() + 99 * hour)),
      ).toBe(-100);
      const farAway = new Date(Date.now() + 24 * hour * 400);
      const upcoming = await c.transactions.upcoming(farAway);
      expect(upcoming.map((t) => t.id)).toContain(scheduled.id);

      const confirmed = await c.transactions.confirm(scheduled.id);
      expect(confirmed.confirmed).toBe(true);
      expect(confirmed.transactedAt!.getTime()).toBeGreaterThan(
        due.transactedAt!.getTime(),
      );
      expect(await c.accounts.balanceAt(bank.id, new Date())).toBe(-100);
      await expect(c.transactions.confirm(scheduled.id)).rejects.toBeInstanceOf(
        ConflictError,
      );

      // The recurring one scheduled its successor a month after the due date.
      const next = (await c.transactions.upcoming(farAway)).find(
        (t) => t.description === scheduled.description,
      );
      expect(next).toBeDefined();
      ids.transactions.push(next!.id);
      expect(next!.confirmed).toBe(false);
      expect(next!.transactedAt!.getTime()).toBeGreaterThan(Date.now());
      await expect(
        c.transactions.confirm(2_000_000_000),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("checkpoints freeze the balance and book the difference as manko", async () => {
      const bank = await c.accounts.create({ name: `${run}-cp-bank` });
      const out = await c.accounts.create({
        name: `${run}-cp-out`,
        type: "OUT",
        isOut: true,
      });
      ids.accounts.push(bank.id, out.id);
      const income = await c.transactions.create({
        description: `${run} salary`,
        amount: 500,
        sourceId: out.id,
        targetId: bank.id,
        transactedAt: new Date(Date.now() - 60_000),
      });
      ids.transactions.push(income.id);

      const suggestion = await c.checkpoints.suggest(bank.id);
      expect(suggestion.balance).toBe(500);
      expect(suggestion.previous).toBeNull();

      const settings = await c.settings.get();
      expect(settings.mankoCategoryId).not.toBeNull();

      // 80 less than the books say -> money out of the account
      const { checkpoint, adjustment } = await c.checkpoints.create(bank.id, {
        amount: 420,
      });
      if (adjustment) ids.transactions.push(adjustment.id);
      expect(checkpoint.amount).toBe(420);
      expect(adjustment).toMatchObject({
        amount: 80,
        sourceId: bank.id,
        categoryId: settings.mankoCategoryId,
      });
      expect(await c.accounts.balanceAt(bank.id, new Date())).toBe(420);

      // later transactions build on the checkpoint
      const later = await c.transactions.create({
        description: `${run} later`,
        amount: 20,
        sourceId: bank.id,
        targetId: out.id,
        transactedAt: new Date(Date.now() + 1_000),
      });
      ids.transactions.push(later.id);
      expect(
        await c.accounts.balanceAt(bank.id, new Date(Date.now() + 2_000)),
      ).toBe(400);

      // a matching value needs no adjustment
      const exact = await c.checkpoints.create(bank.id, { amount: 420 });
      expect(exact.adjustment).toBeNull();

      const journal = await c.ledger.forAccount(bank.id, { limit: 10 });
      const kinds = journal.items.map((e) => e.kind);
      expect(kinds.filter((k) => k === "checkpoint")).toHaveLength(2);
      expect(journal.total).toBe(5);
      // narrowed views only list transactions
      const searched = await c.ledger.forAccount(bank.id, {
        search: `${run}`,
      });
      expect(searched.items.every((e) => e.kind === "transaction")).toBe(true);

      // "states only" lists just the checkpoints, paginated
      const states = await c.ledger.forAccount(
        bank.id,
        { limit: 1 },
        { checkpointsOnly: true },
      );
      expect(states.total).toBe(2);
      expect(states.items).toHaveLength(1);
      expect(states.items[0].kind).toBe("checkpoint");

      // a checkpoint can be deleted, but only through its own account
      await expect(
        c.checkpoints.remove(out.id, exact.checkpoint.id),
      ).rejects.toBeInstanceOf(NotFoundError);
      await c.checkpoints.remove(bank.id, exact.checkpoint.id);
      await expect(
        c.checkpoints.remove(bank.id, exact.checkpoint.id),
      ).rejects.toBeInstanceOf(NotFoundError);
      const remaining = await c.ledger.forAccount(
        bank.id,
        {},
        { checkpointsOnly: true },
      );
      expect(remaining.total).toBe(1);
    });

    it("manko category can be changed and falls back to N/A", async () => {
      const cat = await c.categories.create({ name: `${run}-manko` });
      ids.categories.push(cat.id);
      const original = (await c.settings.get()).mankoCategoryId;
      try {
        expect(
          (await c.settings.update({ mankoCategoryId: cat.id }))
            .mankoCategoryId,
        ).toBe(cat.id);
        await expect(
          c.settings.update({ mankoCategoryId: 2_000_000_000 }),
        ).rejects.toBeInstanceOf(NotFoundError);
      } finally {
        if (original) await c.settings.update({ mankoCategoryId: original });
      }
    });

    it("schedules the next occurrence of a completed recurring transaction", async () => {
      const [a, b] = await Promise.all([
        c.accounts.create({ name: `${run}-ra` }),
        c.accounts.create({ name: `${run}-rb` }),
      ]);
      ids.accounts.push(a.id, b.id);
      const past = new Date();
      past.setDate(1);
      past.setMonth(past.getMonth() - 1);
      const tx = await c.transactions.create({
        description: `${run} rent`,
        amount: 9,
        sourceId: a.id,
        targetId: b.id,
        transactedAt: past,
        recurring: 1,
      });
      const { items } = await c.transactions.list({
        accountId: a.id,
        sort: "date-asc",
      });
      ids.transactions.push(...items.map((t) => t.id));
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe(tx.id);
      expect(items[0].confirmed).toBe(true);
      expect(items[1].confirmed).toBe(false);
      expect(items[1].recurring).toBe(1);
      expect(items[1].transactedAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it("lists with filters, paginates and updates", async () => {
      const [a, b] = await Promise.all([
        c.accounts.create({ name: `${run}-a` }),
        c.accounts.create({ name: `${run}-b` }),
      ]);
      ids.accounts.push(a.id, b.id);
      const tx = await c.transactions.create({
        description: `${run} filterable`,
        amount: 5,
        sourceId: a.id,
        targetId: b.id,
      });
      ids.transactions.push(tx.id);

      const page = await c.transactions.list({ accountId: a.id, limit: 10 });
      expect(page.total).toBe(1);
      expect(page.items[0].id).toBe(tx.id);

      const edited = await c.transactions.update(tx.id, {
        amount: 7,
        isImportant: true,
        tags: ["x", "y"],
      });
      expect(edited.amount).toBe(7);
      expect(edited.tags.map((t) => t.name).sort()).toEqual(["x", "y"]);

      const retagged = await c.transactions.update(tx.id, { tags: ["z"] });
      expect(retagged.tags.map((t) => t.name)).toEqual(["z"]);

      const important = await c.transactions.list({
        important: true,
        accountId: a.id,
      });
      expect(important.items.map((t) => t.id)).toEqual([tx.id]);
    });

    it("filters by flow, status, amount, tag and sorts", async () => {
      const [own, own2, out] = await Promise.all([
        c.accounts.create({ name: `${run}-own` }),
        c.accounts.create({ name: `${run}-own2` }),
        c.accounts.create({ name: `${run}-out`, isOut: true }),
      ]);
      ids.accounts.push(own.id, own2.id, out.id);
      const make = async (
        description: string,
        amount: number,
        sourceId: number,
        targetId: number,
        extra: { tags?: string[]; transactedAt?: Date } = {},
      ) => {
        const t = await c.transactions.create({
          description: `${run} ${description}`,
          amount,
          sourceId,
          targetId,
          ...extra,
        });
        ids.transactions.push(t.id);
        return t;
      };
      const spent = await make("lunch", 10, own.id, out.id, {
        tags: [`${run}-trip`],
      });
      const received = await make("wage", 30, out.id, own.id);
      const moved = await make("shift", 20, own.id, own2.id);
      const future = await make("later", 5, own.id, out.id, {
        transactedAt: new Date(Date.now() + 86_400_000 * 30),
      });
      const mine = { accountId: own.id };
      const idsOf = async (f: Parameters<typeof c.transactions.list>[0]) =>
        (await c.transactions.list({ ...mine, ...f })).items.map((t) => t.id);

      expect(await idsOf({ flow: "spent", sort: "amount-asc" })).toEqual([
        future.id,
        spent.id,
      ]);
      expect(await idsOf({ flow: "received" })).toEqual([received.id]);
      expect(await idsOf({ flow: "transfer" })).toEqual([moved.id]);
      expect(await idsOf({ status: "pending" })).toEqual([future.id]);
      expect(await idsOf({ status: "completed", sort: "amount-desc" })).toEqual(
        [received.id, moved.id, spent.id],
      );
      expect(
        await idsOf({ minAmount: 10, maxAmount: 20, sort: "date-asc" }),
      ).toEqual([spent.id, moved.id]);
      expect(await idsOf({ tag: `${run}-trip` })).toEqual([spent.id]);
      expect(await idsOf({ sourceId: out.id })).toEqual([received.id]);
      expect(await idsOf({ targetId: own2.id })).toEqual([moved.id]);
      expect(await idsOf({ uncategorized: true, limit: 2 })).toHaveLength(2);
      expect(await idsOf({ hidden: true })).toEqual([]);
      expect(await idsOf({ recurring: true })).toEqual([]);
      expect(await c.transactions.tags()).toContain(`${run}-trip`);
    });

    it("combines search with filters and paginates the matches", async () => {
      const [a, b] = await Promise.all([
        c.accounts.create({ name: `${run}-sa` }),
        c.accounts.create({ name: `${run}-sb` }),
      ]);
      ids.accounts.push(a.id, b.id);
      for (const amount of [1, 2, 3]) {
        const t = await c.transactions.create({
          description: `${run}zebra purchase`,
          amount,
          sourceId: a.id,
          targetId: b.id,
        });
        ids.transactions.push(t.id);
      }
      const search = `${run}zebra`;
      const all = await c.transactions.list({ search, limit: 2 });
      expect(all.total).toBe(3);
      expect(all.items).toHaveLength(2);
      const rest = await c.transactions.list({ search, limit: 2, offset: 2 });
      expect(rest.items).toHaveLength(1);

      const big = await c.transactions.list({
        search,
        minAmount: 2,
        sort: "amount-desc",
      });
      expect(big.items.map((t) => t.amount)).toEqual([3, 2]);
      expect(big.total).toBe(2);
      expect((await c.transactions.list({ search: "zzzznomatch" })).total).toBe(
        0,
      );
    });

    it("throws NotFoundError for unknown ids", async () => {
      await expect(c.transactions.get(2_000_000_000)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(c.transactions.remove(2_000_000_000)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it("validates input", async () => {
      await expect(c.categories.create({ name: "  " })).rejects.toThrow();
    });
  });

  describe("vehicles", () => {
    /** A vehicle whose fuel and service costs are filed in their own categories. */
    async function setup(suffix: string) {
      const bank = await c.accounts.create({
        name: `${run}-${suffix}-bank`,
        isDisponible: true,
      });
      const out = await c.accounts.create({
        name: `${run}-${suffix}-out`,
        type: "OUT",
        isOut: true,
      });
      const fuelCategory = await c.categories.create({
        name: `${run}-${suffix}-fuel`,
      });
      const category = await c.categories.create({
        name: `${run}-${suffix}-service`,
      });
      ids.accounts.push(bank.id, out.id);
      ids.categories.push(fuelCategory.id, category.id);
      const vehicle = await c.vehicles.create({
        name: `${run} ${suffix}`,
        brand: "Skoda",
        model: "Octavia",
        vin: `${run}-${suffix}-vin`,
        registration: `${run}-${suffix}`,
        fuelCategoryId: fuelCategory.id,
        categoryId: category.id,
      });
      ids.vehicles.push(vehicle.id);
      return { vehicle, fuelCategory, category };
    }

    it("creates, updates and rejects duplicate VIN or registration", async () => {
      const { vehicle } = await setup("crud");
      expect(vehicle.defaultFuelTransactionTitle).toBe("Fuel");

      const renamed = await c.vehicles.update(vehicle.id, {
        name: "Renamed",
        mass: 1350,
        purchasedAt: null,
      });
      expect(renamed).toMatchObject({ name: "Renamed", mass: 1350 });
      expect(renamed.vin).toBe(vehicle.vin);

      await expect(
        c.vehicles.create({
          name: "Copy",
          brand: "Skoda",
          model: "Octavia",
          vin: vehicle.vin,
          registration: `${run}-other`,
        }),
      ).rejects.toBeInstanceOf(ConflictError);
      await expect(c.vehicles.get(2_000_000_000)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(
        c.vehicles.update(vehicle.id, { vin: "" }),
      ).rejects.toThrow();
    });

    it("records fill-ups with their transaction and links full tanks", async () => {
      const { vehicle, fuelCategory } = await setup("fuel");
      const day = (d: number) => new Date(Date.UTC(2026, 0, d, 12));

      const first = await c.vehicles.fuel.create(vehicle.id, {
        fueledAt: day(1),
        odometer: 1000,
        fuelAmount: 40,
        unitPrice: 38.5,
      });
      expect(first.transaction.amount).toBe(1540);
      expect(first.transaction.description).toBe("Fuel");
      expect(first.previousFullTankFuelEntryId).toBeNull();

      const tx = await c.transactions.get(first.transactionId);
      expect(tx.category?.id).toBe(fuelCategory.id);
      expect(tx.confirmed).toBe(true);

      const partial = await c.vehicles.fuel.create(vehicle.id, {
        fueledAt: day(5),
        odometer: 1300,
        fuelAmount: 10,
        unitPrice: 40,
        isFullTank: false,
      });
      const third = await c.vehicles.fuel.create(vehicle.id, {
        fueledAt: day(10),
        odometer: 1600,
        fuelAmount: 35,
        unitPrice: 41,
      });
      // The partial fill-up is no full tank, so the third follows the first.
      expect(partial.previousFullTankFuelEntryId).toBe(first.id);
      expect(third.previousFullTankFuelEntryId).toBe(first.id);

      // A fill-up cannot be measured against a newer or a partial one.
      await expect(
        c.vehicles.fuel.update(vehicle.id, first.id, {
          previousFullTankFuelEntryId: third.id,
        }),
      ).rejects.toBeInstanceOf(ConflictError);
      await expect(
        c.vehicles.fuel.update(vehicle.id, third.id, {
          previousFullTankFuelEntryId: partial.id,
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      // Editing the cost updates the transaction too.
      const edited = await c.vehicles.fuel.update(vehicle.id, third.id, {
        fuelAmount: 30,
        unitPrice: 40,
      });
      expect(edited.transaction.amount).toBe(1200);
      expect(edited.previousFullTankFuelEntryId).toBe(first.id);

      // The transaction belongs to the entry.
      await expect(
        c.transactions.remove(first.transactionId),
      ).rejects.toBeInstanceOf(ConflictError);

      // Deleting a fill-up re-points the ones measured against it.
      const second = await c.vehicles.fuel.create(vehicle.id, {
        fueledAt: day(12),
        odometer: 1900,
        fuelAmount: 30,
        unitPrice: 40,
      });
      expect(second.previousFullTankFuelEntryId).toBe(third.id);
      await c.vehicles.fuel.remove(vehicle.id, third.id);
      const left = await c.vehicles.fuel.list(vehicle.id);
      expect(left.map((e) => e.id)).toEqual([second.id, partial.id, first.id]);
      expect(left[0].previousFullTankFuelEntryId).toBe(first.id);
      await expect(
        c.transactions.get(third.transactionId),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("records services with components and keeps the transaction in step", async () => {
      const { vehicle, category } = await setup("service");
      const component = await c.vehicles.components.create({
        name: `${run}-brakes`,
        color: "#ef4444",
      });
      await expect(
        c.vehicles.components.create({ name: `${run}-brakes` }),
      ).rejects.toBeInstanceOf(ConflictError);

      const service = await c.vehicles.service.create(vehicle.id, {
        type: "REGULAR_MAINTENANCE",
        title: "Brake pads",
        servicedAt: new Date(Date.UTC(2026, 0, 3, 9)),
        odometer: 5000,
        price: 3200,
        componentIds: [component.id],
      });
      expect(service.transaction).toMatchObject({
        amount: 3200,
        description: "Service: Brake pads",
      });
      expect(service.components.map((x) => x.id)).toEqual([component.id]);
      const tx = await c.transactions.get(service.transactionId);
      expect(tx.category?.id).toBe(category.id);

      const edited = await c.vehicles.service.update(vehicle.id, service.id, {
        title: "Brake discs",
        price: 4100,
        componentIds: [],
      });
      expect(edited.components).toEqual([]);
      expect(edited.transaction).toMatchObject({
        amount: 4100,
        description: "Service: Brake discs",
      });

      await c.vehicles.service.remove(vehicle.id, service.id);
      expect(await c.vehicles.service.list(vehicle.id)).toEqual([]);
      await expect(
        c.transactions.get(service.transactionId),
      ).rejects.toBeInstanceOf(NotFoundError);

      await c.vehicles.components.remove(component.id);
      expect(
        (await c.vehicles.components.list()).some((x) => x.id === component.id),
      ).toBe(false);
    });

    it("deleting a vehicle hides it but keeps it and its entries in the database", async () => {
      const { vehicle } = await setup("remove");
      const fill = await c.vehicles.fuel.create(vehicle.id, {
        fueledAt: new Date(Date.UTC(2026, 0, 1)),
        odometer: 100,
        fuelAmount: 10,
        unitPrice: 40,
      });
      const next = await c.vehicles.fuel.create(vehicle.id, {
        fueledAt: new Date(Date.UTC(2026, 0, 2)),
        odometer: 500,
        fuelAmount: 20,
        unitPrice: 40,
      });
      expect(next.previousFullTankFuelEntryId).toBe(fill.id);
      const service = await c.vehicles.service.create(vehicle.id, {
        type: "FEES",
        title: "Highway sticker",
        servicedAt: new Date(Date.UTC(2026, 0, 3)),
        price: 1500,
      });

      await c.vehicles.remove(vehicle.id);

      await expect(c.vehicles.get(vehicle.id)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      expect((await c.vehicles.list()).some((v) => v.id === vehicle.id)).toBe(
        false,
      );
      await expect(
        c.vehicles.update(vehicle.id, { name: "Ghost" }),
      ).rejects.toBeInstanceOf(NotFoundError);
      // Nothing is lost: the row and its entries' transactions remain.
      for (const id of [
        fill.transactionId,
        next.transactionId,
        service.transactionId,
      ]) {
        await expect(c.transactions.get(id)).resolves.toBeTruthy();
      }
      await expect(c.vehicles.remove(vehicle.id)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });
});
