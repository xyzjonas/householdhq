import type { Prisma } from "@prisma/client";
import type { SourceType, Transaction } from "~/types";
import type {
  HomeBalance,
  HomeCategorySum,
  HomeImportant,
  HomePeriod,
  HomePortfolio,
  HomePortfolioGroup,
  HomeProjects,
  HomeSummary,
  HomeTransactionList,
  HomeTransactionsQuery,
  HomeUpcoming,
} from "~/types/home";
import {
  calendarMonthContaining,
  fiscalPeriodContaining,
  fiscalPeriodEndingIn,
  formatDay,
  parsePeriodKey,
  type FiscalPeriod,
} from "../utils/fiscal";
import { projectBalance } from "../utils/projection";
import { getSetting } from "./appSettings";
import { prisma } from "./prisma-client";

const TRANSACTION_INCLUDE = {
  category: true,
  source: true,
  target: true,
  tags: true,
  project: true,
} satisfies Prisma.TransactionInclude;

const LATEST_STATE = {
  states: { orderBy: { created: "desc" }, take: 1 },
} satisfies Prisma.SourceInclude;

const asTransactions = (rows: unknown) => rows as Transaction[];

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const latest = (date: Date, other: Date) => (date > other ? date : other);

const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Last day (`YYYY-MM-DD`) covered by an exclusive end instant. */
const lastDayBefore = (end: Date) => formatDay(new Date(end.getTime() - 1));

/**
 * Not yet settled transactions: either still to happen or happened but not
 * confirmed yet. They are not part of the account balances.
 */
const pendingWhere = (
  now: Date,
  until: Date,
): Prisma.TransactionWhereInput => ({
  cancelled: false,
  transactedAt: { lt: until },
  OR: [{ confirmed: false }, { transactedAt: { gt: now } }],
});

class Home {
  private async fiscalPeriodEndDay() {
    return await getSetting("fiscalPeriodEndDay");
  }

  /**
   * Resolves the requested fiscal period (current one when no key is given)
   * according to the configured fiscal period end day.
   */
  public async resolvePeriod(
    key: string | undefined,
    now = new Date(),
  ): Promise<{ period: FiscalPeriod; info: HomePeriod }> {
    const endDay = await this.fiscalPeriodEndDay();
    const current = fiscalPeriodContaining(now, endDay);
    const parsed = key ? parsePeriodKey(key) : undefined;
    const period = parsed
      ? fiscalPeriodEndingIn(parsed.year, parsed.monthIndex, endDay)
      : current;

    return {
      period,
      info: {
        key: period.key,
        startDay: period.startDay,
        endDay: period.endDay,
        prevKey: period.prevKey,
        nextKey: period.nextKey,
        isCurrent: period.key === current.key,
        fiscalPeriodEndDay: endDay,
      },
    };
  }

