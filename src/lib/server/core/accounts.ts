import { Prisma } from "@prisma/client";
import type { Db } from "./prisma";
import { AccountInput, AccountPatch } from "./schemas";
import {
  NotFoundError,
  type Account,
  type AccountState,
  type AccountTrajectory,
  type AccountWithBalance,
  type Balances,
} from "./types";

export function accountsRepo(db: Db) {
  /**
   * Balance = latest recorded state + confirmed transactions since then
   * (incoming minus outgoing). Same rule the legacy app used.
   */
  async function balanceOf(
    account: Account,
    asOf: Date = new Date(),
  ): Promise<number> {
    const state = await db.sourceState.findFirst({
      where: { sourceId: account.id, created: { lte: asOf } },
      orderBy: { created: "desc" },
    });
    const since: Prisma.TransactionWhereInput = {
      cancelled: false,
      transactedAt: state ? { gte: state.created, lte: asOf } : { lte: asOf },
    };
    const [incoming, outgoing] = await Promise.all([
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { ...since, targetId: account.id },
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { ...since, sourceId: account.id },
      }),
    ]);
    return (
      (state?.amount ?? 0) +
      (incoming._sum.amount ?? 0) -
      (outgoing._sum.amount ?? 0)
    );
  }

  const order: Prisma.SourceOrderByWithRelationInput[] = [
    { position: "asc" },
    { id: "asc" },
  ];

  return {
    list(): Promise<Account[]> {
      return db.source.findMany({ orderBy: order });
    },

    async listWithBalances(): Promise<AccountWithBalance[]> {
      const accounts = await db.source.findMany({ orderBy: order });
      return Promise.all(
        accounts.map(async (a) => ({ ...a, balance: await balanceOf(a) })),
      );
    },

    async balances(): Promise<Balances> {
      const accounts = await this.listWithBalances();
      const summary: Balances = { liquid: 0, total: 0, byType: {} };
      for (const a of accounts) {
        if (a.isOut) continue;
        summary.total += a.balance;
        if (a.isDisponible) summary.liquid += a.balance;
        summary.byType[a.type] = (summary.byType[a.type] ?? 0) + a.balance;
      }
      return summary;
    },

    /** Balance as it was (or, for future dates, is projected to be) at `asOf`. */
    async balanceAt(id: number, asOf: Date): Promise<number> {
      return balanceOf(await this.get(id), asOf);
    },

    /**
     * Closing balance of each of the last `months` calendar months, oldest
     * first. The current month closes "now"; `projectedMonthEnd` is the
     * balance expected once its scheduled transactions have happened.
     */
    async trajectory(
      id: number,
      months = 6,
      now: Date = new Date(),
    ): Promise<AccountTrajectory> {
      const account = await this.get(id);
      const points = await Promise.all(
        Array.from({ length: months }, async (_, i) => {
          const monthStart = new Date(
            now.getFullYear(),
            now.getMonth() - (months - 1 - i),
            1,
          );
          const monthEnd = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth() + 1,
            1,
          );
          const isCurrent = i === months - 1;
          return {
            monthStart,
            balance: await balanceOf(
              account,
              isCurrent ? now : new Date(monthEnd.getTime() - 1),
            ),
          };
        }),
      );
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return {
        points,
        projectedMonthEnd: await balanceOf(
          account,
          new Date(endOfMonth.getTime() - 1),
        ),
      };
    },

    async get(id: number): Promise<Account> {
      const account = await db.source.findUnique({ where: { id } });
      if (!account) throw new NotFoundError("Account", id);
      return account;
    },

    create(input: AccountInput): Promise<Account> {
      return db.source.create({ data: AccountInput.parse(input) });
    },

    async update(id: number, input: AccountPatch): Promise<Account> {
      try {
        return await db.source.update({
          where: { id },
          data: AccountPatch.parse(input),
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          throw new NotFoundError("Account", id);
        }
        throw e;
      }
    },

    /** Deletes the account together with its balance snapshots. */
    async remove(id: number): Promise<void> {
      try {
        await db.$transaction([
          db.sourceState.deleteMany({ where: { sourceId: id } }),
          db.source.delete({ where: { id } }),
        ]);
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          throw new NotFoundError("Account", id);
        }
        throw e;
      }
    },

    /** Record a point-in-time balance snapshot. */
    recordState(accountId: number, amount: number): Promise<AccountState> {
      return db.sourceState.create({ data: { sourceId: accountId, amount } });
    },
  };
}
