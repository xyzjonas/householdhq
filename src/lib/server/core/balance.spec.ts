/**
 * Integration tests for balances: series of transactions across many accounts
 * and categories are summed up and checked against hand-computed numbers and
 * against the one invariant the books must always satisfy:
 *
 *   an account's balance == the plain sum of its live (confirmed, not
 *   cancelled) transactions, however many checkpoints sit in between and
 *   however the transactions were created, edited or deleted.
 *
 * Needs a migrated MySQL database reachable through DATABASE_URL.
 */
import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { roundMoney } from "./balance";
import { createCore, createPrismaClient } from "./index";

const url = process.env.DATABASE_URL;
const db = url ? createPrismaClient(url) : undefined;
const core = db ? createCore(db) : undefined;
const run = `bal${Date.now()}`;

// Everything below runs inside one household of its own.
const household = core
  ? await core.households.create({ name: `${run}-household` })
  : undefined;

/** Noon UTC of a day in 2026 (all in the past, so everything is "happened"). */
const day = (month: number, d: number) =>
  new Date(Date.UTC(2026, month - 1, d, 12));
const DAY_MS = 24 * 60 * 60 * 1000;

describe.skipIf(!core)("balances", () => {
  const c = core!.forHousehold(household!.id);
  const hid = household!.id;
  let n = 0;

  afterAll(async () => {
    const where = { householdId: hid };
    await db!.vehicleFuelEntry.deleteMany({ where }).catch(() => {});
    await db!.vehicleServiceEntry.deleteMany({ where }).catch(() => {});
    await db!.transaction.deleteMany({ where });
    await db!.sourceState.deleteMany({ where });
    await db!.vehicle.deleteMany({ where });
    await db!.source.deleteMany({ where });
    await db!.category.deleteMany({ where });
    await db!.tag.deleteMany({ where });
    await db!.appSettings.deleteMany({ where });
    await db!.household.delete({ where: { id: hid } });
    await core!.disconnect();
  });

  /**
   * A fresh set of accounts and categories per scenario, so scenarios cannot
   * influence each other's numbers. The bank account comes first so vehicle
   * entries are paid from it; money the books can't explain (checkpoint
   * adjustments) goes to `world`.
   */
  async function setup() {
    const tag = `${run}-${++n}`;
    const account = (
      name: string,
      extra: Partial<Parameters<typeof c.accounts.create>[0]> = {},
    ) => c.accounts.create({ name: `${tag}-${name}`, ...extra });
    const bank = await account("bank", {
      type: "ACCOUNT",
      isDisponible: true,
      position: -n, // ahead of earlier scenarios' banks
    });
    const cash = await account("cash", {
      type: "CASH",
      isDisponible: true,
      position: 2,
    });
    const savings = await account("savings", { type: "SAVINGS" });
    const invest = await account("invest", { type: "INVESTMENT" });
    const pension = await account("pension", { type: "RETIREMENT" });
    const world = await account("world", { type: "OUT", isOut: true });
    const shop = await account("shop", { type: "OUT", isOut: true });
    const employer = await account("employer", { type: "OUT", isOut: true });
    const category = (name: string) =>
      c.categories.create({ name: `${tag}-${name}` });
    const cat = {
      salary: await category("salary"),
      food: await category("food"),
      rent: await category("rent"),
      fun: await category("fun"),
    };
    await c.settings.update({ defaultOutAccountId: world.id });

    const accounts = [
      bank,
      cash,
      savings,
      invest,
      pension,
      world,
      shop,
      employer,
    ];
    const ids = accounts.map((a) => a.id);

    const post = (
      from: { id: number },
      to: { id: number },
      amount: number,
      at: Date,
      category?: { id: number },
      extra: { confirmed?: boolean } = {},
    ) =>
      c.transactions
        .create({
          description: `${tag} ${amount}`,
          amount,
          sourceId: from.id,
          targetId: to.id,
          transactedAt: at,
          categoryId: category?.id,
        })
        .then(async (t) =>
          extra.confirmed === false
            ? db!.transaction.update({
                where: { id: t.id },
                data: { confirmed: false },
                include: {
                  category: true,
                  source: true,
                  target: true,
                  tags: true,
                },
              })
            : t,
        );

    /** The plain sum of the account's live transactions up to `asOf`. */
    const naive = async (accountId: number, asOf = new Date()) => {
      const live = await db!.transaction.findMany({
        where: {
          householdId: hid,
          cancelled: false,
          confirmed: true,
          transactedAt: { lte: asOf },
          OR: [{ sourceId: accountId }, { targetId: accountId }],
        },
      });
      return roundMoney(
        live.reduce(
          (sum, t) =>
            sum +
            (t.targetId === accountId ? t.amount : 0) -
            (t.sourceId === accountId ? t.amount : 0),
          0,
        ),
      );
    };
    const balance = async (a: { id: number }, asOf?: Date) =>
      roundMoney(await c.accounts.balanceAt(a.id, asOf ?? new Date()));

    /** The invariant: every balance is the plain sum, and money is conserved. */
    async function expectBooksAdd(label = "") {
      let total = 0;
      for (const a of accounts) {
        const shown = await balance(a);
        expect(shown, `${label} ${a.name}`).toBe(await naive(a.id));
        total += shown;
      }
      expect(Math.abs(roundMoney(total)), `${label} money is conserved`).toBe(
        0,
      );
      const listed = (await c.accounts.listWithBalances()).filter((a) =>
        ids.includes(a.id),
      );
      for (const a of listed) {
        expect(roundMoney(a.balance), `${label} list ${a.name}`).toBe(
          await naive(a.id),
        );
      }
    }

    return {
      bank,
      cash,
      savings,
      invest,
      pension,
      world,
      shop,
      employer,
      cat,
      accounts,
      ids,
      post,
      naive,
      balance,
      expectBooksAdd,
    };
  }

  it("sums a month of mixed income, spending and transfers per account", async () => {
    const w = await setup();
    const { bank, cash, savings, invest, pension, shop, employer, cat, post } =
      w;

    await post(employer, bank, 52000, day(3, 1), cat.salary);
    await post(bank, shop, 15000, day(3, 2), cat.rent);
    await post(bank, shop, 1234.56, day(3, 3), cat.food);
    await post(bank, shop, 876.44, day(3, 5), cat.food);
    await post(bank, cash, 2000, day(3, 6)); // withdrawal
    await post(cash, shop, 350.5, day(3, 7), cat.food);
    await post(cash, shop, 99.5, day(3, 8), cat.fun);
    await post(bank, savings, 10000, day(3, 10)); // saving
    await post(savings, invest, 3000, day(3, 11)); // investing
    await post(employer, savings, 12.34, day(3, 31)); // interest
    await post(employer, pension, 1500, day(3, 31), cat.salary); // employer pension
    await post(bank, shop, 0.1, day(3, 12), cat.fun);
    await post(bank, shop, 0.2, day(3, 12), cat.fun); // float-noise bait

    expect(await w.balance(bank)).toBe(
      roundMoney(52000 - 15000 - 1234.56 - 876.44 - 2000 - 10000 - 0.1 - 0.2),
    ); // 22888.7
    expect(await w.balance(cash)).toBe(1550); // 2000 - 350.5 - 99.5
    expect(await w.balance(savings)).toBe(7012.34); // 10000 - 3000 + 12.34
    expect(await w.balance(invest)).toBe(3000);
    expect(await w.balance(pension)).toBe(1500);
    expect(await w.balance(shop)).toBe(
      roundMoney(15000 + 1234.56 + 876.44 + 350.5 + 99.5 + 0.1 + 0.2),
    );
    expect(await w.balance(employer)).toBe(-(52000 + 12.34 + 1500));

    // Totals: liquid = available-to-spend accounts, total leaves out the
    // locked-in pension, external accounts count for neither.
    const known = (await c.accounts.listWithBalances()).filter((a) =>
      w.ids.includes(a.id),
    );
    const totals = await c.accounts.balances(known);
    expect(roundMoney(totals.liquid)).toBe(22888.7 + 1550);
    expect(roundMoney(totals.total)).toBe(22888.7 + 1550 + 7012.34 + 3000);
    expect(roundMoney(totals.byType.RETIREMENT ?? 0)).toBe(1500);
    expect(roundMoney(totals.byType.SAVINGS ?? 0)).toBe(7012.34);

    await w.expectBooksAdd();
  });

  it("agrees with the money spent and received per category", async () => {
    const w = await setup();
    const { bank, cash, shop, employer, cat, post } = w;
    await post(employer, bank, 40000, day(4, 1), cat.salary);
    await post(employer, bank, 5000, day(4, 20), cat.salary); // bonus
    await post(bank, shop, 12000, day(4, 2), cat.rent);
    await post(bank, shop, 640.9, day(4, 4), cat.food);
    await post(bank, cash, 1000, day(4, 5), cat.food); // transfer: not spending
    await post(cash, shop, 300.1, day(4, 6), cat.food);
    await post(bank, shop, 450, day(4, 9), cat.fun);
    await post(shop, bank, 50, day(4, 10), cat.fun); // refund
    await post(bank, shop, 77, day(5, 1), cat.food); // next month: out of range

    const activity = await c.categories.listWithActivity({
      from: day(4, 1),
      to: day(5, 1),
    });
    const of = (id: number) => activity.find((a) => a.id === id)!;
    expect(roundMoney(of(cat.salary.id).received)).toBe(45000);
    expect(of(cat.rent.id).spent).toBe(12000);
    expect(roundMoney(of(cat.food.id).spent)).toBe(roundMoney(640.9 + 300.1));
    expect(of(cat.fun.id).spent).toBe(450);
    expect(of(cat.fun.id).received).toBe(50);

    // Bank = everything received - everything spent - what moved to cash.
    const received = of(cat.salary.id).received + of(cat.fun.id).received;
    const spent = of(cat.rent.id).spent + 640.9 + of(cat.fun.id).spent + 77; // + 300.1 was cash
    expect(await w.balance(bank)).toBe(roundMoney(received - spent - 1000));
    expect(await w.balance(cash)).toBe(699.9);
    await w.expectBooksAdd();
  });

  it("only counts what has happened: pending, future and cancelled differ", async () => {
    const w = await setup();
    const { bank, shop, employer, post } = w;
    const now = Date.now();
    await post(employer, bank, 1000, day(5, 1));
    // overdue but unconfirmed: has not happened
    const overdue = await post(bank, shop, 300, day(5, 2), undefined, {
      confirmed: false,
    });
    const future = await post(bank, shop, 200, new Date(now + 5 * DAY_MS));
    expect(future.confirmed).toBe(false);
    const cancelled = await post(bank, shop, 100, day(5, 3));
    await db!.transaction.update({
      where: { id: cancelled.id },
      data: { cancelled: true },
    });

    expect(await w.balance(bank)).toBe(1000);
    // projecting into the future includes what is scheduled
    expect(await w.balance(bank, new Date(now + 10 * DAY_MS))).toBe(500);
    await w.expectBooksAdd();

    // confirming the overdue one makes it count, stamped now
    await c.transactions.confirm(overdue.id);
    expect(await w.balance(bank)).toBe(700);
    await w.expectBooksAdd("after confirm");
  });

  it("builds on checkpoints and keeps history readable", async () => {
    const w = await setup();
    const { bank, shop, employer, world, post } = w;
    await post(employer, bank, 1000, day(6, 1));
    await post(bank, shop, 250, day(6, 2));

    // The real balance is 700, the books say 750: 50 gets written off.
    const { checkpoint, adjustment } = await c.checkpoints.create(bank.id, {
      amount: 700,
      at: day(6, 3),
    });
    expect(checkpoint.amount).toBe(700);
    expect(adjustment).toMatchObject({
      amount: 50,
      sourceId: bank.id,
      targetId: world.id,
    });
    expect(await w.balance(bank)).toBe(700);

    // transactions after the checkpoint build on it
    await post(bank, shop, 100, day(6, 4));
    await post(employer, bank, 30.5, day(6, 5));
    expect(await w.balance(bank)).toBe(630.5);
    // and so does history: before, at and after the checkpoint
    expect(await w.balance(bank, day(6, 2))).toBe(750);
    expect(await w.balance(bank, day(6, 3))).toBe(700);
    expect(await w.balance(bank, day(6, 4))).toBe(600);

    // a second checkpoint with money found (not lost)
    await c.checkpoints.create(bank.id, { amount: 700, at: day(6, 10) });
    await post(bank, shop, 5, day(6, 11));
    expect(await w.balance(bank)).toBe(695);
    expect(await w.balance(world)).toBe(50 - 69.5);
    await w.expectBooksAdd();
  });

  describe("edits keep balances equal to the plain sum", () => {
    it("amount, accounts and date changes behind a checkpoint", async () => {
      const w = await setup();
      const { bank, cash, shop, employer, post } = w;
      const salary = await post(employer, bank, 1000, day(8, 1));
      const rent = await post(bank, shop, 400, day(8, 2));
      await c.checkpoints.create(bank.id, { amount: 600, at: day(8, 10) });
      await c.checkpoints.create(cash.id, { amount: 0, at: day(8, 10) });
      const later = await post(bank, shop, 100, day(8, 12));
      expect(await w.balance(bank)).toBe(500);

      await c.transactions.update(rent.id, { amount: 450 });
      expect(await w.balance(bank)).toBe(450);
      await w.expectBooksAdd("amount");

      await c.transactions.update(salary.id, { targetId: cash.id });
      expect(await w.balance(bank)).toBe(-550);
      expect(await w.balance(cash)).toBe(1000);
      await w.expectBooksAdd("retarget");

      await c.transactions.update(later.id, { transactedAt: day(8, 5) });
      expect(await w.balance(bank)).toBe(-550);
      await w.expectBooksAdd("move behind checkpoint");

      await c.transactions.update(rent.id, { transactedAt: day(8, 20) });
      await w.expectBooksAdd("move past checkpoint");
    });

    it("deleting a transaction behind a checkpoint", async () => {
      const w = await setup();
      const { bank, shop, employer, post } = w;
      await post(employer, bank, 1000, day(9, 1));
      const mistake = await post(bank, shop, 400, day(9, 2));
      await c.checkpoints.create(bank.id, { amount: 600, at: day(9, 10) });
      await post(bank, shop, 100, day(9, 12));
      expect(await w.balance(bank)).toBe(500);

      // The 400 never happened: 400 more is left on the account.
      await c.transactions.remove(mistake.id);
      expect(await w.balance(bank)).toBe(900);
      expect(await w.balance(shop)).toBe(100);
      await w.expectBooksAdd("delete");
    });

    it("deleting a transaction after the last checkpoint and with no checkpoint", async () => {
      const w = await setup();
      const { bank, shop, employer, post } = w;
      const a = await post(employer, bank, 1000, day(9, 1));
      await post(bank, shop, 100, day(9, 2));
      await c.transactions.remove(a.id);
      expect(await w.balance(bank)).toBe(-100);
      await c.checkpoints.create(bank.id, { amount: -100, at: day(9, 3) });
      const b = await post(bank, shop, 50, day(9, 4));
      await c.transactions.remove(b.id);
      expect(await w.balance(bank)).toBe(-100);
      await w.expectBooksAdd();
    });

    it("deleting a checkpoint's own adjustment", async () => {
      const w = await setup();
      const { bank, employer, post } = w;
      await post(employer, bank, 1000, day(9, 1));
      const { adjustment } = await c.checkpoints.create(bank.id, {
        amount: 1200,
        at: day(9, 2),
      });
      expect(await w.balance(bank)).toBe(1200);
      await c.transactions.remove(adjustment!.id);
      await w.expectBooksAdd("adjustment removed");
    });
  });

  describe("vehicle entries move balances like any transaction", () => {
    async function vehicleWorld() {
      const w = await setup();
      const vehicle = await c.vehicles.create({
        name: `${run}-v${n}`,
        brand: "Skoda",
        model: "Octavia",
        vin: `${run}-v${n}-vin`,
        registration: `${run}-v${n}`,
        fuelCategoryId: w.cat.fun.id,
        categoryId: w.cat.rent.id,
      });
      await w.post(w.employer, w.bank, 5000, day(10, 1));
      return { ...w, vehicle };
    }

    it("creating, editing and deleting fill-ups and services", async () => {
      const w = await vehicleWorld();
      const { bank, vehicle } = w;
      const fill = await c.vehicles.fuel.create(vehicle.id, {
        fueledAt: day(10, 2),
        odometer: 100,
        fuelAmount: 40,
        unitPrice: 38.5, // 1540
      });
      const service = await c.vehicles.service.create(vehicle.id, {
        type: "FEES",
        title: "Sticker",
        servicedAt: day(10, 3),
        price: 1500,
      });
      expect(await w.balance(bank)).toBe(5000 - 1540 - 1500);
      await w.expectBooksAdd("created");

      await c.checkpoints.create(bank.id, { amount: 1960, at: day(10, 5) });
      await c.vehicles.fuel.update(vehicle.id, fill.id, { unitPrice: 40 }); // 1600
      expect(await w.balance(bank)).toBe(1900);
      await w.expectBooksAdd("fuel edited");

      await c.vehicles.service.update(vehicle.id, service.id, { price: 1000 });
      expect(await w.balance(bank)).toBe(2400);
      await w.expectBooksAdd("service edited");

      await c.vehicles.fuel.remove(vehicle.id, fill.id);
      expect(await w.balance(bank)).toBe(4000);
      await w.expectBooksAdd("fuel removed");

      await c.vehicles.service.remove(vehicle.id, service.id);
      expect(await w.balance(bank)).toBe(5000);
      await w.expectBooksAdd("service removed");
    });
  });

  it("stays equal to the plain sum through a long randomised series", async () => {
    const w = await setup();
    // Small deterministic PRNG so a failure is reproducible.
    let seed = 20260101;
    const rnd = () =>
      (seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32;
    const pick = <T>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];
    const cats = [undefined, w.cat.salary, w.cat.food, w.cat.rent, w.cat.fun];
    const own = w.accounts.filter((a) => !w.ids.slice(5).includes(a.id));
    const at = (offsetDays: number) =>
      new Date(day(1, 1).getTime() + offsetDays * DAY_MS);
    // Latest checkpoint (in days since Jan 1) per account: new entries and
    // checkpoints go after it, edits and deletions may reach back past it.
    const floor = new Map<number, number>();
    const after = (...ids: number[]) =>
      Math.max(0, ...ids.map((id) => floor.get(id) ?? 0)) + rnd() * 2;
    const live: number[] = [];

    for (let step = 0; step < 120; step++) {
      const roll = rnd();
      const from = pick(w.accounts);
      const to = pick(w.accounts.filter((a) => a.id !== from.id));
      const amount = Math.round(rnd() * 100000) / 100;
      let what: string;
      if (roll < 0.5 || live.length < 5) {
        const when = at(after(from.id, to.id));
        const t = await w.post(from, to, amount, when, pick(cats));
        live.push(t.id);
        what = `create ${amount} ${from.name}->${to.name}`;
      } else if (roll < 0.65) {
        const id = pick(live);
        await c.transactions.update(id, { amount });
        what = `amount ${id} -> ${amount}`;
      } else if (roll < 0.75) {
        const id = pick(live);
        const when = at(rnd() * 150);
        await c.transactions.update(id, { transactedAt: when });
        what = `date ${id} -> ${when.toISOString()}`;
      } else if (roll < 0.82) {
        const id = pick(live);
        await c.transactions.update(id, { sourceId: from.id, targetId: to.id });
        what = `route ${id} -> ${from.name}->${to.name}`;
      } else if (roll < 0.9) {
        const id = live.splice(Math.floor(rnd() * live.length), 1)[0];
        await c.transactions.remove(id);
        what = `delete ${id}`;
      } else {
        const account = pick(own);
        const offset = after(account.id);
        const found = Math.round(rnd() * 200000) / 100;
        const { adjustment } = await c.checkpoints.create(account.id, {
          amount: found,
          at: at(offset),
        });
        floor.set(account.id, offset);
        if (adjustment) live.push(adjustment.id);
        what = `checkpoint ${account.name} = ${found} at +${offset}d`;
      }
      await w.expectBooksAdd(`step ${step}: ${what}`);
    }
  }, 60_000);
});
