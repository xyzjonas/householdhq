/**
 * Integration tests for the core layer. Needs a migrated MySQL database
 * reachable through DATABASE_URL (see `just test-unit`).
 */
import "dotenv/config";
import { afterAll, describe, expect, it, vi } from "vitest";
import { ensureDefaultAccounts } from "./bootstrap";
import type { Db } from "./prisma";
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

describe.skipIf(!core)("core layer", () => {
  const c = core!;
  const ids = {
    accounts: [] as number[],
    categories: [] as number[],
    transactions: [] as number[],
    users: [] as number[],
  };

  afterAll(async () => {
    for (const id of ids.transactions)
      await c.transactions.remove(id).catch(() => {});
    for (const id of ids.accounts) await c.accounts.remove(id).catch(() => {});
    for (const id of ids.categories)
      await c.categories.remove(id).catch(() => {});
    for (const id of ids.users) await c.users.remove(id).catch(() => {});
    await c.disconnect();
  });

  describe("sessions", () => {
    it("creates, validates and invalidates sessions", async () => {
      const user = await c.users.create({
        email: `${run}-s@example.com`,
        password: "correct horse",
      });
      ids.users.push(user.id);

      const { token } = await c.sessions.create(user.id);
      expect(token.length).toBeGreaterThan(30);
      const valid = await c.sessions.validate(token);
      expect(valid?.user).toEqual(user);
      expect(valid?.renewed).toBe(false);

      await c.sessions.invalidate(token);
      expect(await c.sessions.validate(token)).toBeNull();
      expect(await c.sessions.validate("not-a-token")).toBeNull();
    });

    it("rejects expired sessions and renews old ones", async () => {
      const user = await c.users.create({
        email: `${run}-e@example.com`,
        password: "correct horse",
      });
      ids.users.push(user.id);

      const expired = await c.sessions.create(user.id);
      await db!.session.updateMany({
        where: { userId: user.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      expect(await c.sessions.validate(expired.token)).toBeNull();

      const old = await c.sessions.create(user.id);
      await db!.session.updateMany({
        where: { userId: user.id },
        data: { expiresAt: new Date(Date.now() + 60_000) },
      });
      const renewed = await c.sessions.validate(old.token);
      expect(renewed?.renewed).toBe(true);
      expect(renewed!.expiresAt.getTime()).toBeGreaterThan(
        Date.now() + 86_400_000,
      );

      await c.sessions.invalidateAllForUser(user.id);
      expect(await c.sessions.validate(old.token)).toBeNull();
    });

    it("stores only a hash of the token", async () => {
      const user = await c.users.create({
        email: `${run}-h@example.com`,
        password: "correct horse",
      });
      ids.users.push(user.id);
      const { token } = await c.sessions.create(user.id);
      expect(await db!.session.findUnique({ where: { id: token } })).toBeNull();
      await c.sessions.invalidateAllForUser(user.id);
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
    });

    it("rejects duplicate names", async () => {
      const first = await c.categories.create({ name: `${run}-dup` });
      ids.categories.push(first.id);
      await expect(
        c.categories.create({ name: `${run}-dup` }),
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe("users", () => {
    it("hashes passwords and authenticates", async () => {
      const email = `${run}@example.com`;
      const user = await c.users.create({ email, password: "correct horse" });
      ids.users.push(user.id);
      expect(user).not.toHaveProperty("password");
      expect(await c.users.authenticate(email, "correct horse")).toEqual(user);
      expect(await c.users.authenticate(email, "wrong")).toBeNull();
      await expect(
        c.users.create({ email, password: "correct horse" }),
      ).rejects.toBeInstanceOf(ConflictError);
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
});