  /**
   * Current balance of an account: its last recorded state plus everything
   * settled since then.
   */
  private async accountBalance(
    accountId: number,
    lastState: { created: Date; amount: number } | undefined,
    now: Date,
  ) {
    const where: Prisma.TransactionWhereInput = {
      cancelled: false,
      confirmed: true,
      transactedAt: lastState
        ? { gt: lastState.created, lte: now }
        : { lte: now },
    };
    const [inflow, outflow] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...where, targetId: accountId },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...where, sourceId: accountId },
      }),
    ]);
    return (
      (lastState?.amount ?? 0) +
      (inflow._sum.amount ?? 0) -
      (outflow._sum.amount ?? 0)
    );
  }

  public async getBalance(now = new Date()): Promise<HomeBalance> {
    const endDay = await this.fiscalPeriodEndDay();
    const accounts = await prisma.source.findMany({
      where: { isDisponible: true },
      include: LATEST_STATE,
    });
    const accountIds = new Set(accounts.map((account) => account.id));

    const calendarMonth = calendarMonthContaining(now);
    const fiscalPeriod = fiscalPeriodContaining(now, endDay);
    const horizon = latest(calendarMonth.end, fiscalPeriod.end);

    const [balances, pending] = await Promise.all([
      Promise.all(
        accounts.map((account) =>
          this.accountBalance(account.id, account.states[0], now),
        ),
      ),
      accountIds.size === 0
        ? []
        : prisma.transaction.findMany({
            where: {
              AND: [
                pendingWhere(now, horizon),
                {
                  OR: [
                    { sourceId: { in: [...accountIds] } },
                    { targetId: { in: [...accountIds] } },
                  ],
                },
              ],
            },
            select: {
              amount: true,
              sourceId: true,
              targetId: true,
              transactedAt: true,
            },
          }),
    ]);

    const balance = sum(balances);
    const flows = pending.map((transaction) => ({
      ...transaction,
      at: transaction.transactedAt as Date,
    }));
    const projectionTo = (period: FiscalPeriod) => ({
      date: period.endDay,
      ...projectBalance(balance, flows, accountIds, period.end),
    });

    return {
      balance,
      calendarMonthEnd: projectionTo(calendarMonth),
      fiscalPeriodEnd: projectionTo(fiscalPeriod),
    };
  }

  public async getPortfolio(now = new Date()): Promise<HomePortfolio> {
    const sources = await prisma.source.findMany({
      where: { isPortfolio: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      include: LATEST_STATE,
    });

    const items = await Promise.all(
      sources.map(async (source) => {
        const lastState = source.states[0];
        return {
          id: source.id,
          name: source.name,
          color: source.color,
          type: source.type as SourceType,
          balance: await this.accountBalance(source.id, lastState, now),
          stale: !lastState || !isSameMonth(lastState.created, now),
        };
      }),
    );

    const groups = new Map<SourceType, HomePortfolioGroup>();
    for (const item of items) {
      const group = groups.get(item.type) ?? {
        type: item.type,
        total: 0,
        sources: [],
      };
      group.sources.push(item);
      group.total += item.balance;
      groups.set(item.type, group);
    }

    return { groups: [...groups.values()] };
  }

  public async getUpcoming(now = new Date()): Promise<HomeUpcoming> {
    const endDay = await this.fiscalPeriodEndDay();
    const horizon = latest(
      calendarMonthContaining(now).end,
      fiscalPeriodContaining(now, endDay).end,
    );

    const items = asTransactions(
      await prisma.transaction.findMany({
        where: { ...pendingWhere(now, horizon), isImportant: false },
        include: TRANSACTION_INCLUDE,
        orderBy: [{ transactedAt: "asc" }, { id: "asc" }],
      }),
    );

    return {
      until: lastDayBefore(horizon),
      count: items.length,
      expenseTotal: sum(
        items.filter((item) => !item.source.isOut).map((item) => item.amount),
      ),
      items,
    };
  }

  public async getImportant(): Promise<HomeImportant> {
    const items = asTransactions(
      await prisma.transaction.findMany({
        where: { isImportant: true, confirmed: false, cancelled: false },
        include: TRANSACTION_INCLUDE,
        orderBy: [{ transactedAt: "asc" }, { id: "asc" }],
      }),
    );
    return { items };
  }

  /** Settled, visible transactions of the period. */
  private settledInPeriod(
    period: FiscalPeriod,
    now: Date,
  ): Prisma.TransactionWhereInput {
    return {
      cancelled: false,
      confirmed: true,
      isHidden: false,
      transactedAt: { gte: period.start, lt: period.end, lte: now },
    };
  }

  public async getTransactions(
    query: HomeTransactionsQuery,
    now = new Date(),
  ): Promise<HomeTransactionList> {
    const { period } = await this.resolvePeriod(query.period, now);

    const where: Prisma.TransactionWhereInput = {
      ...this.settledInPeriod(period, now),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.kind ? { source: { isOut: query.kind === "income" } } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: TRANSACTION_INCLUDE,
        orderBy: [{ transactedAt: "desc" }, { id: "desc" }],
        take: query.limit,
        skip: query.offset,
      }),
    ]);

    return {
      total,
      limit: query.limit,
      offset: query.offset,
      items: asTransactions(items),
    };
  }

  private async categorySums(
    where: Prisma.TransactionWhereInput,
  ): Promise<HomeCategorySum[]> {
    const groups = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: groups.flatMap((group) =>
            group.categoryId === null ? [] : [group.categoryId],
          ),
        },
      },
    });
    const byId = new Map(categories.map((category) => [category.id, category]));

    return groups
      .map((group) => {
        const category =
          group.categoryId === null ? undefined : byId.get(group.categoryId);
        return {
          // 0 stands for transactions without a category
          id: category?.id ?? 0,
          name: category?.name ?? "",
          color: category?.color ?? null,
          description: category?.description ?? null,
          sum: group._sum.amount ?? 0,
          count: group._count._all,
        };
      })
      .sort((a, b) => b.sum - a.sum);
  }

  public async getSummary(
    periodKey: string | undefined,
    now = new Date(),
  ): Promise<HomeSummary> {
    const { period, info } = await this.resolvePeriod(periodKey, now);
    const where = this.settledInPeriod(period, now);

    const [incomeCategories, expenseCategories] = await Promise.all([
      this.categorySums({ ...where, source: { isOut: true } }),
      this.categorySums({ ...where, source: { isOut: false } }),
    ]);

    const income = sum(incomeCategories.map((category) => category.sum));
    const expense = sum(expenseCategories.map((category) => category.sum));

    return {
      period: info,
      income,
      expense,
      net: income - expense,
      incomeCategories,
      expenseCategories,
    };
  }

  public async getProjects(): Promise<HomeProjects> {
    const projects = await prisma.project.findMany({
      where: { isCompleted: false },
      orderBy: { id: "asc" },
      include: { _count: { select: { transactions: true } } },
    });

    return {
      items: projects.map((project) => ({
        id: project.id,
        name: project.name,
        color: project.color,
        transactionCount: project._count.transactions,
        total: project.estimate,
      })),
    };
  }
}

export default new Home();
